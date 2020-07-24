const express = require('express');
const session = require('express-session');

const sessionAuth = require('../config/session.js');

var router = express.Router();

const adminAuth = 4;
const writerAuth = 1;

router.use(session(sessionAuth));

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.auth >= writerAuth){
    res.render('index', {title : 'Manmin Youth', msg : ""});
  }else{
    res.render('login', { title: 'Manmin Youth | Sigin in' , msg:""});
  }
});

module.exports = router;
