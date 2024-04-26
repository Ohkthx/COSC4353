const Quote = require("../models/quote");
const { getToday } = require("../utils");
const { get_price } = require("./price.js");

// Processes GET requests to the `/api/quote/history` route.
async function api_get_history(db, req, res) {
  const username = req.session.user.username;

  try {
    if (!req.session.user || !username) {
      res.status(401).json({ error: "Not authenticated" });
    }

    const history = await db.get_history(username);
    if (!history) {
      res.status(401).json({ error: "Unable to obtain history." });
    } else {
      res.status(200).json(history);
    }
  } catch (error) {
    console.error(`[API_GET_HISTORY]: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Processes GET requests to the `/quote/history` route.
function get_history(req, res, html_path) {
  res.sendFile(html_path);
}

// Processes GET requests to the `/quote` route.
function get_quote(req, res, html_path) {
  res.sendFile(html_path);
}

// Processes POST requests to the `/quote` route.
async function post_quote(db, req, res) {
  const username = req.session.user.username;

  // Extract the users information.
  let { gallons, date } = req.body;
   // istanbul ignore next
  if (!date) {
    date = getToday();
  }

  try {
    const user = await db.get_user(username);
    if (!req.session.user || !username || !user) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    // Get the counts for the user and all.
    const user_history = await db.get_history_total(username);
    const total_history = await db.get_history_total();

    // Extract and convert the data, only trust gallons sent from user.
    gallons = parseInt(gallons);
    const priceData = await db.get_price();
    const price = parseFloat(priceData.price);
    const pricePerGallon = get_price(price, gallons, user.state, user_history);

    if (isNaN(gallons) || isNaN(price) || isNaN(pricePerGallon)) {
      return res.status(400).json({ error: "Invalid data provided." });
    }

    // Create and insert the new quote.
    await db.insert_quote(
      Quote.createQuote(
        username,
        total_history + 1,
        gallons,
        user.fullAddress,
        date,
        pricePerGallon
      )
    );
    res.redirect("/quote/history");
  } catch (error) {
    console.error(`[POST_QUOTE]: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  api_get_history,
  get_history,
  get_quote,
  post_quote,
};
