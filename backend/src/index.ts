import express from "express";
import { statsRouter } from "./Statistics/stats";
import mongoose from "mongoose";
import cors from "cors";
export const THIRD_API_URL =
  "https://s3.amazonaws.com/roxiler.com/product_transaction.json";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    msg: "coding challenge",
  });
});

app.use("/api/stats", statsRouter);

mongoose
  .connect("mongodb://localhost:27017/abc")
  .then(() => {
    app.listen(3010, () => {
      console.log("port connected on 3000");
    });
  })
  .catch((err) => console.error("Failed to connect to MongoDb", err));
