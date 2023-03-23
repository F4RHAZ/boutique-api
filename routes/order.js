const router = require("express").Router();
const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const mongoose = require("mongoose");

// CREATE ORDER

router.post("/" , verifyToken, async (req , res) =>{
  const newOrder = new Order(req.body);
 // console.log(newOrder)
  try{
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  }catch (err){
    console.log(err)
    res.status(500).json(err);
  }
});


//UPDATE
router.patch("/status/:id", verifyTokenAndAdmin, async (req,res) =>{
  try{
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new : true }
    );
    res.status(200).json(updatedOrder);
  } catch (err){
    res.status(500).json(err);
  }
});


//DELETE

router.delete("/:id" , verifyTokenAndAdmin, async(req,res)=>{
  try{
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("order has been deleted......");
  } catch(err){
    res.status(500).json(err);
  }
});


// USER ORDER
router.get("/find/:userId", verifyTokenAndAuthorization, async (req,res) =>{
  try{
    const orders = await Order.find({userId: req.params.userId});
    res.status(200).json(orders);
  } catch (err){
    res.status(500).json(err);
  }
});


// GET ALL ORDERS

router.get("/" , verifyTokenAndAdmin, async (req,res) =>{
  try{
    let orders;
    //console.log(req.query)
    if(Object.keys(req.query).length === 0) {
      orders = await Order.find().populate('userId', 'username');
     // console.log(orders)
    }
    else{ 
      const limit = req.query.limit || 5; // set default limit to 5
      orders = await Order.find()
      .populate("userId", "username")
      .sort({ createdAt: "desc" }) // sort by latest
      .limit(parseInt(limit)); // limit the number of orders returned
    } 


    res.status(200).json(orders);
  } catch (err){
    //console.log(err);
    res.status(500).json(err);
  }
});


//GET A SPECIFIC ORDER BY ID
router.get("/transaction/:orderId" , verifyTokenAndAdmin, async (req,res) =>{
 
  try{

    const order = await Order.findById(req.params.orderId).populate('userId')
    .populate({
      path: 'products',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    });
   // console.log(order)
    res.status(200).json(order);
  } catch (err){
    res.status(500).json(err);
  }
});



//Gets revenue 

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  //console.log(productId)
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
  const previousMonth = new Date(new Date(lastMonth).setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            "products._id": productId,
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
      {
        $sort: {
          total:1,
        },
      },
    ]);
    //console.log(income)
    res.status(200).json(income);
   // console.log(income)
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// // //to get income for specific product 
// router.get("/income/product", verifyTokenAndAdmin, async (req, res) => {
//   const productId = req.query.pid; // replace with the product ID you want to query
//   const currentDate = new Date();
//   const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
//   const previousMonth = new Date(new Date(lastMonth).setMonth(lastMonth.getMonth() - 1));
  
//   try {
//     const productSales = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: previousMonth },
//           "products._id": productId,
//         },
//       },
//       {
//         $unwind: "$products",
//       },
//       {
//         $match: {
//           "products._id": productId,
//         },
//       },
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//           quantity: "$products.quantity",
//         },
//       },
//       {
//         $group: {
//           _id: { month: "$month", year: "$year" },
//           total: { $sum: "$quantity" },
//         },
//       },
//       {
//         $sort: {
//           "_id.year": 1,
//           "_id.month": 1,
//         },
//       },
//     ]);
    
//     console.log(productSales);
//   } catch (err) {
//     console.log(err);
//   }
// });

//Gets sales
router.get("/sales", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
  const previousMonth = new Date(new Date(lastMonth).setMonth(lastMonth.getMonth() - 1));

  try {


    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            "products.productId": productId,
          }),
        },
      },
        {
          $project: {
            month: { $month: "$createdAt" },
            quantity: {
              $sum: { $map: { input: "$products.quantity", in: { $toInt: "$$this" } } }
            }
          }
        },
        {
          $group: {
            _id: "$month",
            totalQuantity: { $sum: "$quantity" },
          },
        },
    ]);
  //  console.log("sales", sales)
    res.status(200).json(sales);
  } catch (err) {
   // console.log(err);
    res.status(500).json(err);
  }
});


module.exports = router;
