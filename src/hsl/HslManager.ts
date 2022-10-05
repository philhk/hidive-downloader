import crypto from 'crypto'

export class HslManager {
    public decrypt(data: NodeJS.ArrayBufferView, key: Uint8Array, iv: Uint32Array) {
        const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
        return cipher.update(data)
    }
}