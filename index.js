const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors=require("cors");
const dotenv=require("dotenv").config();
let app = express();

app.set("views", "views");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(cors());
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

app.get("/", (req, res) => {
  res.render("razorpay",{key:process.env.KEY_ID});
});

var ord_id;
app.post("/order", (req, res) => {
  var options = {
    amount: 50000,
    currency: "INR",
    receipt: "order_rcptid_11",
  };

  razorpay.orders.create(options, function (err, order) {
    if (order) {
      ord_id = order.id;
      res.json(order);
    } else {
      console.log(err);
    }
  });
});

app.post("/ordercomplete", (req, res) => {
  var razorpay_payment_id = req.body.razorpay_payment_id;
  var razorpay_order_id = req.body.razorpay_order_id;
  var razorpay_signature = req.body.razorpay_signature;
  body = ord_id + "|" + razorpay_payment_id;

  var generated_signature = crypto
    .createHmac("sha256", razorpay.key_secret)
    .update(body.toString())
    .digest("hex");

  if (generated_signature == razorpay_signature) {
    res.render("success");
  } else {
    res.send("failure");
  }

  //  razorpay.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument)=>{
  //      if(paymentDocument.status=="captured"){
  //          res.send("Success");
  //      }else{
  //          res.redirect("/");
  //      }
  //  });
});

app.listen(3000, function (req, res) {
  console.log("Started");
});
