
// infrastructure/db/SupplyCategoryModel.js

const mongoose = require("mongoose");

const supplyCategorySchema = new mongoose.Schema(
  {
    nombre:      { type: String, required: true, unique: true },
    estado:      { type: Boolean, default: true },
  },
  { timestamps: true },
);


module.exports = mongoose.model("SupplyCategory", supplyCategorySchema);
