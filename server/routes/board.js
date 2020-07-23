/*

  The Board Router for sending tblAttend to client and saving reqest data.

*/
var express = require('express');
var mysql = require('mysql');
const session = require('express-session');
var router = express.Router();

const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');

const connection = mysql.createPool(dbConfig);

router.use(session(sessionAuth));

/*
  GET Attend Board Data
*/
router.get('/', (req, res, next) => {
  console.log('/board router is called!');
  console.log(req.session.username);
  if(req.session.username){
    connection.query('SELECT * FROM tblAttend where class = ?', [req.session.class], (err, results) =>{
      if(err) {
        console.log(err);
        let data = {result : false};
        res.json(data);
      }
      else{
        let data = {
          result : true,
          table : results,
        }
        res.json(data);
      }
    });
  }else{
    console.log('username session does not exist!');
    let data = {
      result : false,
    }
    res.json(data);
  }
  // console.log(data);
});

/*
  Update to Requset Data
*/
router.put('/save', (req, res, next) => {
  let data = {result : true};

  if(req.session.username){
    console.log(req.body);
    for(let i=0;i<req.body.length;i++){
      connection.query('UPDATE tblAttend SET tue=?, meeting=? where name=?',
      [req.body[i][1], req.body[i][2], req.body[i][0]], (err, result) =>{
        if(err){
          data.result = false;
        }
      });
    }
    res.json(data);
  }else{
    console.log('username session does not exist!');
    res.json(data);
  }
});

//sign in
// router.get('/sigin', (req, res, next) => {
//
// });
// router.post('/signin', (req, res, next) => {
//   let username = req.body.username;
//   let password = req.body.password;
//   console.log(username);
//   console.log(password);
//   connection.query('SELECT * FROM tbluser where username=? and userpass=?', [username, password],
//   function(err, results){
//     let val = {result : false};
//     console.log(results.length);
//     if(err){
//       console.log(err);
//     }
//     else if(results.length == 1){
//       val.result = true;
//       req.session.username = results[0].username;
//       req.session.grade = results[0].grade;
//       req.session.class = results[0].class;
//       req.session.auth = results[0].auth;
//       req.session.save(function() {
//         console.log('login Success!, name: ', results[0].username);
//       });
//       res.json(val);
//     }else{
//       console.log('not found');
//       res.json(val);
//     }
//   });
// });
//
// //signout
// router.get('/signout', (req, res, next) => {
//   if(req.session.username){
//     req.session.destroy((err) => {
//       if(err){
//         console.log(err);
//       }else{
//         req.session;
//         console.log('signout success');
//       }
//     });
//   }
// });

module.exports = router;
