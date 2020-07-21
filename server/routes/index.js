const express = require('express');
const session = require('express-session');

const sessionAuth = require('../config/session.js');

var router = express.Router();

const adminAuth = 4;

router.use(session(sessionAuth));

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.auth === adminAuth){
    res.render('index', {title : 'admin Page', msg : ""});
  }else{
    res.render('login', { title: 'Sigin in' , msg:""});
  }
});

module.exports = router;
