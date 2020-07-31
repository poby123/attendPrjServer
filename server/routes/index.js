var express = require('express');
var mysql = require('mysql');
const session = require('express-session');
var xl = require('excel4node'); /*https://www.npmjs.com/package/excel4node*/
var router = express.Router();

const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');
const constData = require('../config/constants.js');
const { render } = require('ejs');

const connection = mysql.createPool(dbConfig);
router.use(session(sessionAuth));

/* GET home page. */
router.get('/', function(req, res, next) {

  if(req.session.auth >= constData.writerAuth){
    let date = new Date();
    let month = date.getMonth() + 1;
    
    connection.query(`SELECT * FROM tblPlanner WHERE month = ? AND grade = ?`, [month, req.session.grade, true], (err, result)=> {
      if(err){
        console.log(err);
        if(req.session.auth === constData.adminAuth){
          res.render('index', {title : 'Manmin Youth', msg : "", result : '' , menu:constData.adminNav});
        }
        else{
          res.render('index', {title : 'Manmin Youth', msg : "", result : '', menu:constData.userNav});
        }
      }else{
        if(req.session.auth === constData.adminAuth){
          console.log('no error to get table');
          res.render('index', {title : 'Manmin Youth', msg : "", result : result ,menu:constData.adminNav});
        }
        else{
          res.render('index', {title : 'Manmin Youth', msg : "", result : result , menu:constData.userNav});
        }
      }
    });
  }else{
    res.render('login', { title: 'Manmin Youth | Sigin in' , msg:"", menu:''});
  }
});

module.exports = router;
