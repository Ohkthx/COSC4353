const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  fullname: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String, default: "" },
  city: { type: String, required: true },
  zipcode: { type: String, required: true },
  state: { type: String, required: true, default: "AL" },
});

// Generates the full address of the user.
userSchema.virtual("fullAddress").get(function () {
  let address2 = this.address2;
  if (this.address2) {
    address2 = ` ${this.address2}`;
  }

  return `${this.address1}${address2}, ${this.city}, ${this.state} ${this.zipcode}`;
});

// Replaces what was once the contructor for the class.
userSchema.statics.createUser = function (
  username,
  fullname = "John Doe",
  address1 = "1234 Placeholder Ln",
  address2 = "",
  city = "Houston",
  zipcode = "77002",
  state = "TX"
) {
  return new this({
    username,
    fullname,
    address1,
    address2,
    city,
    zipcode,
    state,
  });
};

// Create the model from the schema.
const User = mongoose.model("User", userSchema);

module.exports = User;
