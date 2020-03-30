//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require("body-parser")
const ejs = require('ejs');
const mongoose = require("mongoose");
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose=require("passport-local-mongoose")
// const bcrypt = require('bcrypt');
// const saltRounds=10;
//const encrypt=require("mongoose-encryption");

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: 'little secret',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }// this will only be worked in https else cookie will not be set
}))
app.use(passport.initialize());
//session allows to getback the previous stored page when closed
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userdb", { //to connect to mongodb database
  useNewUrlParser: true
});
mongoose.set("useCreateIndex",true);
const userschema = new mongoose.Schema({
  email: String,
  password: String
}
);
userschema.plugin(passportLocalMongoose);//local login strategy .....this is to save all the user credentials into mongodb
//encryption
//userschema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
const User = new mongoose.model("User", userschema);
///////////////this is only used during sessions and  serialize to store user credentials and deserialize to delete
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res) {
  res.render("home");

})
app.get("/login", function(req, res) {
  res.render("login");

})
app.get("/register", function(req, res) {
  res.render("register");
});
app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  };
});
app.post("/register", function(req, res) {
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register")
    }
    else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  };
});
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //   // Store hash in your password DB.
  //   const newuser = new User({
  //     email: req.body.username,
  //     password:hash
  //   })
  //   newuser.save(function(err) {
  //     if (err) {
  //       console.log(err);
  //
  //     } else {
  //       res.render("secrets")
  //     }
  //   })
// });

});
// app.post("/login",function(req,res){
//   res.render("login")
//   const username=req.body.username;
//   const password=req.body.password;
// User.findOne({email:username},function(err,found){
//   if(err){
//
//     console.log(err);
//
//   }
//   else{
//     if(found ){
//         // Load hash from your password DB.
//       bcrypt.compare(password,found.password  , function(err, result) {
//         // result == true
//     });
//         res.render("secrets");
//       }
//       else{
//         res.send("User not found")
//       }
//     }
//
//
//   })
  // });
  app.post("/login", function(req, res){

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
})


app.listen(2000, function() {
  console.log("listening on port 2000");
})
