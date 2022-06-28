import express from "express"
const router = express.Router()
import PlayerPoint from "../models/player"
import bodyParser from "body-parser";
var urlencodedParser = bodyParser.urlencoded({ extended: false })


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

// UPDATE POINT (Nạp Point Người Chơi)
router.put('/:id', function (req, res, next) {
    PlayerPoint.PostNapThe(req.body, function (err, rows) {
        if (err) {
            res.status(400).json({
                errors: "Không nạp được Point, hãy báo cho Admin xem xét"
            });
        } else {
            res.json(rows);
        }
    });
});

router.post('/', urlencodedParser, function (req, res, next) {
    try {
        JSON.parse("======BodyParse=======", req)
        console.log(req);
    } catch (error) {
        res.json(error)
    }
});

export default router