const jwt = require("jsonwebtoken");
const SECRET_KEY = "my-secret-key";
const auth = (req,res,next) => {
    const authHeader = req.headers["authorization"];
    if(!authHeader){
        return res.status(401).json({"message": "Authorization header missing"});
    }
    const token = authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({"message": "Token is missing"});
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id; 
        next();
    }
    catch(err){
        return res.status(401).json({"message": "Invalid Token"})
        }
};
module.exports = auth; 