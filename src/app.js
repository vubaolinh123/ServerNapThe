import express from "express"
import cors from 'cors';
import morgan from "morgan"
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import routerPlayerPoint from "./routes/player";
import bodyParser from "body-parser";


const app = express();
const swaggerJSDocs = YAML.load('./api.yaml');

// middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());
app.use(morgan("tiny"))
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJSDocs));

// Router
app.use('/points', routerPlayerPoint)
// connect db


// Kết nối DB MYSQL
// connection.connect(function (err) {
//     if (err) {
//         console.error('Lỗi kết nối: ' + err.stack);
//         return;
//     }
//     console.log('Kết nối DB thành công ' + connection.threadId);
// });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("Server của bạn đang chạy ở cổng ", PORT);
})