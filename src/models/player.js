import db from "../../Dbconnection"

const PlayerPoint = {
    // Lấy toàn bộ dữ liệu của người chơi có Point Join lại với bảng cạnh nó để lấy được userName thay vì chỉ có Uuid
    getAllPointPlayer: (callback) => {
        return db.query("SELECT playerpoints_points.id, playerpoints_points.uuid, playerpoints_points.points, playerpoints_username_cache.username FROM playerpoints_points INNER JOIN playerpoints_username_cache ON playerpoints_points.uuid = playerpoints_username_cache.uuid", callback)
    },
    // Lấy dữ liệu người chơi theo UUid có Point 
    getPointPlayerById: (username, callback) => {
        return db.query(`SELECT playerpoints_points.id, playerpoints_points.uuid, playerpoints_points.points, playerpoints_username_cache.username FROM playerpoints_points
        INNER JOIN playerpoints_username_cache ON playerpoints_points.uuid=playerpoints_username_cache.uuid WHERE username=${username}`, callback)
    },
    updatePointByUuidPlayer: (info, callback) => {
        return db.query(`UPDATE playerpoints_points SET points=points+${info.amount} WHERE uuid="${info.content}"`, callback)
    },
    PostNapThe: (info, callback) => {
        return db.query(`UPDATE playerpoints_points SET points=points+${info.amount} WHERE id=2`, callback)
    },
}

export default PlayerPoint