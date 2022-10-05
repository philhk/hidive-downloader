import path from 'path'
import Database from 'better-sqlite3'

export function createDatabase() {
    return new Database(path.resolve('./db/database.db'), { fileMustExist: false })
}