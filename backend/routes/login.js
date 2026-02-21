const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const SECRET_KEY = "my-secret-key";

router.get("/", async (req, res) => {
    res.json({ message: "Login endpoint" });
  });
router.post("/", async (req, res) => {
    const {username, password} = req.body;
    if(!username || !password){
        return res.status(400).json({"message" : "Please fill the required fields"});
    }
  const db = getDB();
  const usersCollection = db.collection("users");
  const user = await usersCollection.findOne({username, password});
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign(
    {id: user._id.toString()},
    SECRET_KEY,
    {expiresIn: "1h"}
  )
  res.json({"message": "Login successful", token});
});
module.exports = router;
