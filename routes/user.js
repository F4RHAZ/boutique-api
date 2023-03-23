const router = require("express").Router();
const {verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin} = require("./verifyToken");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const Order = require("../models/Order");

router.put("/:id", verifyTokenAndAuthorization, async (req,res)=>{
  if(req.body.password){
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }
  try{
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body
    },{new:true})

    res.status(200).json(updatedUser);
  }catch(err){
    res.status(500).json(err);
  }
});



//DELETE

router.delete("/:id", verifyTokenAndAuthorization, async(req, res)=>{
  try{
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json("User has been deleted....");
  }
  catch(err){
    res.status(500).json(err);
  }
})


//GET USER
router.get("/find/:id", verifyTokenAndAdmin, async(req, res)=>{
  try{
    const user = await User.findById(req.params.id);
    const {password, ...others} = user._doc;
    res.status(200).json(others);
  }
  catch(err){
    res.status(500).json(err);
  }
});




//GET ALL USER
router.get("/", verifyTokenAndAdmin, async(req, res)=>{
  const query = req.query.new
  try{
    const users = query
    ? await User.find().sort({ _id : -1}).limit(5)
    : await User.find();
    res.status(200).json(users);
  }
  catch(err){
    res.status(500).json(err);
  }
});


//Get user Orders
router.get("/fetchorders/:userId", verifyTokenAndAdmin, async (req, res) => {
  try {
   // console.log(req.params.userId)
    const orders = await Order.find({ userId: req.params.userId });
    //console.log(orders);
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//Get specific user Orders
router.get("/fetchorder/:userId", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId });
    //console.log(orders);
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// // Get USER status
// router.get("/stats", verifyTokenAndAdmin, async(req,res)=>{
//   const date = new Date();
//   const lastYear =  new Date(date.setFullYear(date.getFullYear() -1));
 
//   try{
//     const data = await User.aggregate([
//       {$match : {createdAt : {$gte: lastYear } } },
//       {
//         $project : {
//           month : { $month : "$createdAt"},
//         },
//       },
//       {
//         $group : {
//           _id : "$month",
//           total: {$sum: 1},
//         },
//       },
//       {
//         $sort: {
//           total:1,
//         },
//       },
//     ]);
//     res.status(200).json(data)
//     console.log(data)
//   } catch(err){
//       res.status(500).json(err);
//   }
//});

// Get USER status
router.get("/stats", verifyTokenAndAdmin, async(req,res)=>{
  const currentDate = new Date();
  const lastYear = new Date(currentDate.setMonth(currentDate.getMonth() - 11)); // set the range to the past 12 months
  try {
    const data = await User.aggregate([
      {
        $match : {
          createdAt : {$gte: lastYear}
        }
      },
      {
        $project: {
          month: {$month: "$createdAt"},
          year: {$year: "$createdAt"}
        }
      },
      {
        $group: {
          _id: {month: "$month", year: "$year"},
          total: {$sum: 1}
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);
    res.status(200).json(data);
    //console.log(data)
  } catch(err){
    res.status(500).json(err);
  }
});

module.exports = router;
