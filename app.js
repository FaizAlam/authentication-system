const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

const app = express()

//Passport config
require('./config/passport')(passport)


//DB config
const db = require('./config/keys').MongoURI;
//connect to mongo
mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
  .then(()=>console.log("MongoDB connected.."))
  .catch(err=>console.log(err));


//EJS
app.use(expressLayouts);
app.set("view engine","ejs")

//Bodyparser
app.use(bodyParser.urlencoded({ extended: false })); 

//express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());


//Global vars
app.use((req,res,next)=>{
  res.locals.success_msg= req.flash('success_msg');
  res.locals.error_msg= req.flash('error-msg')
  res.locals.error= req.flash('error') 
  next()
})

//Routes
app.use('/',require('./routes/index'))
app.use('/users',require('./routes/users'))



const port = 3000
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})