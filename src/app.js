import express from "express"
import cors from 'cors';
import morgan from "morgan"
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import routerPlayerPoint from "./routes/player";
import bodyParser from "body-parser";
import dotenv from "dotenv"


const app = express();
const swaggerJSDocs = YAML.load('./api.yaml');
dotenv.config()


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());
app.use(morgan("tiny"))
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJSDocs));

// Router
app.use('/points', routerPlayerPoint)
// connect db




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("Server của bạn đang chạy ở cổng ", PORT);
})

