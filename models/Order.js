const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      { 
      _id: {type: String},
      img: {type: Array},
      categories: {type: Array},
      size: {type: String },
      color: {type: String },
      price: {type:Number},
      inStock: {type: Boolean},
      quantity: {type: Number},
        },
    ],
    total: { type: Number, required: true },
    shipping: { type: Object, required: true },
    delivery_status: { type: String, default: "pending" },
    payment_status: { type: String, default: "pending" },
    discount: {
      percentageOff: { type: Number, default: 0 },
      amountOff: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

//const Order = mongoose.model("Order", orderSchema);

//exports.Order = Order;


module.exports = mongoose.model("Order", orderSchema);



















// // const mongoose = require("mongoose");

// // const orderSchema = new mongoose.Schema(
// //   {
// //     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// //     customerId: {type: String},
// //     paymentIntentId: {type: String},
// //     products: [
// //       { 
// //       productId: {type: String},
// //       size: {type: String },
// //       color: {type: String },
// //       price: {type:Number},
// //       inStock: {type: Boolean},
// //       quantity: {type: Number},
// //         },
// //     ],
// //     subtotal: { type: Number, required: true },
// //     total: { type: Number, required: true },
// //     shipping: { type: Object, required: true },
// //     delivery_status: { type: String, default: "pending" },
// //     payment_status: { type: String, required: true },
// //   },
// //   { timestamps: true }
// // );

// // //const Order = mongoose.model("Order", orderSchema);

// // //exports.Order = Order;


// // module.exports = mongoose.model("Order", orderSchema);
