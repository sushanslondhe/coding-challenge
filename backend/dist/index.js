"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.THIRD_API_URL = void 0;
const express_1 = __importDefault(require("express"));
const stats_1 = require("./Statistics/stats");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
exports.THIRD_API_URL = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.json({
        msg: "coding challenge",
    });
});
app.use("/api/stats", stats_1.statsRouter);
const port = 3010;
mongoose_1.default
    .connect("mongodb://localhost:27017/man")
    .then(() => {
    app.listen(port, () => {
        console.log(`port connected on ${port}`);
    });
})
    .catch((err) => console.error("Failed to connect to MongoDb", err));
