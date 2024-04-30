import express, { Router } from "express";
import router from "./routes/user.routes";

const app = express();

//middleware for json
app.use(express.json());

//middleware for urlencoded for data
app.use(express.urlencoded({ extended: false }));

//Routes
app.use("/api", router);

export default app;
