const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const env = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const cors = require("cors");

const Expense = require("./models/Expense");
const Income = require("./models/Income");
const User = require("./models/User");

const app = express();
env.config();

const PORT = process.env.PORT;
const apiKey = process.env.STOCKS_API_KEY;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// Authentication middleware
async function authMiddleware(req, res, next) {
  const username = req.cookies.login_status;
  if (!username) return res.status(401).send("Unauthorized");

  const user = await User.findOne({ username });
  if (!user) return res.status(401).send("User not found");

  req.user = user;
  next();
}

// Public Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// Register
app.post("/register", async (req, res) => {
  const { name, email, username, password } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).send("Username already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();
    console.log("Registration Successful");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Registration failed");
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send("Invalid username");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("Invalid password");

    res.cookie("login_status", username, {
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
    });
    console.log("LogIn Successful");
    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("login_status");
  console.log("LogOut Successful");
  res.redirect("/");
});

// Add Expense
app.post("/api/expenses", authMiddleware, async (req, res) => {
  try {
    const { expenseid, category, description, amount } = req.body;
    const expense = new Expense({
      userid: req.user.id,
      expenseid,
      category,
      description,
      amount,
    });
    console.log(expense);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: "Failed to save expense" });
  }
});

// Add Income
app.post("/api/incomes", authMiddleware, async (req, res) => {
  try {
    const { incomeid, category, description, amount } = req.body;
    const income = new Income({
      userid: req.user.id,
      incomeid,
      category,
      description,
      amount,
    });

    console.log(income);
    await income.save();
    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ error: "Failed to save income" });
  }
});

// Get User Expenses
app.get("/api/expenses", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userid: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// Get User Incomes
app.get("/api/incomes", authMiddleware, async (req, res) => {
  try {
    const incomes = await Income.find({ userid: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incomes" });
  }
});

// Delete Income
app.delete("/api/incomes/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const income = await Income.findOneAndDelete({
      incomeid: id,
      userid: req.user._id,
    });
    if (!income)
      return res
        .status(404)
        .json({ error: "Income not found or unauthorized" });

    res.json({ message: "Income deleted successfully", income });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete income" });
  }
});

// Delete Expense
app.delete("/api/expenses/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  console.log("In delete expense section");
  try {
    const expense = await Expense.findOneAndDelete({
      expenseid: id,
      userid: req.user._id,
    });
    if (!expense)
      return res
        .status(404)
        .json({ error: "Expense not found or unauthorized" });

    res.json({ message: "Expense deleted successfully", expense });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

async function fetchStockData(symbol) {
  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=${apiKey}`;
  const response = await fetch(url);
  return response.json();
}

app.get("/api/stocks", async (req, res) => {
  try {
    const companies = ["GOOGL", "AAPL", "IBM", "MSFT", "AMZN"];
    const results = await Promise.all(companies.map(fetchStockData));

    const data = {};
    companies.forEach((company, i) => {
      data[company] = results[i];
    });

    res.json(data);
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});
