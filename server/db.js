const mysql = require('mysql2');
const dotenv = require('dotenv').config({ path: './.env' });



//variables need to change according to db 
 const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

conn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
 });

 module.exports = conn