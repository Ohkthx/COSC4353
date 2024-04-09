const Quote = require("../models/quote");
const { getToday } = require("../utils");

// Processes GET requests to the `/api/quote/history` route.
async function api_get_history(db, req, res) {
  const username = req.session.user.username;

  try {
    const history = await db.get_history(username);

    if (!req.session.user || !username || !history) {
      res.status(401).json({ error: "Not authenticated" });
    } else {
      res.status(200).json(history);
    }
  } catch (error) {
    console.error(`[API_GET_HISTORY]: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Processes GET requests to the `/api/quote/price` route.
async function api_get_price(db, req, res) {
  const username = req.session.user.username;

  try {
    const price = await db.get_price();
    const user = await db.get_user(username);
    if (!req.session.user || !username || !user) {
      res.status(401).json({ error: "Not authenticated." });
    } else if (!price) {
      console.error(`[API_GET_PRICE::PRICE]: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.status(200).json(price);
    }
  } catch (error) {
    console.error(`[API_GET_PRICE]: ${error}`);
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
  if (!date) {
    date = getToday();
  }

  try {
    const user = await db.get_user(username);
    if (!req.session.user || !username || !user) {
      return res.status(401).json({ error: "Not authenticated." });
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
    console.error(`[POST_QUOTE]: ${error}`);
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
