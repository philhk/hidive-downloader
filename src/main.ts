import { HidiveDao, Resolution } from './api/HidiveDao.js'
import { CliHandler } from './cli/CliHandler.js'
import { ApiKeyDao } from './database/ApiKeyDao.js'
import { createDatabase } from './database/Database.js'
import { AccountDao } from './database/AccountDao.js'
import { FFmpeg, Subtitle } from './ffmpeg/FFmpeg.js'
import { HslManager } from './hsl/HslManager.js'
import { FileManager } from './file/FileManager.js'
import async from 'async'
import cliProgress from 'cli-progress'

const database = createDatabase()
const accountDao = new AccountDao(database)
const apiKeyDao = new ApiKeyDao(database)
const cliHandler = new CliHandler()
const ffmpeg = new FFmpeg()
const hslManager = new HslManager()
const fileManager = new FileManager()

fileManager.createOutput()
fileManager.deleteTemp()

while (true) {
    console.clear()
    const userAction = await cliHandler.promptActions([
        {
            message: 'Login',
            value: 'login'
        },
        {
            message: 'Add API key',
            value: 'addApiKey'
        },
        {
            message: 'Delete API key',
            value: 'deleteApiKey'
        },
        {
            message: 'Add account',
            value: 'addAccount'
        },
        {
            message: 'Delete account',
            value: 'deleteAccount'
        }
    ])

    switch (userAction) {
        case 'login': {
            await hidiveAction()
            break
        }
        case 'addApiKey': {
            await addApiKey()
            break
        }
        case 'deleteApiKey': {
            await deleteApiKey()
            break
        }
        case 'addAccount': {
            await addAccount()
            break
        }
        case 'deleteAccount': {
            await deleteAccount()
            break
        }
    }
}


async function hidiveAction() {
    const hidiveDao = await login()
    try {
        const pingRes = await hidiveDao.ping()
        const initDeviceRes = await hidiveDao.initDevice()
        const initVisitRes = await hidiveDao.initVisit()
        const authenticateRes = await hidiveDao.authenticate()

        if (!hidiveDao.user || !hidiveDao.profile)
            throw new Error(`Failed to authenticate response returned code ${authenticateRes.Code} with status ${authenticateRes.Status}`)

        accountDao.updateAccount(hidiveDao.options.user.id, {
            ...hidiveDao.options.user,
            deviceId: initDeviceRes.Data.DeviceId,
            userId: hidiveDao.user.Id,
            profileId: hidiveDao.profile.Id,
            visitId: initVisitRes.Data.VisitId
        })

        console.log(`Successfully logged into ${hidiveDao.profile.Nickname}`)
    } catch (error) {
        console.error(error)
        return
    }

    while (true) {
        console.clear()
        const hidiveAction = await cliHandler.promptActions([
            {
                message: 'Download a series',
                value: 'download'
            },
            {
                message: 'Return',
                value: 'return'
            }
        ])

        switch (hidiveAction) {
            case 'download': {
                await downloadSeries(hidiveDao)
                break
            }
            case 'return': {
                return
            }
        }
    }
}

async function login() {
    console.clear()
    let users = accountDao.getAll()
    let apiKeys = apiKeyDao.getAll()

    if (apiKeys.length <= 0) {
        const apiKey = await cliHandler.promptGetApiKey()
        apiKeyDao.createApiKey(apiKey)
        apiKeys = apiKeyDao.getAll()
    }

    if (users.length <= 0) {
        const user = await cliHandler.promptGetAuth()
        accountDao.createAccount(user)
        users = accountDao.getAll()
    }

    const user = await cliHandler.promptUserList(users)
    const apiKey = await cliHandler.promptApiKey(apiKeys)

    const hidiveDao = new HidiveDao({
        apiKey: apiKey,
        user: user
    })

    return hidiveDao
}

async function deleteApiKey() {
    const apiKey = await cliHandler.promptApiKey(apiKeyDao.getAll())
    const confirmed = await cliHandler.promptConfirm('Do you really want to delete this API key?')
    if (confirmed)
        apiKeyDao.deleteApiKey(apiKey.id)
}

async function addApiKey() {
    const apiKey = await cliHandler.promptGetApiKey()
    apiKeyDao.createApiKey(apiKey)
}

async function deleteAccount() {
    const account = await cliHandler.promptUserList(accountDao.getAll())
    const confirmed = await cliHandler.promptConfirm('Do you really want to delete this account?')
    if (confirmed)
        accountDao.deleteAccount(account.id)
}

async function addAccount() {
    const account = await cliHandler.promptGetAuth()
    accountDao.createAccount(account)
}

async function downloadSeries(hidiveDao: HidiveDao) {
    console.clear()
    const searchQuery = await cliHandler.promptInput('What\'s your series called?')
    const searchResultsRes = await hidiveDao.search(searchQuery)

    if (searchResultsRes.Data.TitleResults.length <= 0) {
        console.log(`Oh no! No series named ${searchQuery} or similar was found.`)

        const retry = await cliHandler.promptConfirm('Do you want to search again?')
        if (retry)
            await downloadSeries(hidiveDao)
        return
    }

    const selectedSeries = await cliHandler.promptSeriesList(searchResultsRes.Data.TitleResults)
    const getTitleRes = await hidiveDao.getTitle(selectedSeries.Id)
    const checkedEpisodes = await cliHandler.promptEpisodesList(getTitleRes.Data.Title.Episodes)
    const concurrentDownloads = await cliHandler.promptConcurrentDownloads()
    if (checkedEpisodes.length <= 0)
        return

    let standardVideoLanguage: string | undefined
    let standardMediaResolution: Resolution | undefined
    let resolveVideoLanguage: (language: string) => void
    let resolveMediaResolution: (resolution: Resolution) => void
    const videoLanguagePromise = new Promise(res => resolveVideoLanguage = (language) => {
        standardVideoLanguage = language,
            res(undefined)
    })
    const mediaResolutionPromise = new Promise(res => resolveMediaResolution = (resolution) => {
        standardMediaResolution = resolution,
            res(undefined)
    })

    const keys: { [key: string]: Uint8Array } = {}

    const multiBar = new cliProgress.MultiBar({
        clearOnComplete: true,
        format: '{bar} | {value}/{total} | {download} Mb/s | {episode}'
    }, cliProgress.Presets.rect)

    await async.eachLimit(checkedEpisodes, concurrentDownloads, async (episode) => {
        fileManager.createTemp()
        const getVideoRes = await hidiveDao.getVideos(episode.TitleId, episode.VideoKey)

        const { Data } = getVideoRes
        const { VideoLanguages, CaptionLanguages, VideoUrls, CaptionVttUrls, FontSize, VideoLanguage } = Data

        if (!standardVideoLanguage && checkedEpisodes.indexOf(episode) === 0) {
            resolveVideoLanguage(await cliHandler.promptVideoLanguage(VideoLanguages))
        }
        await videoLanguagePromise

        let videoLanguage = standardVideoLanguage
        let videoUrl = VideoUrls[standardVideoLanguage || '']
        if (!videoUrl) {
            videoUrl = VideoUrls[VideoLanguage]
            videoLanguage = VideoLanguage
        }

        const mediaSourcesRes = await hidiveDao.getMediaSources(videoUrl.hls[0])

        if (!standardMediaResolution && checkedEpisodes.indexOf(episode) === 0) {
            resolveMediaResolution(await cliHandler.promptResolutionFromMedia(mediaSourcesRes.playlists.map(playlist => playlist.attributes)))
            console.clear()
        }
        await mediaResolutionPromise

        let videoResolution = standardMediaResolution
        let playlist = mediaSourcesRes.playlists.find(playlist => playlist.attributes.RESOLUTION === standardMediaResolution)
        if (!playlist) {
            videoResolution = mediaSourcesRes.playlists[0].attributes.RESOLUTION
            playlist = mediaSourcesRes.playlists[0]
        }

        const episodeFileName = Array.from(`[E${`${episode.EpisodeNumberValue}`.padStart(2, '0')}S${`${episode.SeasonNumber}`.padStart(2, '0')}] ${selectedSeries.Name} - ${episode.Name} [${videoResolution?.height}p] [${videoLanguage}]`.matchAll(/[^/./\\:*?\"<>|]/g)).join('')
        const mediasRes = await hidiveDao.getMedia(playlist.uri)
        const tempEpisodePath = fileManager.getTempPath(`${episodeFileName}.mkv`)
        const episodePath = fileManager.getOutputPath(`${episodeFileName}.mkv`)

        const ffmpegConvertVideoProcess = ffmpeg.convertVideo(tempEpisodePath)

        const bar = multiBar.create(mediasRes.segments.length, 0, { download: 0, episode: `${selectedSeries.Name} - ${episode.Name}` })

        const startTime = Date.now()
        let bytesDownloaded = 0
        let segmentsDownloaded = 0

        for (const segment of mediasRes.segments) {
            let segmentData = await hidiveDao.getTs(segment.uri)

            if (segment.key) {
                const { uri, iv } = segment.key

                let key = keys[uri]
                if (!key)
                    key = keys[uri] = await hidiveDao.getKey(uri)

                segmentData = hslManager.decrypt(segmentData, key, iv)
            }

            bytesDownloaded += segmentData.byteLength
            segmentsDownloaded++
            ffmpegConvertVideoProcess.write(segmentData)
            bar.update(segmentsDownloaded, { download: ((bytesDownloaded / 1000000) / ((Date.now() - startTime) / 1000)).toFixed(2), episode: `${selectedSeries.Name} - ${episode.Name}` })
        }
        await ffmpegConvertVideoProcess.end()

        const subtitles: {
            name: string,
            value: Buffer
        }[] = await Promise.all(Object.entries(CaptionVttUrls)
            .map(async ([name, url]) => {
                return {
                    name,
                    value: Buffer.from(await hidiveDao.getSub(url))
                }
            }))

        const subtitlePaths: Subtitle[] = await Promise.all(subtitles
            .map(async (subtitle) => {
                return {
                    name: subtitle.name,
                    path: await ffmpeg
                        .convertSubtitle(fileManager
                            .getTempPath(`${episodeFileName}[${subtitle.name}].srt`), subtitle.value, subtitle.name)
                }
            }))

        await ffmpeg.mergeVideoAndSubtitles(episodePath, tempEpisodePath, subtitlePaths)
    })
    fileManager.deleteTemp()
}

export { }