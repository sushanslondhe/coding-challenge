import axios from "axios";
import { response, Router } from "express";
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

statsRouter.get("/total", async (req, res) => {
  const { month } = await req.query;

  try {
    const soldItems = await Transaction.find({
      sold: true,
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, month],
      },
    });
    const countSold = await Transaction.countDocuments({
      sold: true,
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, month],
      },
    });
    const totalSaleAmount = soldItems.reduce(
      // @ts-ignore
      (total, item) => total + item.price,
      0
    );

    const unsoldItems = await Transaction.countDocuments({
      sold: false,
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, month],
      },
    });
    res.json({
      totalSaleAmount: totalSaleAmount,
      NumberOfItemsSold: countSold,
      unsoldItems,
    });
  } catch (error) {
    res.json({
      msg: "error! something went wrong",
    });
  }
});
