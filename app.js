import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";;
import dbConnection from "./database/dbconnection.js";
import {errorMiddleware} from "./middlewear/error.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import timelineRouter from "./router/timelineRouter.js";
import applicationRouter from "./router/softwareApplicationRoute.js";
import skillRouter from "./router/skillRoutes.js";
import projectRouter from "./router/projectRoute.js";

const app = express();

dotenv.config({path: "./config/.env"});

app.use(
  cors({
  origin:[process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL, 'http://localhost:4001'],
  methods: ["GET", "POST","PUT", "DELETE"],
  credentials: true,
})
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",

})
);

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/softwareapplication", applicationRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/project", projectRouter);

dbConnection();
app.use(errorMiddleware);






export default app;