import express from "express"
const router = express.Router()
import PlayerPoint from "../models/player"
import bodyParser from "body-parser";
import { rateLimit } from "express-rate-limit";
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Chặn số lượng gửi Requested lên Server
const apiLimiter = rateLimit({
    windowMs: 80 * 1000, // 1 minutes
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
        PlayerPoint.getPointPlayerById(req.params.id, (err, rows) => {
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
        if (username && content && menhgia && mathe && seri && type) {
            const info = req.body
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
            PlayerPoint.LayThongTinNguoiNapThe(dataNapThe, (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(400).json({
                        err,
                        msg: "Đối chiếu thông tin người nạp thẻ thất bại"
                    });
                }
                else {
                    console.log("dataPlayer", json(data));
                    res.json(data);
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