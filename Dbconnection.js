import mysql from "mysql";
import dotenv from "dotenv"
dotenv.config()

var connection = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
});

connection.getConnection(function (error) {
    if (error) throw error;
    console.log("Kết nối thành công đến Database");
});


export default connection