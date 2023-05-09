const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount');


const{verifyToken, verifyTokenAndAdmin,
    verifyTokenAndAuthorization} = require("./verifyToken");
  



// Create a new discount
router.post('/', verifyTokenAndAdmin, async (req, res) => {
  try {
    const { userId, percentageOff, startDate, endDate } = req.body;
    const discount = new Discount({
      userId,
      percentageOff,
      startDate,
      endDate
    });
    await discount.save();
    res.json(discount);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get all discounts
router.get('/', async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json(discounts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update a discount
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
  try {
    const { percentageOff, startDate, endDate, isActive } = req.body;
    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      {
        percentageOff,
        startDate,
        endDate,
        isActive
      },
      { new: true }
    );
    res.json(discount);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete a discount
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Discount removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.get('/showDiscount', async (req, res) => {
    try {
      const discount = await Discount.find({ isActive: true });
      res.status(200).json(discount);
      //console.log(discount)
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  });



module.exports = router;
