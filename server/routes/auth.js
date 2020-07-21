var express = require('express');
var mysql = require('mysql');
const session = require('express-session');
var router = express.Router();

const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');

const connection = mysql.createPool(dbConfig);

router.use(session(sessionAuth));

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

//sign in
router.get('/sigin', (req, res, next) => {

});
router.post('/signin', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  connection.query('SELECT * FROM tbluser where username=? and userpass=?', [username, password],
  function(err, results){
    let val = {result : false};
    console.log(results.length);
    if(err){
      console.log(err);
    }
    else if(results.length == 1){
      val.result = true;
      res.json(val);
      req.session.username = results[0].username;
      req.session.grade = results[0].grade;
      req.session.class = results[0].class;
      req.session.auth = results[0].auth;
      req.session.save(function() {
        console.log('login Success!, name: ', results[0].username);
      });
    }else{
      console.log('not found');
      res.json(val);
    }
  });
});

//signout
router.get('/signout', (req, res, next) => {
  if(req.session.username){
    req.session.destroy((err) => {
      if(err){
        console.log(err);
      }else{
        req.session;
        console.log('signout success');
      }
    });
  }
});
module.exports = router;
