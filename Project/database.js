const User = require("./models/user");
const Quote = require("./models/quote");
const Account = require("./models/account");
const mongoose = require("mongoose");
require("dotenv").config();

const PRICE = {
  price: "3.50",
};

class Database {
  /// Used to create the database, normally a url is a destination to connect to.
  constructor(url = "mongodb://localhost/cosc4353") {
    this.url = process.env.MONGO_URL || url;

    mongoose
      .connect(this.url, {})
      .then(() => console.log("MongoDB connected."))
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw new Error();
      });
  }

  // SELECT / Getters
  async get_account(username) {
    return Account.findOne({ username }).exec();
  }

  async get_user(username) {
    return User.findOne({ username }).exec();
  }

  async get_quote(username, quote_id) {
    return Quote.findOne({ username, quote_id }).exec();
  }

  async get_history(username) {
    return Quote.find({ username }).exec();
  }

  async get_price() {
    return PRICE;
  }

  // INSERT / Create
  async insert_account(account) {
    return account.save();
  }

  async insert_user(user) {
    return user.save();
  }

  async insert_quote(quote) {
    return quote.save();
  }

  // UPDATE
  async update_account(username, account) {
    return Account.findOneAndUpdate({ username }, account, {
      new: true,
    }).exec();
  }

  async update_user(username, user) {
    return User.findOneAndUpdate({ username }, user, {
      new: true,
    }).exec();
  }

  async update_quote(username, quote_id, quote) {
    return Quote.findOneAndUpdate({ username, quote_id }, quote, {
      new: true,
    }).exec();
  }
}

module.exports = Database;
