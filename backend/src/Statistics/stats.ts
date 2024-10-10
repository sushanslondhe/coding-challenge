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

statsRouter.get("/get", async (req, res) => {
  try {
    let {
      month = "March",
      search = "",
      page = 1,
      perPage = 10,
      sortField = "dateOfSale",
      sortDirection = "asc",
    } = req.query;
    month = month || "March";
    const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;

    // @ts-ignore
    const isNumericSearch = /^[0-9.]+$/.test(search);

    const filter = {
      $expr: {
        $eq: [
          {
            $month: {
              $dateFromString: {
                dateString: { $toString: "$dateOfSale" },
                format: "%Y-%m-%dT%H:%M:%S.%LZ",
              },
            },
          },
          monthNumber,
        ],
      },
      ...(search !== "" && {
        $or: [
          ...(isNumericSearch
            ? // @ts-ignore
              [{ price: parseFloat(search) }]
            : [
                { title: { $regex: new RegExp(`\\b${search}\\b`, "i") } },
                { description: { $regex: new RegExp(`\\b${search}\\b`, "i") } },
              ]),
        ],
      }),
    };

    // Counting total documents for pagination details
    const totalCount = await Transaction.countDocuments(filter);
    // @ts-ignore
    const totalPages = Math.ceil(totalCount / perPage);

    const sortOptions = {};
    // @ts-ignore
    sortOptions[sortField] = sortDirection === "asc" ? 1 : -1;

    const transactions = await Transaction.find(filter);

    res.json({
      transactions,
      totalCount,

      currentPage: page,
      sortField,
      sortDirection,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
