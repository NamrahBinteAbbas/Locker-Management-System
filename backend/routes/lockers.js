const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db"); 
const { ObjectId } = require("mongodb"); // for locker IDs
const auth = require("../middleware/auth");
let db;
router.get("/", auth, async (req, res) => {
    try{
    const db = getDB();
    const lockers = await db.collection("lockers").find().toArray();
    const lockerData = lockers.map(locker =>{
        let status = "Available";

        if (locker.occupied) {
                if (locker.availableForSharing && locker.currentOccupants < locker.maxOccupants) {
                    status = "Available for Sharing";
                } else {
                    status = "Occupied";
                }
            }
        return {
            _id: locker._id,
            number: locker.number,
            location: locker.location,
            maxOccupants: locker.maxOccupants,
            currentOccupants: locker.currentOccupants,
            status
        }
    });
    console.log("📤 Sending lockerData:", lockerData[0]);
    res.json(lockerData);
}catch(err){
    console.error(err);
    res.status(500).json({message: "Server Error"});
}
});
router.put("/:id/share", auth, async (req,res) => {
    try {
    const db = getDB();
    const lockerId = req.params.id;
    const userId = req.userId;
    const locker = await db.collection("lockers").findOne({_id: new ObjectId(lockerId)});
    if(!locker){
        return res.status(404).json({message: "Locker not found"});
    }
    if(!locker.occupants.includes(userId)){
        return res.status(403).json({message: "You are not allowed to edit this locker"});}
    // if(locker.occupants.length >= locker.maxOccupants){
    //     return res.status(400).json({message: "Locker is full"});
    // }
    const putForSharing = req.body.putForSharing; // true/false from frontend

    await db.collection("lockers").updateOne(
        {_id: new ObjectId(lockerId)},
        {$set: {availableForSharing: putForSharing}}
        
    );
    const responseMsg = req.body.putForSharing 
            ? "Locker is now available for sharing" 
            : "Locker is marked as occupied and not available for sharing";
    res.json({message: responseMsg});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "server error"});
    }
});
router.get("/:id", auth, async (req,res) =>{
    try {
        const db = getDB();
        const lockerId = req.params.id; 
        const locker = await db.collection("lockers").findOne({_id: new ObjectId(lockerId)});
        if(!locker){
            return res.status(404).json({message: "Locker not found"});
        }
        res.json(locker);
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: "server error"});
    }
} );
module.exports = router;