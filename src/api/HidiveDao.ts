import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosInterceptorManager } from "axios"
import crypto from 'crypto'
import { ApiKey } from "../models/ApiKey"
import { User } from "../models/User"
//@ts-expect-error
import { Parser } from 'm3u8-parser'

export interface Manifest<T = unknown, D = unknown> {
    allowCache: boolean,
    endList: boolean,
    mediaSequence: number,
    discontinuitySequence: number,
    playlistType: string,
    custom: {},
    playlists: [
        {
            attributes: T,
            uri: string
        }
    ],
    mediaGroups: {
        AUDIO: {
            'GROUP-ID': {
                NAME: {
                    default: boolean,
                    autoselect: boolean,
                    language: string,
                    uri: string,
                    instreamId: string,
                    characteristics: string,
                    forced: boolean
                }
            }
        },
        VIDEO: {},
        'CLOSED-CAPTIONS': {},
        SUBTITLES: {}
    },
    dateTimeString: string,
    dateTimeObject: Date,
    targetDuration: number,
    totalDuration: number,
    discontinuityStarts: [number],
    segments: [
        {
            byterange: {
                length: number,
                offset: number
            },
            duration: number,
            attributes: {},
            discontinuity: number,
            uri: string,
            timeline: number,
            key: {
                method: string,
                uri: string,
                iv: string
            },
            map: {
                uri: string,
                byterange: {
                    length: number,
                    offset: number
                }
            },
            'cue-out': string,
            'cue-out-cont': string,
            'cue-in': string,
            custom: {}
        } & D
    ]
}

export const BASEROUTE = 'https://api.hidive.com/api/v1'
export const ROUTES = {
    ping: () => `${BASEROUTE}/Ping`,
    initDevice: () => `${BASEROUTE}/InitDevice`,
    initVisit: () => `${BASEROUTE}/InitVisit`,
    getGlobalSettings: () => `${BASEROUTE}/GetGlobalSettings`,
    authenticate: () => `${BASEROUTE}/Authenticate`,
    getDashboard: () => `${BASEROUTE}/GetDashboard`,
    getTitle: () => `${BASEROUTE}/GetTitle`,
    getMightLike: () => `${BASEROUTE}/GetMightLike`,
    getVideos: () => `${BASEROUTE}/GetVideos`,
    startVideo: () => `${BASEROUTE}/StartVideo`,
    search: () => `${BASEROUTE}/Search`,
}

export interface RequiredHidiveDaoOptions {
    user: User,
    apiKey: ApiKey
}
export interface OptionalHidiveDaoOptions {

}
export type HidiveDaoOptions = RequiredHidiveDaoOptions & OptionalHidiveDaoOptions
export type UserHidiveDaoOptions = RequiredHidiveDaoOptions & Partial<OptionalHidiveDaoOptions>

export interface RESTApiStandardResponseBody<T = any> {
    Code: number,
    Status: string,
    Message: string | null,
    Messages: any,
    Data: T,
    Timestamp: string,
    IPAddress: string
}

export interface RESTApiPostPingResponseBodyData {

}

export interface RESTApiPostPingResponseBody extends RESTApiStandardResponseBody<RESTApiPostPingResponseBodyData> {

}

export interface RESTApiPostInitDeviceRequestBody {
    DeviceName: string,
    DeviceProfile?: {
        DeviceType: number,
        HardwareModel: number,
        HardwareName: number,
        HardwareVendor: number,
        PlatformVendor: number,
        PlatformVersion: number
    },
    MacAddress?: string
}

export interface RESTApiPostInitDeviceResponseBodyData {
    DeviceId: string,
    VisitId: string
}

export interface RESTApiPostInitDeviceResponseBody extends RESTApiStandardResponseBody<RESTApiPostInitDeviceResponseBodyData> {

}

export interface RESTApiUser {
    Id: number,
    Email: null | string,
    CountryCode: null | string,
    CountryName: null | string,
    ServiceLevel: string,
    NextBillDate: null | string
}

export interface RESTApiProfile {
    Id: number,
    Primary: boolean,
    Nickname: string,
    PinEnabled: boolean,
    AvatarJPGUrl: string,
    AvatarPNGUrl: string,
    AllowMatureContent: boolean,
    PreferSubsOverDubs: boolean,
    PreferredLanguage: string,
    PreferredSubtitleColor: number
}

export interface RESTApiPostInitVisitResponseBodyData {
    VisitId: string,
    User: RESTApiUser,
    Profiles: RESTApiProfile[]
}

export interface RESTApiPostInitVisitResponseBody extends RESTApiStandardResponseBody<RESTApiPostInitVisitResponseBodyData> {

}

export interface RESTApiPostAuthenticateRequestBody {
    Email: string,
    Password: string
}

export interface RESTApiPostAuthenticateResponseBodyData {
    VisitId: string,
    User: RESTApiUser,
    Profiles: RESTApiProfile[]
}

export interface RESTApiPostAuthenticateResponseBody extends RESTApiStandardResponseBody<RESTApiPostAuthenticateResponseBodyData> {

}

export interface RESTApiPostGetTitleRequestBody {
    Id: number
}

export interface RESTApiEpisode {
    Id: number,
    Number: number,
    Name: string,
    Summary: string,
    HIDIVEPremiereDate: string,
    ScreenShotSmallUrl: string,
    ScreenShotCompressedUrl: string,
    SeasonNumber: number,
    TitleId: number,
    SeasonNumberValue: number,
    EpisodeNumberValue: number,
    VideoKey: string,
    DisplayNameLong: string,
    PercentProgress: number,
    LoadTime: number
}

export interface RESTApiTitle {
    Id: number,
    Name: string,
    ShortSynopsis: string,
    MediumSynopsis: string,
    LongSynopsis: string,
    KeyArtUrl: string,
    MasterArtUrl: string,
    Rating: string,
    OverallRating: number,
    RatingCount: number,
    MALScore: string,
    UserRating: number,
    RunTime: number,
    ShowInfoTitle: string,
    FirstPremiereDate: string,
    EpisodeCount: number,
    SeasonName: string,
    RokuHDArtUrl: string,
    RokuSDArtUrl: string,
    IsRateable: boolean,
    InQueue: boolean,
    IsFavorite: boolean,
    IsContinueWatching: boolean,
    ContinueWatching: null | boolean,
    Episodes: RESTApiEpisode[],
    LoadTime: number
}

export interface RESTApiPostGetTitleResponseBodyData {
    Title: RESTApiTitle
}

export interface RESTApiPostGetTitleResponseBody extends RESTApiStandardResponseBody<RESTApiPostGetTitleResponseBodyData> {

}



export const defaultHidiveDaoOptions: OptionalHidiveDaoOptions & Partial<RequiredHidiveDaoOptions> = {

}

export interface RESTApiPostGetVideosRequestBody {
    TitleId: number,
    VideoKey: string
}

export interface RESTApiPostGetVideosResponseBodyData {
    ShowAds: boolean,
    CaptionCssUrl: string,
    FontSize: number,
    FontScale: number,
    CaptionLanguages: string[],
    CaptionLanguage: string,
    CaptionVttUrls: {
        [key: string]: string
    }
    VideoLanguages: string[],
    VideoLanguage: string,
    VideoUrls: {
        [key: string]: {
            hls: string[],
            drm: string[],
            drmEnabled: boolean
        }
    },
    FontColorName: string,
    AutoPlayNextEpisode: boolean,
    MaxStreams: number,
    CurrentTime: number,
    FontColorCode: string,
    RunTime: number,
    AdUrl: null | string
}

export interface RESTApiPostGetVideosResponseBody extends RESTApiStandardResponseBody<RESTApiPostGetVideosResponseBodyData> {

}

export interface RESTApiPostSearchRequestBody {
    Query: string
}

export interface RESTApiPostSearchResponseBodyData {
    Query: string,
    Slug: string,
    TitleResults: RESTApiTitle[],
    SearchId: number,
    IsSearchedPinned: boolean,
    IsPinnedSearchAvailable: boolean
}

export interface RESTApiPostSearchResponseBody extends RESTApiStandardResponseBody<RESTApiPostSearchResponseBodyData> {

}

export interface Resolution {
    width: number,
    height: number
}

export interface RESTApiMediaSource {
    'program-Id': number,
    BANDWIDTH: number,
    RESOLUTION: Resolution,
    CODECS: string[],
}

export interface RESTApiMedia {
    duration: number,
    uri: string,
    key: {
        method: string,
        uri: string,
        iv: Uint32Array
    },
    timeline: number
}

export type RESTApiResponse =
    Partial<Omit<
        & RESTApiPostGetVideosResponseBody
        & RESTApiPostAuthenticateResponseBody
        & RESTApiPostPingResponseBody
        & RESTApiPostGetTitleResponseBody
        & RESTApiPostInitDeviceResponseBody
        & RESTApiPostInitVisitResponseBody, 'Data'>>
    & Omit<RESTApiStandardResponseBody, 'Data'>
    & {
        Data: Partial<
            & RESTApiPostGetVideosResponseBodyData
            & RESTApiPostAuthenticateResponseBodyData
            & RESTApiPostPingResponseBodyData
            & RESTApiPostGetTitleResponseBodyData
            & RESTApiPostInitDeviceResponseBodyData
            & RESTApiPostInitVisitResponseBodyData>
    }

export interface XHeadersHidive {
    'X-Applicationid': string,
    'X-Deviceid': string,
    'X-Nonce': string,
    'X-Profileid': number,
    'X-Signature': string,
    'X-Userid': number,
    'X-Visitid': string
}

export const defaultXHeadersHidive: XHeadersHidive = {
    "X-Applicationid": '24i-Android',
    "X-Profileid": 0,
    "X-Userid": 0,
    "X-Deviceid": '',
    "X-Nonce": '',
    "X-Signature": '',
    "X-Visitid": ''
}

export class HidiveDao {
    private readonly axios: AxiosInstance
    public readonly options: HidiveDaoOptions
    private readonly axiosOptions: AxiosRequestConfig<any>
    private xHeadersHidive: XHeadersHidive
    public user?: RESTApiUser
    public profile?: RESTApiProfile
    private ipAddress?: string
    private cookie: { [key: string]: string } = {}

    constructor(options: UserHidiveDaoOptions) {
        this.options = {
            ...defaultHidiveDaoOptions,
            ...options
        }
        this.xHeadersHidive = {
            ...defaultXHeadersHidive,
            ...(this.options.user.userId ? { "X-Userid": this.options.user.userId } : {}),
            ...(this.options.user.profileId ? { "X-Profileid": this.options.user.profileId } : {}),
            ...(this.options.user.deviceId ? { "X-Deviceid": this.options.user.deviceId } : {}),
            ...(this.options.user.visitId ? { "X-Visitid": this.options.user.visitId } : {})
        }
        this.axiosOptions = {
            headers: {
                'accept-encoding': 'gzip, deflate, br',
                'user-agent': 'okhttp/3.12.1',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        }
        this.axios = axios.create({
            ...this.axiosOptions
        })
        this.setInterceptors()
    }

    private setInterceptors() {
        this.axios.interceptors.request.use((config) => {
            const { data } = config

            this.xHeadersHidive["X-Nonce"] = this.generateNonce()
            this.xHeadersHidive["X-Signature"] = this.generateSignature(data)
            config.headers = {
                ...config.headers,
                'X-Applicationid': this.xHeadersHidive["X-Applicationid"],
                'X-Deviceid': this.xHeadersHidive["X-Deviceid"],
                'X-Nonce': this.xHeadersHidive["X-Nonce"],
                'X-Profileid': this.xHeadersHidive["X-Profileid"],
                'X-Signature': this.xHeadersHidive["X-Signature"],
                'X-Userid': this.xHeadersHidive["X-Userid"],
                'X-Visitid': this.xHeadersHidive["X-Visitid"],
                ...(Object.entries(this.cookie).length > 0 ? { cookie: Object.entries(this.cookie).map(cookie => `${cookie[0]}=${cookie[1]}`).join('; ') } : {})
            }

            return config
        });


        (this.axios.interceptors.response as AxiosInterceptorManager<AxiosResponse<RESTApiResponse>>).use((res) => {
            const { data, headers, config } = res
            if (headers["set-cookie"]) {
                this.cookie = {
                    ...this.cookie,
                    ...Object.assign({}, ...headers["set-cookie"].map(cookie => {
                        const [name, value] = cookie.split(';')[0].split('=')
                        return {
                            [name]: value
                        }
                    }))
                }
            }

            if (config.url?.startsWith(BASEROUTE) && data.Data) {
                const { IPAddress } = data

                if (data.Data.User)
                    this.user = data.Data.User

                if (data.Data.Profiles && data.Data.Profiles.length > 0)
                    this.profile = data.Data.Profiles.find(profile => profile.Primary) || data.Data.Profiles[0]

                if (IPAddress)
                    this.ipAddress = IPAddress

                this.xHeadersHidive = {
                    ...this.xHeadersHidive,
                    ...(data.Data.DeviceId ? { "X-Deviceid": data.Data.DeviceId } : {}),
                    ...(data.Data.VisitId ? { "X-Visitid": data.Data.VisitId } : {}),
                    ...(this.user ? { "X-Userid": this.user.Id } : {}),
                    ...(this.profile ? { "X-Profileid": this.profile.Id } : {}),
                }

                if (data.Code !== 0 || data.Status !== 'Success') {
                    return Promise.reject(new Error(`Response returned code ${data.Code} with status ${data.Status}`))
                }
            }

            return res
        })
    }

    private generateNonce() {
        const initDate = new Date();
        const nonceDate = [
            initDate.getUTCFullYear().toString().slice(-2),
            ('0' + (initDate.getUTCMonth() + 1)).slice(-2),
            ('0' + initDate.getUTCDate()).slice(-2),
            ('0' + initDate.getUTCHours()).slice(-2),
            ('0' + initDate.getUTCMinutes()).slice(-2)
        ].join('');
        const nonceCleanStr = nonceDate + this.options.apiKey.key;
        const nonceHash = crypto.createHash('sha256').update(nonceCleanStr).digest('hex');
        return nonceHash;
    }

    private generateSignature(requestBody: any) {
        const sigCleanStr = [
            this.ipAddress,
            this.xHeadersHidive["X-Applicationid"],
            this.xHeadersHidive["X-Deviceid"],
            this.xHeadersHidive["X-Visitid"],
            this.xHeadersHidive["X-Userid"],
            this.xHeadersHidive["X-Profileid"],
            JSON.stringify(requestBody),
            this.xHeadersHidive["X-Nonce"],
            this.options.apiKey.key,
        ].join('');
        return crypto.createHash('sha256').update(sigCleanStr).digest('hex');
    }

    public async ping() {
        return (await this.axios.post<RESTApiPostPingResponseBody>(ROUTES.ping())).data
    }

    public async initDevice() {
        return (await this.axios.post<RESTApiPostInitDeviceResponseBody, AxiosResponse<RESTApiPostInitDeviceResponseBody>, RESTApiPostInitDeviceRequestBody>(ROUTES.initDevice(), {
            DeviceName: 'Android'
        })).data
    }

    public async initVisit() {
        return (await this.axios.post<RESTApiPostInitVisitResponseBody>(ROUTES.initVisit(), {

        })).data
    }

    public async authenticate() {
        return (await this.axios.post<RESTApiPostAuthenticateResponseBody, AxiosResponse<RESTApiPostAuthenticateResponseBody>, RESTApiPostAuthenticateRequestBody>(ROUTES.authenticate(), {
            Email: this.options.user.email,
            Password: this.options.user.password
        })).data
    }

    public async getTitle(id: number) {
        return (await this.axios.post<RESTApiPostGetTitleResponseBody, AxiosResponse<RESTApiPostGetTitleResponseBody>, RESTApiPostGetTitleRequestBody>(ROUTES.getTitle(), {
            Id: id
        })).data
    }

    public async getVideos(titleId: number, VideoKey: string) {
        return (await this.axios.post<RESTApiPostGetVideosResponseBody, AxiosResponse<RESTApiPostGetVideosResponseBody>, RESTApiPostGetVideosRequestBody>(ROUTES.getVideos(), {
            TitleId: titleId,
            VideoKey: VideoKey
        })).data
    }

    public async search(query: string) {
        return (await this.axios.post<RESTApiPostSearchResponseBody, AxiosResponse<RESTApiPostSearchResponseBody>, RESTApiPostSearchRequestBody>(ROUTES.search(), {
            Query: query
        })).data
    }

    public async getMedia(mediaUrl: string): Promise<Manifest<unknown, RESTApiMedia>> {
        const parser = new Parser()
        parser.push((await this.axios.get<string>(mediaUrl)).data)
        parser.end()
        return parser.manifest
    }

    public async getMediaSources(mediaSourceUrl: string): Promise<Manifest<RESTApiMediaSource>> {
        const parser = new Parser()
        parser.push((await this.axios.get<string>(mediaSourceUrl)).data)
        parser.end()
        return parser.manifest
    }

    public async getTs(tsUrl: string): Promise<Uint8Array> {
        return (await this.axios.get(tsUrl, {
            headers: {
                'accept-encoding': 'identity',
                'user-agent': 'smartexoplayer/1.9.20.R (Linux;Android 9) ExoPlayerLib/2.7.2'
            },
            responseType: 'arraybuffer'
        })).data
    }

    public async getKey(keyUrl: string): Promise<Uint8Array> {
        return (await this.axios.get(keyUrl, {
            headers: {
                'user-agent': 'smartexoplayer/1.9.20.R (Linux;Android 9) ExoPlayerLib/2.7.2'
            },
            responseType: 'arraybuffer'
        })).data
    }

    public async getSub(subUrl: string): Promise<string> {
        return (await this.axios.get(subUrl, {
            headers: {
                'user-agent': 'smartexoplayer/1.9.20.R (Linux;Android 9) ExoPlayerLib/2.7.2'
            }
        })).data
    }
}