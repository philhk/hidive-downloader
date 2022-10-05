import { Database } from 'better-sqlite3'
import { User } from '../models/User'

const createUserStmt = `INSERT INTO Account (email, password, userId, profileId, deviceId, visitId) VALUES (?, ?, ?, ?, ?, ?)`
const deleteUserStmt = `DELETE FROM Account WHERE id = ?`
const getUserStmt = `SELECT * FROM Account WHERE id = ?`
const updateUserStmt = `UPDATE Account SET email = ?, password = ?, userId = ?, profileId = ?, deviceId = ?, visitId = ? WHERE id = ?`
const getAllStmt = `SELECT * FROM Account`

export class AccountDao {
    private readonly database: Database

    constructor(database: Database) {
        this.database = database
    }

    public deleteAccount(id: number) {
        const stmt = this.database.prepare(deleteUserStmt)
        return stmt.run(id)
    }

    public createAccount(user: Omit<User, 'id'>) {
        const stmt = this.database.prepare(createUserStmt)
        return stmt.run(user.email, user.password, user.userId, user.profileId, user.deviceId, user.visitId)
    }

    public getAccount(id: number): User | undefined {
        const stmt = this.database.prepare(getUserStmt)
        return stmt.get(id)
    }

    public updateAccount(id: number, user: User) {
        const stmt = this.database.prepare(updateUserStmt)
        return stmt.run(user.email, user.password, user.userId, user.profileId, user.deviceId, user.visitId, id)
    }

    public getAll(): User[] {
        const stmt = this.database.prepare(getAllStmt)
        return stmt.all()
    }
}