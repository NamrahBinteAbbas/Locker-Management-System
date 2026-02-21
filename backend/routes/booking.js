const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const auth = require("../middleware/auth");
router.post("/",auth,async (req,res) => {
    try{
        const db = getDB();
        const userId = req.userId; 
        const { lockerId, putForSharing } = req.body;
        console.log("📥 Booking request:", { userId, lockerId, putForSharing });
        const locker = await db.collection("lockers").findOne({_id: new ObjectId(lockerId)});
        console.log("🔍 Found locker:", locker); // ✅ Debug log
        if(!locker){
            return res.status(404).json({message: "Locker not found!"});
        }
        if(locker.occupants.length > locker.maxOccupants){
            return res.status(404).json({message: "Locker is full!"});
        }
        // Check if the user already has a booking
        const existingBooking = await db.collection("bookings").findOne({ userId: userId });
        if (existingBooking) {
            return res.status(400).json({ message: "You already have a booked locker!" });}

        locker.occupants.push(userId);
        locker.currentOccupants += 1;
        locker.occupied = locker.currentOccupants >= locker.maxOccupants;
        locker.availableForSharing = putForSharing; 
        await db.collection("lockers").updateOne(
            {_id: new ObjectId(lockerId)},
            {$set: {
                occupants: locker.occupants,
                currentOccupants: locker.currentOccupants,
                occupied: locker.occupied,
                availableForSharing: locker.availableForSharing
            }}
        );
        await db.collection("bookings").insertOne({
            lockerId: locker._id,
            userId: userId,
            putForSharing: putForSharing,
        });
        res.json({message: "Locker booked successfully!"}); 
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
});
module.exports = router;