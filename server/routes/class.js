var express = require('express');
var mysql = require('mysql');
const session = require('express-session');
var router = express.Router();

const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');
const constData = require('../config/constants.js');

const connection = mysql.createPool(dbConfig);

router.use(session(sessionAuth));

//Attendance Check Board
router.get('/board', (req, res) => {
  if (req.session.auth) {
    connection.query(
      'SELECT * FROM tblAttend where class = ? AND grade = ?',
      [req.session.class, req.session.grade],
      (err, results) => {
        if (err) {
          console.log(err);
          res.render('board', {
            title: 'Board',
            msg: 'Error is Occured!',
            menu: constData.nav[req.session.auth],
          });
        } else {
          res.render('board', {
            title: 'Board',
            msg: '',
            menu: constData.nav[req.session.auth],
            results: results,
          });
        } // else end
      },
    ); //query end
  } else {
    console.log('username session does not exist!');
    res.render('login', {
      title: 'Signin',
      msg: '로그아웃 상태입니다',
      menu: '',
    });
  }
});

router.put('/board/save', (req, res) => {
  console.log('/board/save router is called');
  let isNoError = true;
  let date = new Date();
  const current = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
    day: date.getDay(), //0 is sunday
  };

  if (req.session.auth) {
    console.log('if username is exist');
    console.log('req.body : ', req.body);

    //make query for update tblattend
    let updateAttendQuery = `UPDATE tblattend SET`;
    let updateAttendMeetingQuery = `meeting = case name`;
    let updateAttendTueQuery = `tue = case name`;
    let updateAttendQueryTail = `where name in (`;
    for (let i = 0; i < req.body.length; i++) {
      updateAttendMeetingQuery += ` when ? then ? `;
      updateAttendTueQuery += ` when ? then ? `;
      updateAttendQueryTail += ` ?`;
      if (i != req.body.length - 1) {
        updateAttendQueryTail += `,`;
      }
    }
    updateAttendMeetingQuery += `END, `;
    updateAttendTueQuery += `END`;
    updateAttendQueryTail += `)`;
    updateAttendQuery =
      updateAttendQuery +
      ` ` +
      updateAttendMeetingQuery +
      ` ` +
      updateAttendTueQuery +
      ` ` +
      updateAttendQueryTail;

    //make argument for update tblattend
    let arg = [];
    for (let i = 0; i < req.body.length; i++) {
      arg.push(req.body[i][0]); // name push
      arg.push(req.body[i][1]); //meeting push
    }
    for (let i = 0; i < req.body.length; i++) {
      arg.push(req.body[i][0]); // name push
      arg.push(req.body[i][2]); //tue push
    }
    for (let i = 0; i < req.body.length; i++) {
      arg.push(req.body[i][0]); // name push
    }

    //update tblAttend
    connection.query(updateAttendQuery, arg, (err, result) => {
      if (err) {
        isNoError = false;
        console.log(err);
      } else {
        //check to make a decision do insert or update tblTotal
        connection.query(
          `SELECT COUNT(*) FROM tblTotal WHERE grade=? AND class=?
          AND YEAR(regDate)=? AND MONTH(regDate)=? AND DAY(regDate)=?`,
          [req.session.grade, req.session.class, current.year, current.month, current.date],
          (err, checkExistResult) => {
            if (err) {
              console.log(err);
              isNoError = false;
            } else {
              //variable to count number
              let numTue = 0;
              let numMeeting = 0;

              //get data that is sum of tue and meeting data
              connection.query(
                `
                  SELECT * FROM tblattend WHERE grade=? AND class=?`,
                [req.session.grade, req.session.class],
                (err, results) => {
                  if (err) {
                    console.log(err);
                    isNoError = false;
                  } else {
                    for (let i = 0; i < results.length; i++) {
                      if (results[i].tue === 1) {
                        numTue++;
                      }
                      if (results[i].meeting === 1) {
                        numMeeting++;
                      }
                    } //for end

                    //if there is no data, insert into table
                    if (checkExistResult[0]['COUNT(*)'] === 0) {
                      console.log('In Insert numTue : ', numTue, ' numMeeting : ', numMeeting);

                      connection.query(
                        `INSERT INTO tblTotal(grade, class, regDate, tue, meeting)
                          VALUES(?,?,NOW(),?,?)`,
                        [req.session.grade, req.session.class, numTue, numMeeting],
                        (err, insertResult) => {
                          if (err) {
                            isNoError = false;
                            console.log(err, ' in insert tblTotal');
                          } else {
                            res.send({ result: true });
                          }
                        },
                      );
                    } //if not exist end

                    //if there is data, update table
                    else {
                      console.log('In Update numTue : ', numTue, ' numMeeting : ', numMeeting);
                      connection.query(
                        `UPDATE tbltotal SET tue=?, meeting=?
                            WHERE grade=? AND class=? AND
                            YEAR(regdate)=? AND MONTH(regdate)=? AND DAY(regdate)=?`,
                        [
                          numTue,
                          numMeeting,
                          req.session.grade,
                          req.session.class,
                          current.year,
                          current.month,
                          current.date,
                        ],
                        (err, insertResult) => {
                          if (err) {
                            isNoError = false;
                            console.log(err, ' in update tblTotal');
                          } else {
                            //update and no error
                            res.send({ result: true });
                          }
                        },
                      );
                    } //else exist end
                  } //err else end
                },
              ); //get sum of tue and meeting data query end
            } //not occured err end
          },
        ); //check to make a decision query end
      } //no err

      //error case
      if (!isNoError) {
        res.send({ result: false });
      }
    });
  } else {
    console.log('session does not exist!');
    req.get('/');
  }
});

//View attendance data
router.get('/board/view', (req, res) => {
  if (req.session.auth) {
    let date = new Date();
    const current = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date: date.getDate(),
    };
    let targetGrade = req.session.grade;
    let targetClass = req.session.class;
    let targetYear = current.year;
    let targetMonth = current.month;

    const isValid = (arg) => {
      return arg != '' && arg != undefined;
    };

    //if query parameter is exist, change target variable to query arguments.
    if (isValid(req.query.grade)) {
      targetGrade = req.query.grade;
    }
    if (isValid(req.query.class)) {
      targetClass = req.query.class;
    }
    if (isValid(req.query.date)) {
      let d = new Date(req.query.date);
      targetYear = d.getFullYear();
      targetMonth = d.getMonth() + 1;
      targetDate = d.getDate();
    }

    //this "0" means all class
    if (targetClass === '0') {
      //get grade data
      console.log('get Grade View Data');
      connection.query(
        `SELECT * FROM tblTotal WHERE grade=? AND
      YEAR(regDate)=? AND MONTH(regDate)=? ORDER BY regDate ASC, class ASC`,
        [targetGrade, targetYear, targetMonth],
        (err, results) => {
          if (err) {
            console.log(err);
            res.render('view', {
              title: 'View',
              msg: 'error is occured',
              results: '',
              menu: constData.nav[req.session.auth],
            });
          } else {
            res.render('view', {
              title: 'View',
              msg: '',
              results: results,
              menu: constData.nav[req.session.auth],
            });
          }
        },
      ); //query end
    } else {
      //get class data
      console.log('get class view data');
      connection.query(
        `SELECT * FROM tblTotal WHERE grade=? AND class=? AND
      YEAR(regDate)=? AND MONTH(regDate)=? ORDER BY regDate`,
        [targetGrade, targetClass, targetYear, targetMonth],
        (err, results) => {
          if (err) {
            console.log(err);
            res.render('view', {
              title: 'View',
              msg: 'error is occured',
              results: '',
              menu: constData.nav[req.session.auth],
            });
          } else {
            res.render('view', {
              title: 'View',
              msg: '',
              results: results,
              menu: constData.nav[req.session.auth],
            });
          }
        },
      ); //query end
    }
  } else {
    res.redirect('/');
  }
});

//Edit Class Member
router.post('/editClassMember', (req, res) => {
  if (req.session.auth) {
    connection.query('SELECT name FROM tblAttend', (err, results) => {
      if (err) {
        console.log(err);
        res.redirect('/class/board');
      } else {
        for (let i = 0; i < results.length; i++) {
          let name = results[i].name;
          let namegrade = name + 'grade';
          let nameclass = name + 'class';
          connection.query(
            'UPDATE tblAttend SET grade=?, class=? WHERE name=?',
            [req.body[namegrade], req.body[nameclass], name],
            (err, result) => {
              if (err) {
                console.log(err);
              }
            },
          );
        }
        res.redirect('/class/board');
      }
    });
  } else {
    res.redirect('/');
  }
});

router.get('/editClassMember/delete', (req, res) => {
  //It is allowed to all logined people.
  if (req.session.auth) {
    //flag for distinguish where request is from. if it is from /board, this variable'll be true.
    connection.query('DELETE FROM tblAttend WHERE name=?', [req.query.target], (error) => {
      if (error) {
        console.log(error);
        res.redirect('/class/board');
      } else {
        res.redirect('/class/board');
      }
    });
  } else {
    res.redirect('/');
  }
});

router.post('/editClassMember/add', (req, res) => {
  if (req.session.auth) {
    if (req.body) {
      let sqlQuery = `INSERT INTO tblattend (name, grade, class) VALUES `;
      let userGrade = req.session.grade;
      let userClass = req.session.class;
      let queryArgs = [];

      for (let i = 0; i < req.body.length; i++) {
        queryArgs.push(req.body[i]);
        queryArgs.push(userGrade);
        queryArgs.push(userClass);

        sqlQuery += ' ( ?,  ?,  ?) ';
        if (i != req.body.length - 1) {
          sqlQuery += ',';
        }
      }
      sqlQuery += ';';
      connection.query(sqlQuery, queryArgs, (err) => {
        let result = { result: true };
        if (err) {
          console.log(err);
          result.result = false;
        }
        res.json(result);
      });
    } else {
      let result = { result: false };
      res.json(result);
    }
  } else {
    res.redirect('/');
  }
});

module.exports = router;
