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
