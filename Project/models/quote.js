const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    quote_id: { type: Number, required: true, unique: true },
    gallons: { type: Number, required: true },
    address: { type: String, required: true },
    date: { type: Date, required: true },
    price: { type: Number, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Calculates the cost based on gallons and price.
quoteSchema.virtual("cost").get(function () {
  return this.gallons * this.price;
});

// Replaces what was once the contructor for the class.
quoteSchema.statics.createQuote = function (
  username,
  quote_id,
  gallons,
  address,
  date,
  price
) {
  return new this({
    username,
    quote_id,
    gallons,
    address,
    date,
    price,
  });
};

// Create the model from the schema.
const Quote = mongoose.model("Quote", quoteSchema);

module.exports = Quote;
