//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require("body-parser")
const ejs = require('ejs');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds=10;
//const encrypt=require("mongoose-encryption");

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
}
);
//encryption
//userschema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
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
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    const newuser = new User({
      email: req.body.username,
      password:hash
    })
    newuser.save(function(err) {
      if (err) {
        console.log(err);

      } else {
        res.render("secrets")
      }
    })
});

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
        // Load hash from your password DB.
      bcrypt.compare(password,found.password  , function(err, result) {
        // result == true
    });
        res.render("secrets");
      }
      else{
        res.send("User not found")
      }
    }


  })
  }


);


app.listen(3000, function() {
  console.log("listening on port 3000");
})
