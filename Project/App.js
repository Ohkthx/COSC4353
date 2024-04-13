const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const PATHS = require("./defaults");
const Database = require("./database");
const Account = require("./models/account");
const User = require("./models/user");
const { checkAuth } = require("./utils");
const {
  post_update,
  get_update,
  get_user,
  api_get_user,
} = require("./routes/user");
const {
  api_get_history,
  api_get_price,
  get_quote,
  post_quote,
  get_history,
} = require("./routes/quote");
const bcrypt = require("bcrypt");

// Globals
const salt = 4; // For the password hashing.
const app = express();
const db = new Database();
const PORT = 3000; // Port number used to connect to the application.
const nologin_user = "user1";
const nologin = process.argv.includes("--nologin");
if (nologin) {
  console.log(`Running with '--nologin', default user: ${nologin_user}`);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration. Not very secure, for testing.
app.use(
  session({
    secret: "cosc4353", // Obviously not secure right here.
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get("/", (req, res) => {
  res.sendFile(PATHS.get("INDEX"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(PATHS.get("INDEX"));
});

app.get("/login", (req, res) => {
  if (nologin) {
    req.session.user = { username: nologin_user };
    res.redirect("/user");
  } else {
    res.sendFile(PATHS.get("LOGIN"));
  }
});

app.get("/register", (req, res) => {
  res.sendFile(PATHS.get("REGISTER"));
});

app.get("/user", checkAuth, (req, res) => {
  get_user(req, res, PATHS.get("USER"));
});

app.get("/user/update", checkAuth, (req, res) => {
  get_update(req, res, PATHS.get("USER_UPDATE"));
});

app.get("/quote", checkAuth, (req, res) => {
  get_quote(req, res, PATHS.get("QUOTE"));
});

app.get("/quote/history", checkAuth, (req, res) => {
  get_history(req, res, PATHS.get("QUOTE_HISTORY"));
});

app.get("/api/user/profile", async (req, res) => {
  await api_get_user(db, req, res);
});

app.get("/api/quote/history", async (req, res) => {
  await api_get_history(db, req, res);
});

app.get("/api/quote/price", async (req, res) => {
  await api_get_price(db, req, res);
});

app.post("/login", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  // nologin is used for testing to override the process.
  if (!nologin && (!username || !password)) {
    return res
      .status(400)
      .json({ error: "Username and Password are required" });
  } else if (nologin) {
    username = nologin_user;
    password = "password1";
  }

  try {
    // Check if the user account already exists.
    const account = await db.get_account(username);
    if (!account) {
      return res.status(401).json({ error: "Invalid username or password" });
    } else {
      // Compare the password provided to the password received.
      const match = await bcrypt.compare(password, account.password);
      if (match) {
        req.session.user = { username };
        res.redirect("/user");
      } else {
        return res.status(401).json({ error: "Invalid username or password" });
      }
    }
  } catch (error) {
    console.error(`[LOGIN]: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/register", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  // Requires username and password fields.
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    // Check if the user exists already.
    const account = await db.get_account(username);
    if (account) {
      return res.status(400).json({ error: "Username already exists" });
    } else {
      // Encrypt new password for user.
      const hashedPassword = await bcrypt.hash(password, salt);
      await db.insert_account(Account.createAccount(username, hashedPassword));

      // Create placeholder profile data.
      await db.insert_user(User.createUser(username));
      req.session.user = { username };
      res.redirect("/user/update");
    }
  } catch (error) {
    console.error(`[REGISTER]: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/user/update", async (req, res) => {
  await post_update(db, req, res);
});

app.post("/quote", async (req, res) => {
  await post_quote(db, req, res);
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
