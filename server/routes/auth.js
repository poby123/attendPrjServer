/*
  The authentication Router for signin and signout etc of client side.
*/
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
  console.log(username);
  console.log(password);
  connection.query('SELECT * FROM tbluser where username=? and userpass=?', [username, password],
  function(err, results){
    let val = {result : false};
    console.log(results.length);
    if(err){
      console.log(err);
    }
    else if(results.length == 1){
      val.result = true;
      if(req.session.username){

      }
      else{
        req.session.username = results[0].username;
        req.session.grade = results[0].grade;
        req.session.class = results[0].class;
        req.session.auth = results[0].auth;
        req.session.isApp = true; //set flag who signin using application.
        console.log('isApp : ', req.session.isApp);
        req.session.save(function() {
          console.log('login Success!, name: ', results[0].username);
        });
      }
      res.json(val);
    }else{
      console.log('not found');
      res.json(val);
    }
  });
});

//signout
router.get('/signout', (req, res, next) => {
  if(req.session.username){
    let val = {result : false};
    req.session.destroy((err) => {
      if(err){
        console.log(err);
        res.json(val)
      }else{
        req.session;
        console.log('signout success');
        val.result = true;
        // console.log(val);
        res.json(val);
      }
    });
  }
});
module.exports = router;
