// Put your database code here
//strict prevents silent errors
"use strict";

const Database = require('better-sqlite3');
//connect to a data base or create a bew one
const db = new Database('log.db');

//is db initialized or should we do it
const stmt = db.prepare(`
SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);

let row = stmt.get();

if(row === undefined){
    console.log('your databse is empty, I will initialize one');



const sqlInit = `
CREATE TABLE accesslog ( id INTEGER PRIMARY KEY, remoteaddr TEXT, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT, httpversion TEXT, status TEXT, referer TEXT, useragent TEXT);

`;

db.exec(sqlInit);

console.log('Your database has been initialized with some logs.');
}


else{
    console.log('Database exists')
}



module.exports = db