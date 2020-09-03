var express = require("express");
var mysql = require("mysql");
const session = require("express-session");
var router = express.Router();

const dbConfig = require("../config/database.js");
const sessionAuth = require("../config/session.js");
const constData = require("../config/constants.js");

const connection = mysql.createPool(dbConfig);

router.use(session(sessionAuth));

router.get("/", (req, res) => {
	if (req.session.auth === constData.executivesAuth || req.session.auth === constData.adminAuth) {
		connection.query("SELECT * FROM tblNotice WHERE grade = ?", [req.session.grade], (err, result) => {
			if (err) {
				console.log(err);
				res.render("notice", {
					title: "Edit Notice",
					msg: "이전 공지사항을 불어오는 동안 오류가 발생했습니다...",
					menu: constData.nav[req.session.auth],
					notice: "",
					grade: req.session.grade,
				});
			} else {
				let noticeParameter = "";
				if (result.length > 0) {
					noticeParameter = result[0].notice;
				}
				res.render("notice", {
					title: "Edit Notice",
					msg: "",
					menu: constData.nav[req.session.auth],
					notice: noticeParameter,
					grade: req.session.grade,
				});
			}
		});
	} else {
		req.redirect("/");
	}
});
router.post("/save", (req, res) => {
	if (req.session.auth === constData.executivesAuth || req.session.auth === constData.adminAuth) {
		let flag = {
			result: true,
		};
		connection.query("SELECT * FROM tblNotice WHERE grade = ?", [req.session.grade], (err, result) => {
			if (err) {
				console.log(err);
				flag.result = false;
				res.send(flag);
			} else {
				let sqlQuery = "";
				let args = [];
				if (result.length > 0) {
					sqlQuery = "UPDATE tblNotice SET notice=? WHERE grade=?";
				} else {
					sqlQuery = "INSERT INTO tblNotice (notice, grade) VALUES (?,?)";
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
		});
	} else {
		req.redirect("/");
	}
});
module.exports = router;
