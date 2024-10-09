import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  sold: Boolean,
  dateOfSale: Date,
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
