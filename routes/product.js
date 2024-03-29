const router = require("express").Router();

const Product = require("../models/Product");

const{verifyToken, verifyTokenAndAdmin,
  verifyTokenAndAuthorization} = require("./verifyToken");

//CREATE

router.post("/", verifyTokenAndAdmin, async(req,res) =>{
  const newProduct = new Product(req.body)
  try{
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err){
    res.status(500).json(err);
  }
});


//UPDATE PRODUCT
router.put("/:id", verifyTokenAndAdmin, async(req,res) =>{
  try{
    //console.log(req.body);
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set :req.body,
      },
      {new : true}
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE A PRODUCT ONLY ADMIN
router.delete("/:id" , verifyTokenAndAdmin, async (req,res) =>{
  try{
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted... ");
  } catch(err){
    res.status(500).json(err);
  }
});


//GET SPECIFIC PRODUCT EVERYONE
router.get("/find/:id", async (req,res) =>{
  try{
    const product = await Product.findById(req.params.id);
    res.status(200).json(product)
  }catch(err){
    res.status(500).json(err);
  }
});



//Get Product Image
router.get("/find/:id/image", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    console.log(product)
    const image = product.img;
    res.status(200).json(image);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL PRODUCT EVRYONE
router.get("/", async(req,res) =>{
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try{
    let products;
    if(qNew){
      products = await Product.find().sort({createdAt : -1}).limit(10);
    }else if(qCategory){
      products = await Product.find({
        categories : {
          $in : [qCategory],
        },
      });
    } else{
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (err){
    res.status(500).json(err);
  }
});


module.exports = router
