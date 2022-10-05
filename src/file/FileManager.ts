import fs from 'fs'
import path from 'path'

const tempPath = path.resolve('./temp')
const outputPath = path.resolve('./output')

export class FileManager {
    public getTempPath(filePath: string) {
        return path.join(tempPath, filePath)
    }

    public getOutputPath(filePath: string) {
        return path.join(outputPath, filePath)
    }

    public saveFile(filePath: string, data: Buffer) {
        fs.writeFileSync(filePath, data)
        return filePath
    }

    public deleteFile(filePath: string) {
        fs.unlinkSync(filePath)
        return filePath
    }

    public createOutput() {
        if (!fs.existsSync(outputPath))
            fs.mkdirSync(outputPath)
    }

    public createTemp() {
        if (!fs.existsSync(tempPath))
            fs.mkdirSync(tempPath)
    }

    public deleteTemp() {
        if (fs.existsSync(tempPath))
            fs.rmSync(tempPath, { recursive: true, force: true })
    }
}