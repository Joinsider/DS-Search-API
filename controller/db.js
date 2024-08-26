const sqlite3 = require('sqlite3');

function initDB() {
    console.log("Initializing database");
    const db = new sqlite3.Database('./cache.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err && err.code === "SQLITE_CANTOPEN") {
            console.log("Database not found, creating new database");
            return createDatabase();
        } else if (err) {
            console.log("Getting error " + err);
            process.exit(1);
        }
    });
    checkDBSchema(db);
    return db;
}

function closeDB(db) {
    db.close((err) => {
        if (err) {
            console.log("Getting error " + err);
            process.exit(1);
        }
    });
}

const createAuthTable = `
    CREATE TABLE IF NOT EXISTS auth (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        otp_required INTEGER NOT NULL
    )
`;

const createConnectionTable = `
    CREATE TABLE IF NOT EXISTS connections (
        cid INTEGER PRIMARY KEY AUTOINCREMENT,
        uid INTEGER NOT NULL,
        hostname TEXT NOT NULL,
        port INTEGER,
        secure INTEGER NOT NULL,
        checkTLS INTEGER NOT NULL,
        FOREIGN KEY (uid) REFERENCES auth(uid)
    )
`



function createDatabase() {
    var newdb = new sqlite3.Database('cache.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
        }
        createTables(newdb);
    });
    return newdb;
}

function checkDBSchema(db) {
    console.log("Checking database schema");
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='auth'", (err, row) => {
        if (err) {
            console.log("Getting error " + err);
            process.exit(1);
        }
        if (!row) {
            console.log("Table auth not found");
            createTables(db);
        }
    });
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='connections'", (err, row) => {
        if (err) {
            console.log("Getting error " + err);
            process.exit(1);
        }
        if (!row) {
            console.log("Table connections not found");
            createTables(db);
        }
    });
    console.log("Database schema checked");
    return true;
}

function createTables(newdb) {
    console.log("Creating tables");
    newdb.run(createAuthTable, (err) => {
        if (err) {
            console.log("Getting error " + err);
            process.exit(1);
        }
    });
    newdb.run(createConnectionTable, (err) => {
        if (err) {
            console.log("Getting error " + err);
            process.exit(1);
        }
    });
    console.log("Database created");
}

// API Request to DB

function insertAuth(db, username, password, otp_required) {
    db.run("INSERT INTO auth (username, password, otp_required) VALUES (?, ?, ?)", [username, password, otp_required], (err) => {
        if (err) {
            console.log("Getting error " + err);
            return false;
        }
        return true;
    });
}




module.exports = {
    initDB,
    checkDBSchema,


    insertAuth
}