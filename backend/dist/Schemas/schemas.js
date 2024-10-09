"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    sold: Boolean,
    dateOfSale: Date,
});
exports.Transaction = mongoose_1.default.model("Transaction", transactionSchema);
