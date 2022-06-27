import express from "express"
const router = express.Router()
import PlayerPoint from "../models/player"
import request from "request"
import fs from "fs";


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

router.post('/', function (req, res, next) {
    try {
        request("https://server-napthe.herokuapp.com/points	", function (error, response, body) {
            if (!error) {
                // writing the response to a file named data.html
                fs.writeFileSync("data.html", body);
            }
        });
    } catch (error) {
        res.json(error)
    }
});

export default router