const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");
const messageRoute = require("./routes/message");
const announcement = require("./routes/announcement")
const discount =  require("./routes/discount");
const cors = require("cors");



dotenv.config();



mongoose
.connect(process.env.MONGO_URL)
.then(() => console.log("DBConnection successfull! "))
.catch((err) =>{
  console.log(err);
});


app.use(cors());
app.use(express.json()); 
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products" , productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);
app.use("/api/message", messageRoute);
app.use("/api/announcements", announcement)
app.use("/api/discount", discount);

app.listen(process.env.PORT || 5000, ()=>{
  console.log("Backend server is running! ");
});
