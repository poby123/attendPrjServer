const express = require('express');
const session = require('express-session');

const sessionAuth = require('../config/session.js');
const constData = require('../config/constants.js');

var router = express.Router();

router.use(session(sessionAuth));

/* GET home page. */
router.get('/', function(req, res, next) {

  if(req.session.auth >= constData.writerAuth){
    if(req.session.auth === constData.adminAuth){
      res.render('index', {title : 'Manmin Youth', msg : "", menu:constData.adminNav});
    }
    else{
      res.render('index', {title : 'Manmin Youth', msg : "", menu:constData.userNav});
    }
  }else{
    res.render('login', { title: 'Manmin Youth | Sigin in' , msg:"", menu:''});
  }
});

module.exports = router;
