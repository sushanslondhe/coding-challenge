"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.THIRD_API_URL = void 0;
const express_1 = __importDefault(require("express"));
const stats_1 = require("./Statistics/stats");
const mongoose_1 = __importDefault(require("mongoose"));
exports.THIRD_API_URL = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.json({
        msg: "coding challenge",
    });
});
app.use("/api/stats", stats_1.statsRouter);
mongoose_1.default
    .connect("mongodb://localhost:27017/data")
    .then(() => {
    app.listen(3000, () => {
        console.log("port connected on 3000");
    });
})
    .catch((err) => console.error("Failed to connect to MongoDb", err));
