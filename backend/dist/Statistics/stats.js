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
        res.json({
            msg: "Database initialize sucessfully",
        });
    }
    catch (e) {
        console.log("something went wrong");
    }
}));
