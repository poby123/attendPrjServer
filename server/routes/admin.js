var express = require('express');
var mysql = require('mysql');
const session = require('express-session');
var router = express.Router();

const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');
const constData = require('../config/constants.js');

const connection = mysql.createPool(dbConfig);

router.use(session(sessionAuth));

/* GET home page. */
router.get('/', (req, res) => {
  if (req.session.auth === constData.adminAuth) {
    res.redirect('/admin/state'); //editting state set as default
  } else {
    res.redirect('/');
  }
});

router.get('/state', (req, res) => {
  if (req.session.auth === constData.adminAuth) {
    res.render('admin', {
      title: 'Manmin Youth | Admin',
      msg: '',
      grade: req.session.grade,
      group: req.session.class,
      menu: constData.nav[req.session.auth],
    });
  } else {
    res.redirect('/');
  }
});

router.post('/state/save', (req, res) => {
  if (req.session.auth === constData.adminAuth) {
    let result = { result: true };
    let targetGrade = Number(req.body.grade);
    let targetClass = Number(req.body.class);
    let memory = req.body.memory;

    if (targetGrade && targetClass) {
      req.session.grade = targetGrade;
      req.session.class = targetClass;
      if (memory) {
        connection.query(
          'UPDATE tbluser SET grade=?, class=? WHERE username=?',
          [targetGrade, targetClass, req.session.username],
          (err) => {
            if (err) {
              console.log(err);
            }
          },
        );
      }
      res.json(result);
      res.end();
    } else {
      result.result = false;
      res.json(result);
      res.end();
    }
  } else {
    res.redirect('/');
  }
});

//Edit User
router.get('/editUser', (req, res) => {
  if (req.session.auth === constData.adminAuth) {
    connection.query(
      'SELECT * FROM tbluser WHERE username != ? order by grade',
      [req.session.username],
      (err, result) => {
        if (err) {
          console.log(err);
        }
        res.render('adminEditUser', {
          title: 'Manmin Youth | Admin',
          msg: '',
          results: result,
          menu: constData.nav[req.session.auth],
        });
      },
    );
  } else {
    res.redirect('/');
  }
});

router.post('/editUser', (req, res) => {
  res.redirect('/admin/editUser');
});

router.post('/editUser/save', (req, res) => {
  if (req.session.auth === constData.adminAuth) {
    connection.query(
      'SELECT * FROM tbluser WHERE username != ?',
      [req.session.username],
      (err, results) => {
        if (err) {
          console.log(err);
          res.redirect('/grade/editUser');
        } else {
          for (let i = 0; i < results.length; i++) {
            let username = results[i].username;
            let namegrade = username + 'grade';
            let nameclass = username + 'class';
            let nameauth = username + 'auth';

            if (
              req.body[namegrade] != results[i].grade ||
              req.body[nameclass] != results[i].class ||
              req.body[nameauth] != results[i].auth
            ) {
              connection.query(
                'UPDATE tbluser SET grade=?, class=?, auth=? WHERE username=?',
                [req.body[namegrade], req.body[nameclass], req.body[nameauth], username],
                (err) => {
                  if (err) {
                    console.log(err);
                  }
                },
              );
            }

            if (i === results.length - 1) {
              res.redirect('/admin/editUser');
            }
          } //for
        }
      },
    );
  } else {
    res.redirect('/');
  }
});

router.post('/editUser/delete', (req, res) => {
  if (req.session.auth === constData.adminAuth) {
    let flag = {
      result: true,
    };
    if (req.body.length > 0) {
      //making query
      let query = 'DELETE FROM tblUser WHERE username in (';
      for (let i = 0; i < req.body.length; i++) {
        query += '?';
        if (i != req.body.length - 1) {
          query += ', ';
        } else {
          query += ')';
        }
      }
      connection.query(query, req.body, (err) => {
        if (err) {
          console.log(err);
          flag.result = false;
          res.json(flag);
        } else {
          res.json(flag);
        }
      });
    } else {
      res.json(flag);
    }
  } else {
    res.redirect('/');
  }
});

router.post('/editUser/add', (req, res) => {
  if (req.session.auth === constData.adminAuth) {
    let query = `INSERT INTO tbluser (username, userpass, grade, class, auth) VALUES `;
    let args = [];
    for(let i=0;i<req.body.length;i++){

      if(req.body[i].name && req.body[i].password && req.body[i].grade && req.body[i].class){
        args.push(req.body[i].name);
        args.push(req.body[i].password);
        args.push(req.body[i].grade);
        args.push(req.body[i].class);
        args.push(req.body[i].auth);

        query += ` (?,?,?,?,?)`;
        if(i!=req.body.length-1){
          query += `,`;
        }
      }
    }
    connection.query(query, args, (err)=>{
      let flag = {result : true};
      if(err){
        console.log(err);
        flag.result = false;
        res.json(flag);
      }else{
        res.json(flag);
      }
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
