import express from "express"
const router = express.Router()
import db from "../../Dbconnection"
import PlayerPoint from "../models/player"
import bodyParser from "body-parser";
import { rateLimit } from "express-rate-limit";
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Chặn số lượng gửi Requested lên Server
const apiLimiter = rateLimit({
    windowMs: 80 * 1000, // 80s được gửi 2 req
    max: 2,
    handler: function (req, res) {
        res.status(429).send({
            status: 500,
            msg: 'Hãy thử nạp thẻ lại sau 1 phút',
        });
    },
});


// Lấy dữ liệu toàn bộ người chơi nạp Point hoặc 1 người chơi
router.get('/:id?', (req, res, next) => {
    if (req.params.id) {
        // Nếu truyền username lên url thì sẽ lấy 1 người chơi theo username
        PlayerPoint.getPointPlayerById(req.params.id, (err, rows) => {
            console.log(req.params.id);
            if (err) {
                res.status(400).json({
                    errors: "Người chơi đó không tồn tại hoặc lỗi gì đó?"
                });
            }
            else {
                res.json(rows);
            }
        })
    } else {
        // nếu không truyền thì lấy hết dữ liệu
        PlayerPoint.getAllPointPlayer((err, rows) => {
            if (err) {
                res.json(err);
            }
            else {
                res.json(rows);
            }
        })
    }
})

router.post('/napthe', apiLimiter, (req, res, next) => {
    try {
        const { username, content, menhgia, mathe, seri, type } = req.body
        // Nếu người dùng bấm form submit lên mà có các giá trị trên thì sẽ chạy vào đây
        if (username && content && menhgia && mathe && seri && type) {
            const info = req.body
            // Lưu dữ liệu người chơi nạp thẻ vào DB riêng để sau này xác minh dựa trên dữ liệu content
            PlayerPoint.AddPlayerNapThe(info, (err, data) => {
                if (err) {
                    res.status(400).json({
                        msg: "Không thêm được thông tin (SERVER, QUERY)",
                        err
                    })
                }
                else {
                    res.json(data);
                }
            })
        } else {
            res.status(400).json({
                msg: "Làm cách nào đó bạn đã nhập thiếu thông tin"
            })
        }

    } catch (error) {
        res.status(400).json({
            msg: "Không nạp được thẻ"
        })
    }
})

// Nơi nhận lại dữ liệu từ thẻ siêu tốc trả về sau khoảng 10 - 30s để + Point vào cho người chơi
router.post('/', urlencodedParser, function (req, res, next) {
    try {
        console.log(req.body);
        const { status, serial, pin, card_type, amount, receive_amount, real_amount, transaction_id, content, noidung } = JSON.parse(JSON.stringify(req.body))
        if (status && serial && pin && card_type && amount && receive_amount && real_amount && transaction_id && content && noidung) {
            const dataNapThe = {
                content: content,
                pin: pin,
                serial: serial,
                card_type: card_type
            }
            // Sau khi callback từ Server nạp thẻ trả về sẽ lấy dữ liệu người chơi trong DB riêng để đổi trạng thái và + Point
            // Nếu trạng thái thành công
            PlayerPoint.LayThongTinNguoiNapThe(dataNapThe, (err, data) => {
                if (err) {
                    console.log("Không lấy được thông tin trong DB hoặc đối chiếu thông tin thất bại", err);
                    res.status(400).json({
                        err,
                        msg: "Đối chiếu thông tin người nạp thẻ thất bại"
                    });
                }
                else {
                    // sau khi lấy thông tin người nạp thẻ xong thì check status từ req.body, nếu Ok thì cập nhật lại database
                    // 1 Thành công và + Xu vào DB
                    // 3 Sai mệnh giá, không + Xu nhưng vẫn khai báo lại đã nạp bao nhiêu tiền
                    // 2 Thẻ nạp thất bại (sai mã thẻ hoặc gì đó)
                    console.log("dataPlayer", json(data));
                    if (status === 'thanhcong') {
                        // DB QUERY + POINT vào theo Name
                        db.query(`UPDATE playerpoints_points
                        INNER JOIN playerpoints_username_cache ON playerpoints_points.uuid=playerpoints_username_cache.uuid 
                        SET playerpoints_points.points=playerpoints_points.points+(${amount * 0.001}) 
                        WHERE playerpoints_username_cache.username='${data.name}'`)
                        return db.query(`UPDATE 'trans_log' SET 'status' = 1 WHERE 'id'=${data.id}`)
                    } else if (status === 'saimenhgia') {
                        return db.query(`UPDATE 'trans_log' SET 'status' = 3, 'amount'=${amount} WHERE 'id'=${data.id}`)
                    } else {
                        return db.query(`UPDATE 'trans_log' SET 'status' = 2 WHERE 'id'=${data.id}`)
                    }
                }
            })
        } else {
            console.log("Thông tin gửi lên Server không hợp lệ");
            res.status(400).json({
                errors: "Thông tin gửi lên Server không hợp lệ"
            });
        }

    } catch (error) {
        console.log("Không nạp được Xu, hãy báo cho Admin xem xét");
        res.status(400).json({
            errors: "Không nạp được Xu, hãy báo cho Admin xem xét"
        });
    }
});

export default router