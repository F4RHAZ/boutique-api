const router = require('express').Router();

const Message = require("../models/Message");

const{verifyToken, verifyTokenAndAdmin,
    verifyTokenAndAuthorization} = require("./verifyToken");
  

// POST /api/messages
router.post('/', async (req, res) => {
    try {
      const { senderId, recipientId, message } = req.body;
      const newMessage = await Message.create({ senderId, recipientId, message });
      res.status(201).json(newMessage);
    } catch (err) {
      res.status(500).json(err);
      console.log(err)
    }
  });



// // GET all messages
// router.get("/", async (req, res) => {
//     try {
//       const messages = await Message.aggregate([
//         {
//           $sort: { createdAt: -1 },
//         },
//         {
//           $group: {
//             _id: "$senderId",
//             message: { $first: "$message" },
//             senderId: { $first: "$senderId" },
//             recipientId: { $first: "$recipientId" },
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "senderId",
//             foreignField: "_id",
//             as: "sender",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "recipientId",
//             foreignField: "_id",
//             as: "recipient",
//           },
//         },
//         {
//           $project: {
//             message: 1,
//             sender: { $arrayElemAt: ["$sender", 0] },
//             recipient: { $arrayElemAt: ["$recipient", 0] },
//           },
//         },
//       ]);
//           res.status(200).json(messages);
//       } catch (err) {
//         res.status(500).json(err);
//       }
//     });



router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
      const messages = await Message.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "sender",
          },
        },
        {
          $match: { "sender.isAdmin": { $ne: true } } // Filter messages whose sender is not an admin
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: "$senderId",
            message: { $first: "$message" },
            senderId: { $first: "$senderId" },
            recipientId: { $first: "$recipientId" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "sender",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "recipientId",
            foreignField: "_id",
            as: "recipient",
          },
        },
        {
          $project: {
            message: 1,
            sender: { $arrayElemAt: ["$sender", 0] },
            recipient: { $arrayElemAt: ["$recipient", 0] },
          },
        },
      ]);
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  });







// // GET /api/messages?senderId=<senderId>&recipientId=<recipientId>
// router.get('/', async (req, res) => {
//   try {
//     const { senderId, recipientId } = req.query;
//     const messages = await Message.find({ senderId, recipientId });
//     res.status(200).json(messages);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });



// GET all messages for certain id /api/messages/:userId
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ $or: [{ senderId: userId }, { recipientId: userId }] })
    .populate({
      path: 'senderId recipientId',
      select: 'username isAdmin'
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});


//get message for specific sender and receiver if 
router.get('/:senderId/:recipientId', verifyTokenAndAuthorization, async (req, res) => {
    try {
      const { recipientId, senderId } = req.params;
      const messages = await Message.find({
        $or: [
          { senderId, recipientId },
          { senderId: recipientId, recipientId: senderId },
        ]
      })
      .populate('senderId', 'username isAdmin') // populate senderId field with username
      .exec();
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  


module.exports = router



