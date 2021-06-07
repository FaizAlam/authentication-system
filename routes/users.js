const express = require("express")
const router = express.Router()
const bcrypt = require('bcryptjs')
// User model
const User = require('../models/User');
const passport = require('passport')
const { forwardAuthenticated } = require('../config/auth');
//Login page
router.get('/login',forwardAuthenticated,(req,res)=>{
    res.render("Login")
})

//Register page
router.get('/register',forwardAuthenticated,(req,res)=>{
    res.render("Register")
})

//Register handle
router.post('/register', (req,res)=>{
    const {name,email,password,password2 }=req.body
    let errors = []

    //check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg:'Please fill in all fields'});
    }

    //check password match
    if(password !==password2){
        errors.push({msg:"Password do not match"});
    }

    //check password length
    if(password.length<6){
        errors.push({msg:"Password should be atleast 6 character"});
    } 

    if(errors.length>0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }else{
       //validation passed
        User.findOne({email:email})
            .then(user =>{
                if(user){
                    // User exists
                    errors.push({msg:"Email is already registered"})
                    res.render('register',{
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else{
                    const newUser = new User({
                        name,
                        email,
                        password
                    })
                    //hash password
                    bcrypt.genSalt(10,(err,salt)=>
                        bcrypt.hash(newUser.password,salt,(err,hash)=>{
                            if(err) throw err;
                            //set password to hashed
                            newUser.password = hash
                            //save user
                            newUser.save()
                                .then(user=>{
                                    req.flash('success_msg','You are now registered and can log in')
                                    res.redirect('/users/login')
                                })
                                .catch(err=>console.log(err))
                    }))
                }
            });
    }
})

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });
  

//Logout

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg',"you are logged out");
    res.redirect('/users/login')
})

module.exports = router