const User = require("../models/user");

// Processes GET requests to the `/api/user/profile` route.
async function api_get_user(db, req, res) {
  const username = req.session.user.username;

  try {
    const user = await db.get_user(username);
    if (!req.session.user || !username || !user) {
      res.status(401).json({ error: "Not authenticated." });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error(`[API_GET_USER]: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Processes GET requests to the `/user` route.
function get_user(req, res, html_path) {
  res.sendFile(html_path);
}

// Processes GET requests to the `/user/update` route.
function get_update(req, res, html_path) {
  res.sendFile(html_path);
}

// Processes POST requests to the `/user/update` route.
async function post_update(db, req, res) {
  const username = req.session.user.username;

  // Extract the values sent from the client.
  const { fullname, address1, address2, city, zipcode, state } = req.body;

  // Check that the required fields are present.
  if (!fullname || !address1 || !city || zipcode === undefined) {
    return res.status(400).json({
      error: "All fields are required except address2 and state.",
    });
  }
  const nameRegex = /^[A-Za-z\s]{1,50}$/; // allows letters and spaces up to 50 characters
  const addressRegex = /^[\w\s,.#-]{1,100}$/; // allows letters, digits, spaces, commas, periods, and hyphens up to 100 characters
  const cityRegex = /^[\w\s,.]{1,100}$/; // similar to address for consistency
  const stateRegex = /^[A-Z]{2}$/; // must be 2 uppercase letters
  const zipcodeRegex = /^\d{5}(-\d{4})?$/; // must be a 5-digit code, optional 4-digit extension

  // Validation
  let errors = [];

  if (!fullname || !nameRegex.test(fullname)) {
    errors.push("Full Name must be 1-50 characters long and only contain letters and spaces.");
  }
  if (!address1 || !addressRegex.test(address1)) {
    errors.push("Address 1 must be 1-100 characters long and may include numbers, letters, spaces, commas, periods, and hyphens.");
  }
  if (address2 && !addressRegex.test(address2)) {
    errors.push("Address 2 must be 1-100 characters long and may include numbers, letters, spaces, commas, periods, and hyphens.");
  }
  if (!city || !cityRegex.test(city)) {
    errors.push("City must be 1-100 characters long and may include numbers, letters, spaces, commas, and periods.");
  }
  if (!state || !stateRegex.test(state)) {
    errors.push("State must be a 2-character code.");
  }
  if (!zipcode || !zipcodeRegex.test(zipcode)) {
    errors.push("Zipcode must be a 5-digit number, with an optional 4-digit extension.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation error",
      messages: errors
    });
  }


  try {
    const user = await db.get_user(username);
    if (!req.session.user || !username || !user) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    // Updates the user profile information.
    db.update_user(username, {
      fullname,
      address1,
      address2,
      city,
      zipcode,
      state,
    });

    // Redirect to the user profile.
    res.redirect("/user");
  } catch (error) {
    console.error(`[POST_UPDATE]: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  api_get_user,
  get_user,
  get_update,
  post_update,
};
