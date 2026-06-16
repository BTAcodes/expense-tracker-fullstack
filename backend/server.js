import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import userRouter from "./routers/userRouter.js";
import incomeRouter from "./routers/incomeRoutes.js";
import expenseRouter from "./routers/expenseRouter.js";
import dashboardRouter from "./routers/dashboardRouter.js";

const app = express();
const port = 4000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);
app.get("/", (req, res) => {
  res.send("API WORK");
});

// DB
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`runing on ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};
startServer();
