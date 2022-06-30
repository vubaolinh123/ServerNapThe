import mysql from "mysql";

var connection = mysql.createPool({
    host: 'localhost',
    user: 'playerpoints',
    password: '2182002',
    database: 'chung_playerpoint',
    multipleStatements: true
});




export default connection