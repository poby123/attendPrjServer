/*

  The Board Router for sending tblAttend to client and saving request data.

*/
var express = require('express');
var mysql = require('mysql');
const session = require('express-session');
var router = express.Router();

const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');
const constData = require('../config/constants.js');

const connection = mysql.createPool(dbConfig);

router.use(session(sessionAuth));

/*******************

  Send Attend Board data to Client

*********************/
router.get('/', (req, res, next) => {
  console.log('/board router is called!');
  console.log(req.session.username);
  if (req.session.username) {
    let msg = '';

    if (req.session.auth >= constData.writerAuth) { //기관장단 이상
      connection.query('SELECT * FROM tblAttend where class = ?', [req.session.class], (err, results) => {
        if (err) { //when case error
          console.log(err);
          let data = {
            result: false
          };
          if (req.session.isApp) {
            res.json(data);
          } else { //not app using
            if (req.session.auth === constData.adminAuth) {
              res.render('board', {
                title: 'Board',
                msg: 'Error is Occured!',
                menu: constData.adminNav
              });
            } else {
              res.render('board', {
                title: 'Board',
                msg: 'Error is Occured!',
                menu: constData.userNav
              });
            }
          }
        } else { //not occured error
          let data = {
            result: true,
            table: results,
          }
          if (req.session.isApp) { //app using
            res.json(data);
          } else { //not app approach
            //console.log(results);
            console.log('session class : ', req.session.class);
            if (req.session.auth === constData.adminAuth) {
              res.render('board', {
                title: 'Board',
                msg: msg,
                menu: constData.adminNav,
                results: results
              });
            } else {
              res.render('board', {
                title: 'Board',
                msg: msg,
                menu: constData.userNav,
                results: results
              });
            }
          }
        } // else end
      }); //query end
    } //if end
  } else {
    console.log('username session does not exist!');
    let data = {
      result: false,
    }
    if (req.session.isApp) {
      res.json(data);
    } else {
      res.render('login', {
        title: 'Board',
        msg: '로그아웃 상태입니다',
        menu: '',
      });
    }
  }
  // console.log(data);
});

/////////////////////////////////// View Data Start //////////////////////////////////////////////

router.get('/view', (req, res, next) => {
  if (req.session.auth >= constData.writerAuth) {
    let date = new Date();
    const current = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date: date.getDate(),
    } //current value end
    let targetGrade = 1;
    let targetClass = 0;
    let targetYear = current.year;
    let targetMonth = current.month;
    let targetDate = current.date;
    console.log('grade : ', req.query.grade);
    console.log('class : ', req.query.class);

    if (req.query.grade != '' && req.query.grade != undefined) {
      targetGrade = req.query.grade;
    }
    if (req.query.class != '' && req.query.class != undefined) {
      targetClass = req.query.class;
    }
    if (req.query.date != '' && req.query.date != undefined) {
      let d = new Date(req.query.date);
      targetYear = d.getFullYear();
      targetMonth = d.getMonth() + 1;
      targetDate = d.getDate();
    }

    if (targetClass === 0) { //get grade data
      console.log('get Grade View Data');
      connection.query(`SELECT * FROM tblTotal WHERE grade=? AND
      YEAR(regDate)=? AND MONTH(regDate)=? ORDER BY regDate ASC, class ASC`,
        [targetGrade, targetYear, targetMonth], (err, results) => {
          if (err) {
            console.log(err);
            if (req.session.auth === constData.adminAuth) {
              res.render('view', {
                title: 'View',
                msg: 'error is occured',
                results: '',
                menu: constData.adminNav,
              });
            } else {
              res.render('view', {
                title: 'View',
                msg: 'error is occured',
                results: '',
                menu: constData.userNav,
              });
            }
          }
          console.log('get grade data done.');
          //console.log(results);

          if (req.session.auth === constData.adminAuth) {
            res.render('view', {
              title: 'View',
              msg: "",
              results: results,
              menu: constData.adminNav,
            });
          } else {
            res.render('view', {
              title: 'View',
              msg: "",
              results: results,
              menu: constData.userNav,
            });
          }
        }); //query end
    } else { //get class data
      console.log('get class view data');
      connection.query(`SELECT * FROM tblTotal WHERE grade=? AND class=? AND
      YEAR(regDate)=? AND MONTH(regDate)=? ORDER BY regDate`,
        [targetGrade, targetClass, targetYear, targetMonth], (err, results) => {
          if (err) {
            console.log(err);
            if (req.session.auth === constData.adminAuth) { //case auth
              res.render('view', {
                title: 'View',
                msg: 'error is occured',
                results : '',
                menu: constData.adminNav,
              });
            } else { //throw error and not auth
              res.render('view', {
                title: 'View',
                msg: 'error is occured',
                results : '',
                menu: constData.userNav
              });
            } //else end
          } //err end
          else { //else err
            if (req.session.auth === constData.adminAuth) {
              res.render('view', {
                title: 'View',
                msg: "",
                results: results,
                menu: constData.adminNav,
              });
            } else { //else not admin
              res.render('view', {
                title: 'View',
                msg: "",
                results: results,
                menu: constData.userNav,
              });
            }
          }
        }); //query end
    }
  } else {
    res.redirect('/');
  }
});

/////////////////////////////////// View Data End //////////////////////////////////////////////

/*******************

  Save Requseted Data

*********************/
router.put('/save', (req, res, next) => {
  console.log('/board/save router is called');
  let data = {
    result: true
  };
  let date = new Date();
  const current = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
    day: date.getDay(), //0은 일요일
  } //current value end

  //block saving other day
  /*if(current.day !== 0){
    data.result = false;
    res.json(data);
  }*/

  /*else */
  if (req.session.username) {
    console.log('if username is exist');
    console.log('req.body : ', req.body);
    let endUpdate = false;

    for (let i = 0; i < req.body.length; i++) {
      //update tblAttend
      connection.query('UPDATE tblAttend SET meeting=?,tue=? where name=?',
        [req.body[i][1], req.body[i][2], req.body[i][0]], (err, updateAttendResult) => {
          if (err) {
            data.result = false;
            console.log(err);
          } else {
            if (i === req.body.length - 1) { //if it is last loop update or insert to tblTotal
              //check to make a decision do insert or update tblTotal
              connection.query(`SELECT COUNT(*) FROM tblTotal WHERE grade=? AND class=?
              AND YEAR(regDate)=? AND MONTH(regDate)=? AND DAY(regDate)=?`,
                [req.session.grade, req.session.class, current.year, current.month, current.date],
                (err, checkExistResult) => {
                  if (err) {
                    console.log(err);
                    data.result = false;
                  } else {
                    let numTue = 0;
                    let numMeeting = 0;

                    //get sum of tue and meeting data
                    connection.query(`
                    SELECT * FROM tblattend WHERE grade=? AND class=?`,
                      [req.session.grade, req.session.class],
                      (err, results) => {
                        if (err) {
                          console.log(err);
                          data.result = false;
                        } else {
                          for (let i = 0; i < results.length; i++) {
                            if (results[i].tue === 1) {
                              numTue++;
                            }
                            if (results[i].meeting === 1) {
                              numMeeting++;
                            }
                          } //for end

                          //console.log('numTue : ', numTue, " numMeeting : ", numMeeting);

                          //if there is no data, insert into table
                          if (checkExistResult[0]['COUNT(*)'] === 0) {
                            console.log('In Insert numTue : ', numTue, " numMeeting : ", numMeeting);

                            connection.query(`INSERT INTO tblTotal(grade, class, regDate, tue, meeting)
                            VALUES(?,?,NOW(),?,?)`,
                              [req.session.grade, req.session.class, numTue, numMeeting],
                              (err, insertResult) => {
                                if (err) {
                                  data.result = false;
                                  console.log(err, ' in insert tblTotal');
                                }
                              });
                          } //if not exist end

                          //if there is data, update table
                          else {
                            console.log('In Update numTue : ', numTue, " numMeeting : ", numMeeting);

                            connection.query(`UPDATE tbltotal SET tue=?, meeting=?
                              WHERE grade=? AND class=? AND
                              YEAR(regdate)=? AND MONTH(regdate)=? AND DAY(regdate)=?`,
                              [numTue, numMeeting, req.session.grade, req.session.class,
                                current.year, current.month, current.date
                              ],
                              (err, insertResult) => {
                                if (err) {
                                  data.result = false;
                                  console.log(err, ' in update tblTotal');
                                }
                              });
                          } //else exist end

                        } //err else end
                      }); //get sum of tue and meeting data query end
                  } //not occured err end
                }); //check to make a decision query end
            } //data.result == true end

          } //else err end
        }); //update tblattend query end
    } //for end
    if (req.session.isApp) { //app
      res.json(data);
    } //if app end
    else { //web
      console.log('save result : ', data.result);
      if(data.result === true){
        res.send({result : true});
      }
       else{
        res.send({result : false});
      } 
    } //else web end
  }
  else { //no session
    console.log('username session does not exist!');
    if (req.session.isApp) { //
      res.json(data);
    }
    else { //no session and web
      req.get('/');
    }
  }
}); //board save end


module.exports = router;
