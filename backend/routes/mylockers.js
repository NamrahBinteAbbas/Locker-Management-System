const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const auth = require("../middleware/auth");
const { ObjectId } = require("mongodb");

router.use(auth);
router.get("/", async (req,res)=> {
    const db = getDB();
    const lockersCollection = db.collection("lockers");
    const locker = await lockersCollection.findOne({occupants: req.userId});
    if(!locker){
        return res.status(404).json({message: "No lockers found for this user"});
    }
    res.json(locker);
})

router.post("/:id/release", async (req,res)=> {
    const db = getDB();
    const lockersCollection = db.collection("lockers");
    const locker = await lockersCollection.findOne({_id : new ObjectId(req.params.id), occupants: req.userId});
    if(!locker){
        return res.status(404).json({message: "Locker not found or you are not an occupant"});
    }
    let updatedata; 
    if(locker.currentOccupants === 1){
        updatedata = {
            $set: {
        occupied: false,
        availableForSharing: false,
        currentOccupants: 0
            },
            $pull: {
                occupants: req.userId
            }
        };
    }else {
        updatedata = {
            $set: {
                availableForSharing: false,
                currentOccupants: locker.currentOccupants - 1
            },
            $pull: {
                occupants:req.userId
            }
        };
    }
    await lockersCollection.updateOne(
        {_id: new ObjectId(req.params.id)},
        updatedata
    );
    res.json({message: "Locker released successfully"}); 
})

router.put("/:id/share", async (req,res) => {
    const db = getDB();
    const lockersCollection = db.collection("lockers");
    const locker = await lockersCollection.findOne({
        _id: new ObjectId(req.params.id),
        occupants: req.userId
    });

    if (!locker) {
        return res.status(404).json({ message: "Locker not found or you are not an occupant" });
    }
    if(locker.currentOccupants !== 1){
        return res.status(400).json({message: "Locker is already shared"});
    }
    if(locker.availableForSharing){
        return res.status(400).json({message: "Locker is already available for sharing"});
    }
    await lockersCollection.updateOne(
        {_id: new ObjectId(req.params.id)},
        {$set: {availableForSharing: true}}
    );
    res.json({message: "Locker is now available for sharing"});
});
module.exports = router;