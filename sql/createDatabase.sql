-- SQLite
DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS ApiKey;
CREATE TABLE Account (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    userId INTEGER,
    profileId INTEGER,
    deviceId VARCHAR(50),
    visitId VARCHAR(50)
);
CREATE TABLE ApiKey (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(50) NOT NULL
);
INSERT INTO ApiKey (key) VALUES ('508efd7b42d546e19cc24f4d0b414e57e351ca73');