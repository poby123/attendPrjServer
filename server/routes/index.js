const express = require('express');
const session = require('express-session');

const sessionAuth = require('../config/session.js');

var router = express.Router();

const adminAuth = 4;
const writerAuth = 1;
const adminNav = [
  {nav : "앱 사용자 편집", navLink : "/admin/editUser"},
  {nav : "기관원 목록 편집", navLink : "/admin/editClassMember"},
  {nav : "데이터 보기", navLink : "/board/view"},
  {nav : "기관 출석 체크", navLink : "/board"},
  {nav : "로그아웃", navLink : "/admin/signout"},
];
const userNav = [
  {nav : "데이터 보기", navLink : "/board/view"},
  {nav : "기관 출석 체크", navLink : "/board"},
  {nav : "로그아웃", navLink : "/admin/signout"},
];

router.use(session(sessionAuth));

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.auth >= writerAuth){
    if(req.session.auth === adminAuth){
      res.render('index', {title : 'Manmin Youth', msg : "", menu:adminNav});
    }
    else{
      res.render('index', {title : 'Manmin Youth', msg : "", menu:userNav});
    }
  }else{
    res.render('login', { title: 'Manmin Youth | Sigin in' , msg:""});
  }
});

module.exports = router;
