var express = require('express');
var mysql = require('mysql');
const session = require('express-session');
var router = express.Router();

const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');

const connection = mysql.createPool(dbConfig);

const adminAuth = 4;

router.use(session(sessionAuth));

/* GET home page. */
router.get('/', (req, res, next) => {
  res.redirect('/');
});

/////////////////////////////////// Sign in, out Start //////////////////////////////////////////////

/*****************
 **
 *
 * Sign in Router
 *
 *
 ***********************/
router.get('/sigin', (req, res, next) => {
  res.redirect('/');
});
router.post('/signin', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  connection.query('SELECT * FROM tbluser where username=? and userpass=?', [username, password],
    function(err, results) {
      // console.log(results.length);
      if (err) {
        console.log(err);
      } else if (results.length == 1 && results[0].auth === 4) {
        req.session.username = results[0].username;
        req.session.auth = results[0].auth;
        req.session.save(function() {
          console.log('login Success!, name: ', results[0].username);
          res.redirect('/');
        });
      } else {
        console.log('not found');
        res.render('login', {
          title: 'Sigin in',
          msg: "아이디나 비밀번호가 틀렸습니다"
        });
      }
    });
});

/*****************
 **
 *
 * SignOut Router
 *
 *
 ***********************/
router.get('/signout', (req, res, next) => {
  if (req.session.auth === adminAuth) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        req.session;
        console.log('signout success');
        res.redirect('/');
      }
    });
  }
});
////////////////////////////////////// Sign in, out Router End///////////////////////////////////////////

///////////////////////////////////// Edit User Start ////////////////////////////////////////////
/*****************
 **
 *
 * editUser Router
 *
 *
 ***********************/
router.get('/editUser', (req, res, next) => {
  if (req.session.auth === adminAuth) {
    connection.query('SELECT username, grade, class, auth FROM tbluser', (err, results) => {
      if (err) {
        res.render('index', {
          title: 'admin Page',
          msg: "error is occured!"
        });
      } else {
        res.render('editUser', {
          title: 'admin Page',
          msg: "",
          results: results
        });
      }
    });
  } else {
    res.render('login', {
      title: 'Sigin in',
      msg: "로그인이 필요한 서비스입니다."
    });
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
  if (req.session.auth === adminAuth) {
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
    console.log('fail');
    res.render('login', {
      title: 'Sigin in',
      msg: "로그인이 필요한 서비스입니다."
    });
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
  if (req.session.auth === adminAuth) {
    console.log(req.query.target);
    if (req.query.target === req.session.username) {
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
    res.render('login', {
      title: 'Sigin in',
      msg: "로그인이 필요한 서비스입니다."
    });
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
  if (req.session.auth === adminAuth) {
    if (req.body.username === req.session.username) {
      res.redirect('/admin/editUser');
    } else {
      connection.query(`INSERT INTO tbluser (username, userpass, grade, class, auth)
      VALUES( ? , ? , ? , ? , ? )`,
        [req.body.username, '1234', req.body.grade, req.body.class, req.body.auth],
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
    res.render('login', {
      title: 'Sigin in',
      msg: "로그인이 필요한 서비스입니다."
    });
  }
});

////////////////////////////////////Edit User End/////////////////////////////////////////////

///////////////////////////////////// Edit Class Member Start ////////////////////////////////////////////
/*****************
 **
 *
 * edit Class Member Router
 *
 *
 ***********************/
router.get('/editClassMember', (req, res, next) => {
  if (req.session.auth === adminAuth) {
    let selectedGrade = req.query.grade;
    let selectedClass = req.query.class;
    if (selectedGrade === '') selectedGrade = 1;
    if(selectedClass === '') selectedClass = 1;

    connection.query('SELECT * FROM tblAttend where grade=? and class=?', [selectedGrade, selectedClass],
      (err, results) => {
        if (err) {
          console.log(err);
          res.render('editUser', {
            title: 'admin Page',
            msg: "error is occured to get attend table"
          });
        } else {
          // console.log(results);
          res.render('editClassMember', {
            title: 'admin Page',
            msg: "",
            results: results
          });
        }
      });
  } else {
    res.render('login', {
      title: 'Sigin in',
      msg: "로그인이 필요한 서비스입니다."
    });
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
  if (req.session.auth === adminAuth) {
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
    console.log('fail');
    res.render('login', {
      title: 'Sigin in',
      msg: "로그인이 필요한 서비스입니다."
    });
  }
});

/*****************
 **
 *
 * Edit User Delete Router
 *
 *
 ***********************/
router.get('/editClassMember/delete', (req, res, next) => {
  if (req.session.auth === adminAuth) {
    connection.query('DELETE FROM tblAttend WHERE name=?', [req.query.target], (error, results) => {
      if (error) {
        console.log(error);
        res.redirect('/admin/editClassMember');
      } else {
        res.redirect('/admin/editClassMember');
      }
    });
  } else {
    res.render('login', {
      title: 'Sigin in',
      msg: "로그인이 필요한 서비스입니다."
    });
  }
});

/*****************
 **
 *
 * Edit User ADD Router
 *
 *
 ***********************/
router.post('/editClassMember/add', (req, res, next) => {
  if (req.session.auth === adminAuth) {
    console.log('name : ', req.body.name);
    connection.query(`INSERT INTO tblAttend (name, grade, class)
      VALUES( ? , ? , ? )`,
      [req.body.name, req.body.grade, req.body.class],
      (error, results) => {
        if (error) {
          console.log(error);
          res.redirect('/admin/editClassMember');
        } else {
          res.redirect('/admin/editClassMember');
        }
      });
  } //session check end
  else {
    res.render('login', {
      title: 'Sigin in',
      msg: "로그인이 필요한 서비스입니다."
    });
  }
});

////////////////////////////////////Edit User End/////////////////////////////////////////////

//
module.exports = router;
