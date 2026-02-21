const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db"); 


router.post("/", async (req, res) => {
    const {username, password} = req.body;
    
    if(!username || !password){
        return res.status(400).json({"message" : "Please fill this field"});
    }
    const db = getDB();
    const users = db.collection("users");

    const existingUser = await users.findOne({username});
    if(existingUser){
        return res.status(400).json({"message": "User Already Exists"});
    }
   await users.insertOne({username, password});
    
    res.json({"message": "Sign Up Successful"});
})
module.exports = router;