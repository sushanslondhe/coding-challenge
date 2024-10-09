import axios from "axios";
import { Router } from "express";
import mongoose from "mongoose";
import { THIRD_API_URL } from "..";
import { Transaction } from "../Schemas/schemas";

export const statsRouter = Router();

statsRouter.get("/init", async (req, res) => {
  try {
    const response = await axios.get(THIRD_API_URL);
    await Transaction.deleteMany({});
    await Transaction.insertMany(response.data);

    await Transaction.find({});

    res.json({
      msg: "Database initialize sucessfully",
    });
  } catch (e) {
    console.log("something went wrong");
  }
});
