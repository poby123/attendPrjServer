var express = require('express');
var mysql = require('mysql');
const session = require('express-session');
var router = express.Router();

const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');
const constData = require('../config/constants.js');

const connection = mysql.createPool(dbConfig);

router.use(session(sessionAuth));

//Edit User for executives.
//auth number is inserted in the query as constant. If I change admin number, I must change below number too.
router.get('/editUser', (req, res) => {
  if (req.session.auth === constData.executivesAuth) {
    let query = 'SELECT username, grade, class, auth FROM tbluser where grade= ? AND auth != ?';

    //get Data (admin number inserted.)
    connection.query(query, [req.session.grade, 4], (err, results) => {
      if (err) {
        res.render('index', {
          title: 'Edit User',
          msg: 'error is occured!',
          menu: constData.nav[req.session.auth],
        });
      } else {
        res.render('editUser', {
          title: 'Edit User',
          msg: '',
          results: results,
          menu: constData.nav[req.session.auth],
        });
      }
    });
  } else {
    res.redirect('/');
  }
});

router.post('/editUser', (req, res) => {
  if (req.session.auth === constData.executivesAuth) {
    connection.query('SELECT username FROM tbluser', (err, results) => {
      if (err) {
        console.log(err);
        res.redirect('/grade/editUser');
      } else {
        for (let i = 0; i < results.length; i++) {
          let username = results[i].username;
          let namegrade = username + 'grade';
          let nameclass = username + 'class';
          let nameauth = username + 'auth';

          //to prevent executives change member to other grade.
          if (req.body[namegrade] == req.session.grade) {
            connection.query(
              'UPDATE tbluser SET grade=?, class=?, auth=? WHERE username=?',
              [req.body[namegrade], req.body[nameclass], req.body[nameauth], username],
              (err, result) => {
                if (err) {
                  console.log(err);
                }
              },
            );
          }
          if (i === results.length - 1) {
            res.redirect('/grade/editUser');
          }
        }
      }
    });
  } else {
    res.redirect('/');
  }
});

router.get('/editUser/delete', (req, res) => {
  if (req.session.auth === constData.executivesAuth) {
    //for preventing delete admin self.
    if (req.query.target === req.session.username) {
      res.redirect('/grade/editUser');
    } else {
      connection.query(
        'SELECT auth FROM tbluser WHERE username=?',
        [req.query.target],
        (error, result) => {
          if (error) {
            console.log(error);
            res.redirect('/grade/editUser');
          } else {
            if (constData.authList[Number(result[0].auth)] != constData.adminAuth) {
              connection.query(
                'DELETE FROM tbluser WHERE username=?',
                [req.query.target],
                (error) => {
                  if (error) {
                    console.log(error);
                    res.redirect('/grade/editUser');
                  } else {
                    res.redirect('/grade/editUser');
                  }
                },
              );
            } else {
              res.redirect('/grade/editUser');
            }
          }
        },
      );
    }
  } else {
    res.redirect('/');
  }
});

router.post('/editUser/add', (req, res) => {
  if (req.session.auth === constData.executivesAuth) {
    //prevent executive add admin.
    if (req.body.auth != constData.adminAuth) {
      connection.query(
        `INSERT INTO tbluser (username, userpass, grade, class, auth)
      VALUES( ? , ? , ? , ? , ? )`,
        [req.body.username, req.body.password, req.session.grade, req.body.class, req.body.auth],
        (error) => {
          if (error) {
            console.log(error);
            res.redirect('/grade/editUser');
          } else {
            res.redirect('/grade/editUser');
          }
        },
      );
    } else {
      res.redirect('/grade/editUser');
    }
  } else {
    res.redirect('/');
  }
});

//Edit Notice
router.get('/notice', (req, res) => {
  if (req.session.auth === constData.executivesAuth || req.session.auth === constData.adminAuth) {
    connection.query(
      'SELECT * FROM tblNotice WHERE grade = ?',
      [req.session.grade],
      (err, result) => {
        if (err) {
          console.log(err);
          res.render('notice', {
            title: 'Edit Notice',
            msg: '이전 공지사항을 불어오는 동안 오류가 발생했습니다...',
            menu: constData.nav[req.session.auth],
            notice: '',
            grade: req.session.grade,
          });
        } else {
          let noticeParameter = '';
          if (result.length > 0) {
            noticeParameter = result[0].notice;
          }
          res.render('notice', {
            title: 'Edit Notice',
            msg: '',
            menu: constData.nav[req.session.auth],
            notice: noticeParameter,
            grade: req.session.grade,
          });
        }
      },
    );
  } else {
    req.redirect('/');
  }
});
router.post('/notice/save', (req, res) => {
  if (req.session.auth === constData.executivesAuth || req.session.auth === constData.adminAuth) {
    let flag = {
      result: true,
    };
    connection.query(
      'SELECT * FROM tblNotice WHERE grade = ?',
      [req.session.grade],
      (err, result) => {
        if (err) {
          console.log(err);
          flag.result = false;
          res.send(flag);
        } else {
          let sqlQuery = '';
          let args = [];
          if (result.length > 0) {
            sqlQuery = 'UPDATE tblNotice SET notice=? WHERE grade=?';
          } else {
            sqlQuery = 'INSERT INTO tblNotice (notice, grade) VALUES (?,?)';
          }
          // console.log(req.body);
          args.push(req.body.noticeContent);
          args.push(req.session.grade);
          connection.query(sqlQuery, args, (updateErr) => {
            if (updateErr) {
              console.log(updateErr);
              flag.result = false;
            } else {
              flag.result = true;
            }
            res.send(flag);
          });
        }
      },
    );
  } else {
    req.redirect('/');
  }
});

//Edit Planner
router.get('/planner', (req, res) => {
  if (req.session.auth === constData.executivesAuth || req.session.auth === constData.adminAuth) {
    connection.query(
      'SELECT * FROM tblplanner where grade=? ORDER BY no ASC',
      [req.session.grade],
      (err, result) => {
        if (err) {
          console.log(err);
          res.render('planner', {
            title: 'Planner',
            msg: 'Error is occured during get data!',
            result: 0,
            menu: constData.nav[req.session.auth],
          });
        } else {
          console.log('result.length : ', result.length);
          if (result.length === 0) {
            res.render('planner', {
              title: 'Planner',
              msg: '',
              result: 0,
              menu: constData.nav[req.session.auth],
            });
          } else {
            res.render('planner', {
              title: 'Planner',
              msg: '',
              result: result,
              menu: constData.nav[req.session.auth],
            });
          }
        }
      },
    );
  } else {
    res.redirect('/');
  }
});
router.put('/planner/save', (req, res) => {
  if (req.session.auth === constData.executivesAuth || req.session.auth === constData.adminAuth) {
    //make query
    let updatePlannerQuery = `UPDATE tblplanner SET`;
    let updatePlannerSundayQuery = `sundayContent = case no`;
    let updatePlannerTuesdayQuery = `tuesdayContent = case no`;
    let updatePlannerDisplayQuery = `display = case no`;
    let updatePlannerQueryTail = `where no in (`;
    for (let i = 0; i < req.body.length; i++) {
      updatePlannerSundayQuery += ` when ? then ? `;
      updatePlannerTuesdayQuery += ` when ? then ? `;
      updatePlannerDisplayQuery += ` when ? then ? `;
      updatePlannerQueryTail += ` ?`;
      if (i != req.body.length - 1) {
        updatePlannerQueryTail += `,`;
      }
    }
    updatePlannerSundayQuery += `END, `;
    updatePlannerTuesdayQuery += `END, `;
    updatePlannerDisplayQuery += `END `;
    updatePlannerQueryTail += `)`;
    updatePlannerQuery =
      updatePlannerQuery +
      ` ` +
      updatePlannerSundayQuery +
      ` ` +
      updatePlannerTuesdayQuery +
      ` ` +
      updatePlannerDisplayQuery +
      ` ` +
      updatePlannerQueryTail;

    let arg = [];
    for (let i = 0; i < req.body.length; i++) {
      arg.push(req.body[i].no); // number push
      arg.push(req.body[i].sunday); //sunday push
    }
    for (let i = 0; i < req.body.length; i++) {
      arg.push(req.body[i].no); // number push
      arg.push(req.body[i].tuesday); //tuesday push
    }
    for (let i = 0; i < req.body.length; i++) {
      arg.push(req.body[i].no); // number push
      arg.push(req.body[i].display); //sunday push
    }
    for (let i = 0; i < req.body.length; i++) {
      arg.push(req.body[i].no); // number push
    }
    connection.query(updatePlannerQuery, arg, (err, result) => {
      if (err) {
        console.log(err);
        res.send({ result: false });
      } else {
        res.send({ result: true });
      }
    });
  } else {
    res.redirect('/');
  }
});
router.get('/planner/make', (req, res) => {
  if (req.session.auth === constData.executivesAuth || req.session.auth === constData.adminAuth) {
    connection.query(
      `SELECT COUNT(*) FROM tblplanner where grade=?`,
      [req.session.grade],
      (err, result) => {
        if (err) {
          console.log(err);
          res.redirect('/class/board');
        }
        //there is no planner table
        else if (result[0]['COUNT(*)'] === 0) {
          console.log('insert table');
          let makequery = `INSERT INTO tblplanner(grade, month, week) VALUES`;
          let arg = [];
          for (let i = 1; i <= 12; i++) {
            for (let j = 1; j <= 5; j++) {
              if (i == 12 && j == 5) {
                makequery += `(?, ?, ?)`;
              } else {
                makequery += `(?, ?, ?),`;
              }
              arg.push(req.session.grade);
              arg.push(i);
              arg.push(j);
            }
          }
          //console.log(makequery);
          connection.query(makequery, arg, (err, result) => {
            if (err) {
              console.log(err);
              res.render('planner', {
                title: 'Planner',
                msg: 'Error is occured during make planner table',
                menu: constData.nav[req.session.auth],
              });
            } else {
              res.redirect('/grade/planner');
            }
          });
        } else {
          console.log('already exist');
          res.redirect('/grade/planner');
        }
      },
    );
  }
});

module.exports = router;
