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
exports.statsRouter.get("/get", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { month } = yield req.query;
    try {
        const soldItems = yield schemas_1.Transaction.find({
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, month],
            },
        });
        const countSold = yield schemas_1.Transaction.countDocuments({
            sold: true,
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, month],
            },
        });
        const totalSaleAmount = soldItems.reduce(
        // @ts-ignore
        (total, item) => total + item.price, 0);
        const unsoldItems = yield schemas_1.Transaction.countDocuments({
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
    }
    catch (error) {
        res.json({
            msg: "error! something went wrong",
        });
    }
}));
