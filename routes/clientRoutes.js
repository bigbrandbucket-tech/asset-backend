const express = require("express");
const router = express.Router();
const Client = require("../models/client");
const bcrypt = require("bcrypt");

// ✅ Create a new client with hashed password
router.post("/", async (req, res) => {
  try {
    const { clientName, pocName, pocNumber, email, address, username, password } = req.body;

    // Check if username already exists
    const existing = await Client.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the client
    const client = await Client.create({
      clientName,
      pocName,
      pocNumber,
      email,
      address,
      username,
      password: hashedPassword
    });

    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Client login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const client = await Client.findOne({ username });
    if (!client) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      client: {
        id: client._id,
        username: client.username,
        clientName: client.clientName
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Get all clients
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// ✅ Get client by ID
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: "Error fetching client" });
  }
});

module.exports = router;
