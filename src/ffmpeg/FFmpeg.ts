import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import path from 'path'
import which from 'which';

export interface Subtitle {
    name: string,
    path: string
}

export interface Map {
    map: number
}

export class FFmpeg {
    public async convertSubtitle(filePath: string, data: Buffer, language: string) {
        const ffmpegBin = await this.getFFmpegBin();
        const process = spawn(ffmpegBin,
            [
                '-y',
                '-i', '-',
                '-map', '0',
                '-c', 'srt',
                '-metadata:s:0', `title="${language}"`,
                filePath
            ]
        )
        process.stdin.write(data)
        process.stdin.end()
        return this.promisifyClose(process, filePath)
    }

    public async convertVideo(filePath: string) {
        const ffmpegBin = await this.getFFmpegBin();
        const process = spawn(ffmpegBin,
            [
                '-y',
                '-i', '-',
                '-map', '0',
                '-c', 'copy',
                filePath
            ]
        )
        return {
            write: (data: Uint8Array) => process.stdin.write(data),
            end: () => this.promisifyClose(process, filePath)
        }
    }

    public async mergeVideoAndSubtitles(filePath: string, videoPath: string, subtitles: Subtitle[]) {
        let currentMap = 0
        const getNextMap = () => currentMap = currentMap + 1
        const subtitlesMaps: (Subtitle & Map)[] = subtitles.map(subtitle => {
            return {
                map: getNextMap(),
                name: subtitle.name,
                path: subtitle.path
            }
        })

        const ffmpegBin = await this.getFFmpegBin();
        const process = spawn(ffmpegBin,
            [
                '-y',
                '-i', videoPath,
                ...subtitlesMaps.flatMap((subtitle) => ['-i', `${subtitle.path}`]),
                '-map', '0',
                ...subtitlesMaps.flatMap((subtitle) => ['-map', `${subtitle.map}`]),
                '-c', 'copy',
                ...subtitlesMaps.flatMap((subtitle) => [`-metadata:s:s:${subtitle.map - 1}`, `title=${subtitle.name}`]),
                filePath
            ]
        )
        return this.promisifyClose(process, filePath)
    }

    private async promisifyClose<T = void>(process: ChildProcessWithoutNullStreams, value?: T) {
        return new Promise<T>((res) => {
            process.stdin.end()
            return process.on('close', () => res(value as any))
        })
    }
    
    private async getFFmpegBin(): Promise<string> {
        const ffmpegPath = await which('ffmpeg');

        return ffmpegPath ?? path.resolve('./ffmpeg/ffmpeg.exe');
    }
}