const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const UserSchema = new  mongoose.Schema(
  {
    username:{type:String, required: true, unique:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    phone: {type:Number, required:true},
    isAdmin: {
      type : Boolean,
      default: false,
    },
    img : {type: String},
  },
  {timestamps:true}
);

UserSchema.pre('save', async function(next){
  if(!this.isModified('password')){
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function(thePass){
  return await bcrypt.compare(thePass, this.password);
}


module.exports = mongoose.model("User", UserSchema);
