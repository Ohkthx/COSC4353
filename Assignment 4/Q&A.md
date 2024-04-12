Description: 
Same as assignment 1.

Additional Details:
You can use RDBMS or NoSQL database.

Database must include following tables/documents:
- UserCredentials (ID & password), password should be encrypted.
- ClientInformation
- FuelQuote
- Any additional tables you feel, like States.

Important deliverables:
- You should have validations in place for required fields, field types, and field lengths. 
- Backend should retrieve data from DB and display it to front end.
- Form data should be populated from backend. Backend should receive data from front end, validate, and persist to DB.
- Any new code added should be covered by unit tests. Keep code coverage above 80%.

- NOTE: Only provide a word / pdf doc. You should use GitHub for your group collaboration and code.

Answer these questions:
1. Provide link to GitHub repository for TAs to view the code.(5 points)

    https://github.com/Angel-Sharma/COSC4353/tree/main/Project

2. Provide SQL statements to create database.(3 points)
```javascript 
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
```

3. Rerun the code coverage report and provide it. (2 points)
   
   We used jest to run code coverage reports. To run code coverage reports using jest, please follow these steps:
    1. Install Jest. Open terminal and type: npm install --save-dev jest
    2. Install jsdom. Open terminal and type: npm install --save-dev jest-environment-jsdom
    3. Once installed, type in terminal: npx jest --coverage

   ![image](https://github.com/Angel-Sharma/COSC4353/assets/159072900/d0592ac4-b0e6-4535-9a98-8c013ff20a22)

4. IMPORTANT: list who did what within the group. TAs should be able to validate in GitHub, otherwise team members who didn't contribute will receive a ZERO.



Fill in this table, provide as much details possible:
 
Group Member Name
What is your contribution?
Discussion Notes

Suryansh Sharma- I populated the database and created a function to auto populate the database each time the 
app is run.

Abhinav Krothapalli - I rewrote the code coverage reports for the updated backend modules.
 
Benjamin Mogeni- Updated css and quotes in user
 
 
 
 
 
 
 
 

What to turn in: 
- Only soft copy uploaded to BlackBoard before due date. 
- DO NOT SUBMIT CODE to Canvas. 
- Only one submission per group.
- No extensions.
- All group members must contribute equally.
