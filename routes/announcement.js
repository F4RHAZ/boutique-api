const router = require('express').Router();

const Announcement = require("../models/Announcement");


const{verifyToken, verifyTokenAndAdmin,
    verifyTokenAndAuthorization} = require("./verifyToken");
  
// POST /api/announcements
router.post('/', verifyTokenAndAdmin, async (req, res) => {
    try {
      const { postedById, description, show } = req.body;
      const newAnnouncement = await Announcement.create({ postedById, description, show });
      res.status(201).json(newAnnouncement);
    } catch (err) {
      res.status(500).json(err);
      console.log(err)
    }
  });

  
// GET /api/announcements
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    try {
      const announcements = await Announcement.find();
      res.status(200).json(announcements);
    } catch (err) {
      res.status(500).json(err);
      console.log(err)
    }
  });

  // PUT /api/announcements/:id
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { postedById, description, show } = req.body;
      const updatedAnnouncement = await Announcement.findByIdAndUpdate(
        id,
        { postedById, description, show },
        { new: true }
      );
      res.json(updatedAnnouncement);
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  });


  router.get('/showAnnouncements', async (req, res) => {
    try {
      const announcements = await Announcement.find({ show: true });
      res.status(200).json(announcements);
      //console.log(announcements)
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  });

  

  module.exports = router;