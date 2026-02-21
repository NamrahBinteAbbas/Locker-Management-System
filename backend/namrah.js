const express = require("express");
const cors = require("cors");
const { connectDB, getDB } = require("./config/db");

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// CONNECT DB
connectDB();

// Normal test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

// ✅ DB TEST ROUTE
app.get("/dbtest", async (req, res) => {
  try {
    const db = getDB();
    await db.command({ ping: 1 });

    res.json({ message: "DB CONNECTED ✅" });
  } catch (err) {
    console.log("DB ERROR:", err);
    res.json({ message: "DB NOT CONNECTED ❌", error: err.message });
  }
});

const signupRoute = require("./routes/signup");
app.use("/signup", signupRoute);

const loginRoute = require("./routes/login");
app.use("/login", loginRoute);

const lockerRoute = require("./routes/lockers");
app.use("/lockers", lockerRoute);

const bookingRoute = require("./routes/booking");
app.use("/bookings", bookingRoute);

app.listen(port, () => {
  console.log(`Server running at http://localhost:5001`);
});
