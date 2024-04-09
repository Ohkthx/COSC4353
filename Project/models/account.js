const mongoose = require("mongoose");

// Schema for the `Account`s belong to `User`s.
const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Replaces what was once the contructor for the class.
accountSchema.statics.createAccount = function (username, password) {
  return new this({
    username,
    password,
  });
};

// Create the model from the schema.
const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
