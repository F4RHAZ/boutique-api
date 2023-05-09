const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        percentageOff: {
            type: Number,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Discount", DiscountSchema);
