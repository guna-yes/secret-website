//jshint esversion:6
const express = require('express');
const bodyParser = require("body-parser")
const ejs = require('ejs');
const mongoose = require("mongoose");
const encrypt=require("mongoose-encryption");
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
mongoose.connect("mongodb://localhost:27017/userdb", { //to connect to mongodb database
  useNewUrlParser: true
});
const userschema = new mongoose.Schema({
  email: String,
  password: String
});
const secret="this is our secret ";
userschema.plugin(encrypt,{secret:secret,encryptedFields:["password"]})
const User = new mongoose.model("User", userschema)

app.get("/", function(req, res) {
  res.render("home");

})
app.get("/login", function(req, res) {
  res.render("login");

})
app.get("/register", function(req, res) {
  res.render("register");
});
app.post("/register", function(req, res) {
  const newuser = new User({
    email: req.body.username,
    password: req.body.password
  })
  newuser.save(function(err) {
    if (err) {
      console.log(err);

    } else {
      res.render("secrets")
    }
  })
});
app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;
User.findOne({email:username},function(err,found){
  if(err){

    console.log(err);

  }
  else{
    if(found ){
      if(found.password===password){
        res.render("secrets");
      }
    }else{
        res.send("user not found");
    }
  }
})
}
);


app.listen(3000, function() {
  console.log("listening on port 3000");
})
