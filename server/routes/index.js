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

		connection.query(`SELECT * FROM tblPlanner WHERE month = ? AND grade = ?`, [month, req.session.grade, true], (err, result) => {
			if (err) {
				console.log(err);
				res.render("index", { title: "Manmin Youth", msg: "", result: "", menu: constData.nav[req.session.auth] });
			} else {
				console.log("no error to get table");
				res.render("index", { title: "Manmin Youth", msg: "", result: result, menu: constData.nav[req.session.auth] });
			}
		});
	} else {
		res.render("login", { title: "Manmin Youth | Sigin in", msg: "", menu: "" });
	}
});

module.exports = router;
