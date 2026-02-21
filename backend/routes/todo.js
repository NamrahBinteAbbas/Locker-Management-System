const express = require("express");
const router = express.Router();
router.get("/", (rew, res)=> {
    res.json({"message": "Todo route works!"});
})