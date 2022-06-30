import express from "express"
const router = express.Router()
import db from "../../Dbconnection"
import { v4 as uuidv4 } from 'uuid';
import PlayerPoint from "../models/player"
import bodyParser from "body-parser";
import { rateLimit } from "express-rate-limit";
import axios from "axios";
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Chặn số lượng gửi Requested lên Server
const apiLimiter = rateLimit({
    windowMs: 30 * 1000, // 80s được gửi 2 req
    max: 2,
    handler: function (req, res) {
        res.status(429).send({
            status: 500,
            msg: 'Hãy thử nạp thẻ lại sau 1 phút',
        });
    },
});


// Lấy dữ liệu toàn bộ người chơi nạp Point hoặc 1 người chơi
router.get('/logpoint/:name?', (req, res, next) => {
    if (req.params.name) {
        // Nếu truyền username lên url thì sẽ lấy 1 người chơi theo username
        PlayerPoint.getPointPlayerById(req.params.name, (err, rows) => {
            if (err) {
                res.status(400).json({
                    errors: "Người chơi đó không tồn tại hoặc lỗi gì đó?"
                });
            }
            else {
                if (rows.length > 0) {
                    res.json(rows);
                } else {
                    res.status(400).json({
                        msg: "Không tìm thấy người chơi nào như vậy"
                    });
                }

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


router.get('/logcoin/:name?', (req, res) => {
    if (req.params.name) {
        // Nếu truyền username lên url thì sẽ lấy 1 người chơi theo username
        PlayerPoint.GetLogNapTheByName(req.params.name, (err, rows) => {
            if (err) {
                res.status(400).json({
                    errors: "Người chơi đó không tồn tại hoặc lỗi gì đó?"
                });
            }
            else {
                if (rows.length > 0) {
                    res.json(rows);
                } else {
                    res.status(400).json({
                        msg: "Không tìm thấy log nào có người chơi như vậy"
                    });
                }
            }
        })
    } else {
        // nếu không truyền thì lấy hết dữ liệu
        PlayerPoint.GetLogNapTheTop20((err, rows) => {
            if (err) {
                res.status(400).json({
                    msg: "Có thể bạn chưa bật Server để có thể lấy được dữ liệu"
                });
            } else {
                res.json(rows);
            }
        })
    }

})

router.get('/alllogcoin', (req, res) => {
    PlayerPoint.GetAllNapThe((err, data) => {
        if (err) {
            res.status(400).json({
                msg: "Có thể bạn chưa bật Server để có thể lấy được dữ liệu"
            });
        } else {
            res.json(data);
        }
    })
})


router.get('/top10', (req, res) => {
    PlayerPoint.GetTop10NapThe((err, data) => {
        if (err) {
            res.status(400).json({
                msg: "Có thể bạn chưa bật Server để có thể lấy được dữ liệu"
            });
        } else {
            res.json(data);
        }
    })
})


router.post('/napthe', apiLimiter, async (req, res, next) => {
    try {
        const { username, menhgia, mathe, seri, type } = req.body
        // Nếu người dùng bấm form submit lên mà có các giá trị trên thì sẽ chạy vào đây
        if (username && menhgia && mathe && seri && type) {
            const info = req.body
            info.APIkey = "A5C3AA19DDD4D255D6CA2A4E5EC0FD9A"
            info.content = uuidv4()
            // Gọi API đến thẻ siêu tốc để gửi thẻ cho bên đó check
            try {
                const { data } = await axios.post(`https://thesieutoc.net/chargingws/v2`, info)
                if (data.status === "00") {
                    // Do trạng thái thẻ là thành công nên sẽ lưu dữ liệu người chơi nạp thẻ vào DB riêng
                    //  để sau này xác minh dựa trên dữ liệu content
                    PlayerPoint.AddPlayerNapThe(info, (err, dataQuery) => {
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
                        msg: data.msg,
                        title: data.title
                    })
                }
            } catch (error) {
                res.status(400).json({
                    msg: "Lỗi khi gọi đến API của thẻ siêu tốc",
                    error
                })
            }
        } else {
            res.status(400).json({
                msg: "Làm cách nào đó bạn đã nhập thiếu thông tin"
            })
        }
    } catch (error) {
        res.status(400).json({
            msg: "Không nạp được thẻ",
            error
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
            PlayerPoint.LayThongTinNguoiNapThe(dataNapThe, async (err, dataPlayer) => {
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
                    let dataPlayerValidate = JSON.parse(JSON.stringify(dataPlayer))

                    // Trạng Thái Thành Công Sẽ Thêm Xu Vào Cho Người Chơi 
                    // Đồng thời đổi trạng thái nạp thẻ trên web sang thành công
                    if (dataPlayerValidate.length > 0) {
                        if (status === 'thanhcong') {
                            const infoPlayer = {
                                amount,
                                name: dataPlayerValidate[0].name,
                                id: dataPlayerValidate[0].id,
                                status: 1
                            }
                            PlayerPoint.ThemXuChoNguoiChoiTrongGameVaDoiTrangThai(infoPlayer, (err, results, fields) => {
                                if (err) {
                                    console.log("Không thêm được xu cho người chơi hoặc không đổi được trạng thái sang thành công", err);
                                    res.status(400).json({
                                        err,
                                        msg: "Không thêm được xu cho người chơi hoặc không đổi được trạng thái sang thành công"
                                    });
                                } else {
                                    res.status(200).json({
                                        msg: "Đổi trạng thái nạp thẻ thành công và đã thêm xu cho người chơi",
                                    });
                                }
                            })

                            // Khi thẻ sai mệnh giá đổi trạng thái và gắn lại số tiền người chơi đã nạp vào DB
                        } else if (status === 'saimenhgia') {
                            const infoStatus = {
                                id: dataPlayerValidate[0].id,
                                amount: amount,
                                status: 3
                            }
                            PlayerPoint.DoiStatusSaiMenhGia(infoStatus, (err, data) => {
                                if (err) {
                                    console.log("Không đổi được trạng thái sang sai mệnh giá", err);
                                    res.status(400).json({
                                        err,
                                        msg: "Không đổi được trạng thái sang sai mệnh giá"
                                    });
                                } else {
                                    res.status(200).json({
                                        msg: "Đã đổi trạng thái sang Sai mệnh giá thành công"
                                    });
                                }
                            })
                        } else { // Khi trạng thái là thất bại thì chỉ chuyển trạng thái trong DB
                            const infoStatus = {
                                id: dataPlayerValidate[0].id,
                                status: 2
                            }
                            PlayerPoint.DoiStatusThanhCongVaThatBai(infoStatus, (err, data) => {
                                if (err) {
                                    console.log("Không đổi được trạng thái sang thành công", err);
                                    res.status(400).json({
                                        err,
                                        msg: "Không đổi được trạng thái thành thất bại"
                                    });
                                } else {
                                    res.status(200).json({
                                        msg: "Đã đổi trạng thái thành thất bại thành công"
                                    });
                                }
                            })
                        }
                    } else {
                        res.status(400).json({
                            msg: "Không tìm được thông tin người chơi đã nạp thẻ"
                        });
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