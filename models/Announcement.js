const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
    {
        postedById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // or 'Admin' if the sender is an admin
            required: true
          },
        description:{type:String, required:true},
        show: {
            type: Boolean,
            default: true
        },
    },
    {timestamps:true}
);

module.exports = mongoose.model("Announcement",  AnnouncementSchema);
