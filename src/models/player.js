import db from "../../Dbconnection"

const PlayerPoint = {
    // Lấy toàn bộ dữ liệu của người chơi có Point Join lại với bảng cạnh nó để lấy được userName thay vì chỉ có Uuid
    getAllPointPlayer: (callback) => {
        return db.query("SELECT playerpoints_points.id, playerpoints_points.uuid, playerpoints_points.points, playerpoints_username_cache.username FROM playerpoints_points INNER JOIN playerpoints_username_cache ON playerpoints_points.uuid = playerpoints_username_cache.uuid", callback)
    },
    // Lấy dữ liệu người chơi theo UUid có Point 
    getPointPlayerById: (username, callback) => {
        return db.query(`SELECT playerpoints_points.id, playerpoints_points.uuid, playerpoints_points.points, playerpoints_username_cache.username FROM playerpoints_points
        INNER JOIN playerpoints_username_cache ON playerpoints_points.uuid=playerpoints_username_cache.uuid WHERE username='${username}'`, callback)
    },
    // Khi người chơi bấm nút Nạp thẻ, thông tin người chơi sẽ lưu lại để sau 30s sẽ check trạng thái nạp Thành Công, Thất Bại, Sai Thẻ,...
    AddPlayerNapThe: (info, callback) => {
        return db.query(`Insert into trans_log (name,trans_id,amount,pin,seri,type) values ('${info.username}','${info.content}',"${info.menhgia}",'${info.mathe}','${info.seri}','${info.type}')`, callback)
    },
    LayThongTinNguoiNapThe: (info, callback) => {
        return db.query(`SELECT * FROM trans_log WHERE status = 0 AND trans_id = '${info.content}' AND pin = '${info.pin}'  AND seri = '${info.serial}' AND type = '${info.card_type}'`, callback)
    },

    ThemXuChoNguoiChoiTrongGameVaDoiTrangThai: (info, callback) => {
        return db.query(`UPDATE playerpoints_points
                        INNER JOIN playerpoints_username_cache ON playerpoints_points.uuid=playerpoints_username_cache.uuid 
                        SET playerpoints_points.points=playerpoints_points.points+(${info.amount * 0.001}) 
                        WHERE playerpoints_username_cache.username='${info.name}'; 
                        UPDATE trans_log SET status=${info.status} WHERE id=${info.id}`, callback)
    },

    DoiStatusThanhCongVaThatBai: (info, callback) => {
        return db.query(`UPDATE trans_log SET status=${info.status} WHERE id=${info.id}`, callback)
    },

    DoiStatusSaiMenhGia: (info, callback) => {
        return db.query(`UPDATE trans_log SET status=${info.status}, amount=${info.amount} WHERE id=${info.id}`, callback)
    },

    GetAllNapThe: (callback) => {
        return db.query("SELECT * FROM trans_log ORDER BY id DESC", callback)
    },

    GetLogNapTheTop20: (callback) => {
        return db.query("SELECT * FROM trans_log WHERE 1 ORDER BY id DESC LIMIT 0,20", callback)
    },
    GetLogNapTheByName: (name, callback) => {
        return db.query(`SELECT * FROM trans_log WHERE name='${name}' ORDER BY id DESC`, callback)
    },
    GetTop10NapThe: (callback) => {
        return db.query(`SELECT name, COUNT(*) AS soLanNap, SUM(amount) AS TongTienNap 
        FROM trans_log GROUP BY name HAVING COUNT(*)>0 ORDER BY TongTienNap DESC LIMIT 10`, callback)
    },

}

export default PlayerPoint