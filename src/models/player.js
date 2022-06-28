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
    // Khi người chơi bấm nút Nạp thẻ, thông tin người chơi sẽ lưu lại để sau 30s sẽ check trạng thái nạp Thành Công, Thất Bại, Sai Thẻ,...
    AddPlayerNapThe: (info, callback) => {
        return db.query(`Insert into trans_log (name,trans_id,amount,pin,seri,type) values ('${info.username}','${info.content}',"${info.menhgia}",'${info.mathe}','${info.seri}','${info.loaithe}')`, callback)
    },
    LayThongTinNguoiNapThe: (info, callback) => {
        return db.query(`SELECT * FROM 'trans_log' WHERE status = 0 AND trans_id = '${info.content}' AND pin = '${info.pin}'  AND seri = '${info.serial}' AND type = '${info.card_type}'`, callback)
    },

    DoiTrangThaiNapThanhCong: (info, callback) => {

    }

}

export default PlayerPoint