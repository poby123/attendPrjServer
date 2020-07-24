/*

  The Board Router for sending tblAttend to client and saving request data.

*/
var express = require('express');
var mysql = require('mysql');
const session = require('express-session');
var router = express.Router();

const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');

const connection = mysql.createPool(dbConfig);

router.use(session(sessionAuth));

/*******************

  Send Attend Board data to Client

*********************/
router.get('/', (req, res, next) => {
  console.log('/board router is called!');
  console.log(req.session.username);
  if (req.session.username) {
    if (req.session.auth === 1) { //기관장단
      connection.query('SELECT * FROM tblAttend where class = ?', [req.session.class], (err, results) => {
        if (err) {
          console.log(err);
          let data = {
            result: false
          };
          res.json(data);
        } else {
          let data = {
            result: true,
            table: results,
          }
          res.json(data);
        } // else end
      }); //query end
    } //if end
    else if (req.session.auth > 1) { //선교회 회장단
      connection.query('SELECT * FROM tblAttend where grade = ?', [req.session.grade], (err, results) => {
        if (err) {
          console.log(err);
          let data = {
            result: false
          };
          res.json(data);
        } else {
          let data = {
            result: true,
            table: results,
          }
          res.json(data);
        } // else end
      }); //query end
    } //else if req.session.auth > 1 end
  } else {
    console.log('username session does not exist!');
    let data = {
      result: false,
    }
    res.json(data);
  }
  // console.log(data);
});


/*******************

  Save Requseted Data

*********************/
router.put('/save', (req, res, next) => {
  let data = {
    result: true
  };
  const current = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
    day : date.day(); //0은 일요일
  } //current value end

  //block saving other day
  if(current.day !== 0){
    data.result = false;
    res.json(data);
  }

  else if (req.session.username) {
    console.log(req.body);
    let date = new Date();
    let endUpdate = false;

    for (let i = 0; i < req.body.length; i++) {
      //update tblAttend
      connection.query('UPDATE tblAttend SET meeting=?,tue=? where name=?',
        [req.body[i][1], req.body[i][2], req.body[i][0]], (err, updateAttendResult) => {
          if (err) {
            data.result = false;
            console.log(err);
          }else{
            if(i === req.body.length - 1){ //if it is last loop update or insert to tblTotal
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

                          console.log('numTue : ', numTue, " numMeeting : ", numMeeting);

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
    }//for end
    res.json(data);
  } else {
    console.log('username session does not exist!');
    res.json(data);
  }
});


module.exports = router;
