const Quote = require("../models/quote");
const { getToday } = require("../utils");

// Processes GET requests to the `/api/quote/history` route.
async function api_get_history(db, req, res) {
  const username = req.session.user.username;
  const history = await db.get_history(username);

  if (!req.session.user || !username || !history) {
    res.status(401).json({ error: "Not authenticated" });
  } else {
    res.status(200).json(history);
  }
}

// Processes GET requests to the `/api/quote/price` route.
async function api_get_price(db, req, res) {
  const username = req.session.user.username;
  const price = await db.get_price();

  if (!req.session.user || !username || !price) {
    res.status(401).json({ error: "Not authenticated" });
  } else {
    res.status(200).json(price);
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
  if (!req.session.user || !req.session.user.username) {
    return res.status(400).json({ error: "User has not authenticated." });
  }

  const username = req.session.user.username;

  try {
    const user = await db.get_user(username);
    let { gallons, date } = req.body;

    if (!date) {
      date = getToday();
    }

    // Extract and convert the data.
    gallons = parseInt(gallons);
    const priceData = await db.get_price();
    const price = parseFloat(priceData.price);

    if (isNaN(gallons) || isNaN(price)) {
      return res.status(400).json({ error: "Invalid data provided." });
    }

    const history = await db.get_history(username);
    const quote_id = history.length;

    // Create and insert the new quote.
    await db.insert_quote(
      Quote.createQuote(
        username,
        quote_id,
        gallons,
        user.fullAddress,
        date,
        price
      )
    );
    res.redirect("/quote/history");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  api_get_history,
  api_get_price,
  get_history,
  get_quote,
  post_quote,
};
