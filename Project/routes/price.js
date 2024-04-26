// Processes GET requests to the `/api/quote/price` route.
async function api_post_price(db, req, res) {
  if (!req.session.user || !req.session.user.username) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  // Extract information sent from client.
  const username = req.session.user.username;
  const { gallonsRequested, state } = req.body;
  const gallons = parseInt(gallonsRequested);

  try {
    const user = await db.get_user(username);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    // Obtain the database price (should be $1.50). Keeping instead of hardcoding.
    const priceQuote = await db.get_price();
    const price = parseFloat(priceQuote.price);
    const history = await db.get_history_total(username);

    // Default to users state if it was not sent.
    const userState = state || user.state;

    // Calculates the finalized margin, price, and amount due.
    const pricePerGallon = get_price(price, gallons, userState, history);
    const totalAmount = pricePerGallon * gallons;

    res.status(200).json({
      price: pricePerGallon.toFixed(2),
      totalAmountDue: totalAmount.toFixed(2),
    });
  } catch (error) {
    console.error(`[API_POST_PRICE]: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Calculates the margin from the data provided.
function calculate_margin(price, gallons, state, history) {
  const locFactor = state.toUpperCase() == "TX" ? 0.02 : 0.04;
  const histFactor = history > 0 ? 0.01 : 0.0;
  const galFactor = gallons > 1000 ? 0.02 : 0.03;
  const profitFactor = 0.1;

  return price * (locFactor - histFactor + galFactor + profitFactor);
}

// Calculates the new price per gallon including the margin.
function get_price(price, gallons, state, history) {
  return price + calculate_margin(price, gallons, state, history);
}

module.exports = { api_post_price, get_price, calculate_margin };
