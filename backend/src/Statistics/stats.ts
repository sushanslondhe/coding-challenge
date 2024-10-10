import axios from "axios";
import { query, response, Router } from "express";
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

statsRouter.get("/data", async (req, res) => {
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
  let { month } = await req.query;
  month = month || "March";
  const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;
  try {
    const soldItems = await Transaction.find({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber],
      },
    });
    const countSold = await Transaction.countDocuments({
      sold: true,
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber],
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
        $eq: [{ $month: "$dateOfSale" }, monthNumber],
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

statsRouter.get("/range", async (req, res) => {
  try {
    let { month } = req.query;
    month = month || "March";

    const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;

    // Defining price ranges
    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity }, // For items with a price above 900
    ];

    const priceRangeCounts = new Array(priceRanges.length).fill(0);

    const aggregationResult = await Transaction.aggregate([
      {
        $match: {
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
        },
      },
      {
        $group: {
          _id: null,
          prices: { $push: "$price" },
        },
      },
    ]);

    const prices =
      aggregationResult.length > 0 ? aggregationResult[0].prices : [];

    // @ts-ignore
    prices.forEach((price) => {
      for (let i = 0; i < priceRanges.length; i++) {
        if (price >= priceRanges[i].min && price <= priceRanges[i].max) {
          priceRangeCounts[i]++;
          break;
        }
      }
    });

    const response = priceRanges.map((range, index) => ({
      range: `${range.min} - ${range.max === Infinity ? "above" : range.max}`,
      count: priceRangeCounts[index],
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

statsRouter.get("/unique", async (req, res) => {
  try {
    let { month } = req.query;
    month = month || "March";

    const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;

    const response = await Transaction.find({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber],
      },
    });

    let categoriesCount = {};
    response.forEach((item) => {
      if (item.category) {
        const category = item.category;
        // @ts-ignore
        if (categoriesCount[category]) {
          // @ts-ignore
          categoriesCount[category]++;
        } else {
          // @ts-ignore
          categoriesCount[category] = 1;
        }
      }
    });

    res.json({
      UniqueCategories: categoriesCount,
    });
  } catch (e) {
    console.log("wrong inputs");
  }
});

statsRouter.get("/all", async (req, res) => {
  try {
    const { month = "March" } = req.query;

    const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;

    const baseURL = "http://localhost:3000/api/stats";

    const [data, totalStats, barItems, uniqueCategories] = await Promise.all([
      axios.get(`${baseURL}/data?month=${monthNumber}`),
      axios.get(`${baseURL}/total?month=${monthNumber}`),
      axios.get(`${baseURL}/range?month=${monthNumber}`),
      axios.get(`${baseURL}/unique?month=${monthNumber}`),
    ]);

    res.json({
      data: data.data,
      totalStats: totalStats.data,
      barItems: barItems.data,
      uniqueCategories: uniqueCategories.data,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);

    res.status(500).json({
      error: "Internal server error",
      message: error,
    });
  }
});
