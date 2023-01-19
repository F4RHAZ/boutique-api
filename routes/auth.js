const router = require("express").Router();
const User = require("../models/User");
const jwt =require('jsonwebtoken');

//REGISTER

router.post("/register", async (req,res)=>{

  const newUser = new User({
    username : req.body.values.username,
    email : req.body.values.email,
    phone : req.body.values.phone,
    password : req.body.values.password
  });

  

  try{
    const savedUser = await newUser.save()
    res.status(200).json(savedUser);
  }catch(err){
    res.status(500).json(err);
  }
});


router.post("/login", async (req, res) =>{
  try{
    const username = req.body.username;
    const userpassword = req.body.userpassword;
    
    console.log(username, userpassword);

    if(!username || !userpassword){
      return res.status(400).json({
        success : false,
        message: "Please input credentials"
      });
    }
    const user = await User.findOne({
          username: req.body.username
    });


    if(!user){
      return res.status(400).json({
        success: false,
        message : "Wrong credentials"
      });
    }

    const isMatched = await user.comparePassword(userpassword);
    if(!isMatched){
      return res.status(400).json({
        success : false,
        message: "Invalid credentials"
      })
    }

    const accesstoken = jwt.sign({
      id: user._id,
      isAdmin : user.isAdmin,
    },
    process.env.JWT_SEC,
    {expiresIn: "3d"}
 );

   const {password, ...others} = user._doc;

    res.status(200).json({...others, accesstoken});

  } catch(err){
    res.status(500).json();
  }
});





module.exports = router;
