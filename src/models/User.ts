export interface User {
    id: number,
    email: string,
    password: string,
    userId?: number,
    profileId?: number,
    deviceId?: string,
    visitId?: string
}