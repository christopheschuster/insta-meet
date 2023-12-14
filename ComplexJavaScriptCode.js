// Filename: ComplexJavaScriptCode.js

/**
 * This code demonstrates a complex implementation of a mock e-commerce website that includes a shopping cart,
 * user authentication, product listing, and order processing functionalities.
 */

// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Define the MongoDB connection URL
const mongoURI = "mongodb://localhost/ecommerce";

// Create an Express application
const app = express();

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Define the User model
const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String,
});

// Middleware for parsing JSON-encoded bodies
app.use(bodyParser.json());

// Middleware for logging all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.path}`);
  next();
});

// User registration endpoint
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password before storing it
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create a new user
  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  // Save the user to the database
  user.save((err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

// User login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find the user in the database by email
  User.findOne({ email }, (err, user) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else if (!user) {
      res.sendStatus(401);
    } else {
      // Compare the provided password with the hashed password in the database
      if (bcrypt.compareSync(password, user.password)) {
        // Generate a JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          "secret_key",
          { expiresIn: "1d" }
        );

        res.json({ token });
      } else {
        res.sendStatus(401);
      }
    }
  });
});

// Protected route example
app.get("/products", (req, res) => {
  // Check if the Authorization header is present
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    res.sendStatus(401);
    return;
  }

  // Verify the JWT token
  const token = authorizationHeader.split(" ")[1];
  jwt.verify(token, "secret_key", (err, decoded) => {
    if (err) {
      console.log(err);
      res.sendStatus(401);
    } else {
      // Perform the protected action (e.g., fetch and return product list)
      const products = [
        { id: 1, name: "Product 1", price: 9.99 },
        { id: 2, name: "Product 2", price: 19.99 },
      ];

      res.json(products);
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

// ... Additional code for product listing, shopping cart, order processing, etc. goes here ...