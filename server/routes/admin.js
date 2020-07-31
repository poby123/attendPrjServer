/*

  The Admin Router For only Administor's Signin, Signout, Member Editing.

*/
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
router.get('/', (req, res, next) => {
  res.redirect('/');
});

///////////////////////////////////////// Edit User Start ////////////////////////////////////////////
/*****************
 **
 *
 * editUser Router
 *
 *
 ***********************/
router.get('/editUser', (req, res, next) => {
  if (req.session.auth === constData.adminAuth) {
    connection.query('SELECT username, grade, class, auth FROM tbluser', (err, results) => {
      if (err) {
        if(req.session.auth === constData.adminAuth){
          res.render('index', {
            title: 'admin Page',
            msg: "error is occured!",
            menu : constData.adminNav
          });
        }
        else{
          res.render('index', {
            title: 'admin Page',
            msg: "",
            menu : constData.userNav
          });
        }

      } else {
        if(req.session.auth === constData.adminAuth){
          res.render('editUser', {
            title: 'admin Page',
            msg: "",
            results: results,
            menu : constData.adminNav,
          });
        }
        else{
          res.render('editUser', {
            title: 'admin Page',
            msg: "",
            results: results,
            menu : constData.userNav,
          });
        }
      }
    });
  } else {
    res.redirect('/');
  }
});


/*****************
 **
 *
 * Edit User post router
 *
 *
 ***********************/
router.post('/editUser', (req, res, next) => {
  let flag = true;
  if (req.session.auth === constData.adminAuth) {
    connection.query('SELECT username FROM tbluser', (err, results) => {
      if (err) {
        console.log(err);
        res.redirect('/admin/editUser');
      } else {
        for (let i = 0; i < results.length; i++) {
          let username = results[i].username;
          let namegrade = username + 'grade';
          let nameclass = username + 'class';
          let nameauth = username + 'auth';
          connection.query('UPDATE tbluser SET grade=?, class=?, auth=? WHERE username=?',
            [req.body[namegrade], req.body[nameclass], req.body[nameauth], username],
            (err, result) => {
              if (err) {
                console.log(err);
                flag = false;
              }
            });
        }
        res.redirect('/admin/editUser');
      }
    });

  } else {
    res.redirect('/');
  }
});

/*****************
 **
 *
 * Edit User Delete Router
 *
 *
 ***********************/
router.get('/editUser/delete', (req, res, next) => {
  if (req.session.auth === constData.adminAuth) {
    console.log(req.query.target);
    if (req.query.target === req.session.username) { //block delete admin self.
      res.redirect('/admin/editUser');
    } else {
      connection.query('DELETE FROM tbluser WHERE username=?', [req.query.target], (error, results) => {
        if (error) {
          console.log(error);
          res.redirect('/admin/editUser');
        } else {
          res.redirect('/admin/editUser');
        }
      });
    }
  } else {
    res.redirect('/');
  }
});

/*****************
 **
 *
 * Edit User ADD Router
 *
 *
 ***********************/
router.post('/editUser/add', (req, res, next) => {
  if (req.session.auth === constData.adminAuth) {
    if (req.body.username === req.session.username) {
      res.redirect('/admin/editUser');
    } else {
      connection.query(`INSERT INTO tbluser (username, userpass, grade, class, auth)
      VALUES( ? , ? , ? , ? , ? )`,
        [req.body.username, req.body.password, req.body.grade, req.body.class, req.body.auth],
        (error, results) => {
          if (error) {
            console.log(error);
            res.redirect('/admin/editUser');
          } else {
            res.redirect('/admin/editUser');
          }
        });
    } //admin add check end
  } //session check end
  else {
    res.redirect('/');
  }
});

///////////////////////////////////////////Edit User End/////////////////////////////////////////////

///////////////////////////////////// Edit Class Member Start ////////////////////////////////////////////
/*****************
 **
 *
 * edit Class Member Router
 *
 *
 ***********************/
router.get('/editClassMember', (req, res, next) => {
  if (req.session.auth === constData.adminAuth) {
    let selectedGrade = req.session.grade;
    let selectedClass = 0;
    if (req.query.grade !== undefined && req.query.grade !== '') selectedGrade = req.query.grade;
    if (req.query.class !== undefined && req.query.class !== '') selectedClass = req.query.class;

    let selectQuery = 'SELECT * FROM tblAttend WHERE grade=? ';
    let arg = [selectedGrade];
    if(selectedClass !== 0){
      selectQuery += 'AND class = ? ';
      arg.push(selectedClass);
    }
    selectQuery += ' ORDER BY class ASC';

    connection.query(selectQuery, arg,
      (err, results) => {
        if (err) { //err
          console.log(err);
          res.render('editUser', {
            title: 'admin Page',
            msg: "error is occured to get attend table",
            menu : constData.adminNav,
          });
        }
        else {
          res.render('editClassMember', {
            title: 'admin Page',
            msg: "",
            results: results,
            menu : constData.adminNav,
          });
        }
      });
  } else {
    res.redirect('/');
  }
});


/*****************
 **
 *
 * Edit class member post router
 *
 *
 ***********************/
router.post('/editClassMember', (req, res, next) => {
  let flag = true;
  if (req.session.auth === constData.adminAuth) {
    connection.query('SELECT name FROM tblAttend', (err, results) => {
      if (err) {
        console.log(err);
        res.redirect('/admin/editClassMember');
      } else {
        for (let i = 0; i < results.length; i++) {
          let name = results[i].name;
          let namegrade = name + 'grade';
          let nameclass = name + 'class';
          connection.query('UPDATE tblAttend SET grade=?, class=? WHERE name=?',
            [req.body[namegrade], req.body[nameclass], name],
            (err, result) => {
              if (err) {
                console.log(err);
                flag = false;
              }
            });
        }
        res.redirect('/admin/editClassMember');
      }
    });

  } else {
    res.redirect('/');
  }
});

/*****************
 **
 *
 * Edit Class Member Delete Router
 *
 *
 ***********************/
router.get('/editClassMember/delete', (req, res, next) => {
  if (req.session.auth === constData.adminAuth) {
    connection.query('DELETE FROM tblAttend WHERE name=?', [req.query.target], (error, results) => {
      if (error) {
        console.log(error);
        res.redirect('/admin/editClassMember');
      } else {
        res.redirect('/admin/editClassMember');
      }
    });
  } else {
    res.redirect('/');
  }
});

/*****************
 **
 *
 * Edit Class Member ADD Router
 *
 *
 ***********************/
router.post('/editClassMember/add', (req, res, next) => {
  if (req.session.auth === constData.adminAuth) {
    console.log('name : ', req.body.name);
    connection.query(`INSERT INTO tblAttend (name, grade, class)
      VALUES( ? , ? , ? )`,
      [req.body.name, req.body.grade, req.body.class],
      (error, results) => {
        if (error) {
          console.log(error);
          res.redirect('/admin/editClassMember');
        } else {
          res.redirect('/admin/editClassMember?grade='+req.body.grade+'&class='+req.body.class);
        }
      });
  } //session check end
  else {
    res.redirect('/');
  }
});

////////////////////////////////////Edit User End/////////////////////////////////////////////

//
module.exports = router;
