var express = require("express");
var mysql = require("mysql");
const session = require("express-session");
var router = express.Router();

const dbConfig = require("../config/database.js");
const sessionAuth = require("../config/session.js");
const constData = require("../config/constants.js");

const connection = mysql.createPool(dbConfig);
router.use(session(sessionAuth));

/* GET home page. */
router.get("/", function (req, res, next) {
	if (req.session.auth) {
		let date = new Date();
		let month = date.getMonth() + 1;
		let noticeContent = "";
		connection.query("SELECT * FROM tblNotice where grade = ?", [req.session.grade], (err, results) => {
			if (err) {
				console.log(err);
			} else {
				console.log(results[0]);
				if (results.length > 0) {
					if (results[0].notice) {
						noticeContent = results[0].notice;
					}
				}
			}
			connection.query(`SELECT * FROM tblPlanner WHERE month = ? AND grade = ?`, [month, req.session.grade, true], (err, result) => {
				if (err) {
					console.log(err);
					res.render("index", {
						title: "Manmin Youth",
						msg: "",
						result: "",
						menu: constData.nav[req.session.auth],
						notice: noticeContent,
					});
				} else {
					console.log("no error to get table");
					res.render("index", {
						title: "Manmin Youth",
						msg: "",
						result: result,
						menu: constData.nav[req.session.auth],
						notice: noticeContent,
					});
				}
			}); //get planner query end
		}); //get notice query end
	} else {
		res.render("login", { title: "Manmin Youth | Sigin in", msg: "", menu: "" });
	}
});

module.exports = router;
