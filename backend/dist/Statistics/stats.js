"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsRouter = void 0;
const axios_1 = __importDefault(require("axios"));
const express_1 = require("express");
const __1 = require("..");
const schemas_1 = require("../Schemas/schemas");
exports.statsRouter = (0, express_1.Router)();
exports.statsRouter.get("/init", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(__1.THIRD_API_URL);
        yield schemas_1.Transaction.deleteMany({});
        yield schemas_1.Transaction.insertMany(response.data);
        yield schemas_1.Transaction.find({});
        res.json({
            msg: "Database initialize sucessfully",
        });
    }
    catch (e) {
        console.log("something went wrong");
    }
}));
exports.statsRouter.get("/data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { month = "March", search = "", page = 1, perPage = 10, sortField = "dateOfSale", sortDirection = "asc", } = req.query;
        month = month || "March";
        const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;
        // @ts-ignore
        const isNumericSearch = /^[0-9.]+$/.test(search);
        const filter = Object.assign({ $expr: {
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
            } }, (search !== "" && {
            $or: [
                ...(isNumericSearch
                    ? // @ts-ignore
                        [{ price: parseFloat(search) }]
                    : [
                        { title: { $regex: new RegExp(`\\b${search}\\b`, "i") } },
                        { description: { $regex: new RegExp(`\\b${search}\\b`, "i") } },
                    ]),
            ],
        }));
        // Counting total documents for pagination details
        const totalCount = yield schemas_1.Transaction.countDocuments(filter);
        // @ts-ignore
        const totalPages = Math.ceil(totalCount / perPage);
        const sortOptions = {};
        // @ts-ignore
        sortOptions[sortField] = sortDirection === "asc" ? 1 : -1;
        const transactions = yield schemas_1.Transaction.find(filter);
        res.json({
            transactions,
            totalCount,
            currentPage: page,
            sortField,
            sortDirection,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.statsRouter.get("/total", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { month } = yield req.query;
    month = month || "March";
    const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;
    try {
        const soldItems = yield schemas_1.Transaction.find({
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthNumber],
            },
        });
        const countSold = yield schemas_1.Transaction.countDocuments({
            sold: true,
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthNumber],
            },
        });
        const totalSaleAmount = soldItems.reduce(
        // @ts-ignore
        (total, item) => total + item.price, 0);
        const unsoldItems = yield schemas_1.Transaction.countDocuments({
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
    }
    catch (error) {
        res.json({
            msg: "error! something went wrong",
        });
    }
}));
exports.statsRouter.get("/range", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const aggregationResult = yield schemas_1.Transaction.aggregate([
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
        const prices = aggregationResult.length > 0 ? aggregationResult[0].prices : [];
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.statsRouter.get("/unique", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { month } = req.query;
        month = month || "March";
        const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;
        const response = yield schemas_1.Transaction.find({
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
                }
                else {
                    // @ts-ignore
                    categoriesCount[category] = 1;
                }
            }
        });
        res.json({
            UniqueCategories: categoriesCount,
        });
    }
    catch (e) {
        console.log("wrong inputs");
    }
}));
exports.statsRouter.get("/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month = "March" } = req.query;
        const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
        const baseURL = "http://localhost:3000/api/stats";
        const [data, totalStats, barItems, uniqueCategories] = yield Promise.all([
            axios_1.default.get(`${baseURL}/data?month=${monthNumber}`),
            axios_1.default.get(`${baseURL}/total?month=${monthNumber}`),
            axios_1.default.get(`${baseURL}/range?month=${monthNumber}`),
            axios_1.default.get(`${baseURL}/unique?month=${monthNumber}`),
        ]);
        res.json({
            data: data.data,
            totalStats: totalStats.data,
            barItems: barItems.data,
            uniqueCategories: uniqueCategories.data,
        });
    }
    catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error,
        });
    }
}));
