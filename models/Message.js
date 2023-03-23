const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // or 'Admin' if the sender is an admin
            required: true
          },
          recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // or 'Admin' if the recipient is an admin
            required: true
          },
        message:{type:String, required:true},
        read: {
            type: Boolean,
            default: false
        },
    },
    {timestamps:true}
);

module.exports = mongoose.model("Message",  MessageSchema);
