import { Database } from 'better-sqlite3'
import { ApiKey } from '../models/ApiKey'

const createApiKeyStmt = `INSERT INTO ApiKey (key) VALUES (?)`
const deleteApiKeyStmt = `DELETE FROM ApiKey WHERE id = ?`
const getApiKeyStmt = `SELECT * FROM ApiKey WHERE id = ?`
const getAllStmt = `SELECT * FROM ApiKey`

export class ApiKeyDao {
    private readonly database: Database

    constructor(database: Database) {
        this.database = database
    }

    public deleteApiKey(id: number) {
        const stmt = this.database.prepare(deleteApiKeyStmt)
        return stmt.run(id)
    }

    public createApiKey(apiKey: Omit<ApiKey, 'id'>) {
        const stmt = this.database.prepare(createApiKeyStmt)
        return stmt.run(apiKey.key)
    }

    public getApiKey(id: number): ApiKey | undefined {
        const stmt = this.database.prepare(getApiKeyStmt)
        return stmt.get(id)
    }

    public getAll(): ApiKey[] {
        const stmt = this.database.prepare(getAllStmt)
        return stmt.all()
    }
}