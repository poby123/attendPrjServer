/*
  The authentication Router for signin and signout etc of client side.
*/
var express = require("express");
var mysql = require("mysql");
const session = require("express-session");
var router = express.Router();

const dbConfig = require("../config/database.js");
const sessionAuth = require("../config/session.js");
const constData = require("../config/constants.js");

const connection = mysql.createPool(dbConfig);
router.use(session(sessionAuth));

/////////////////////////////////// Sign in, out Start //////////////////////////////////////////////

/*****************
 **
 *
 * Sign in Router
 *
 *
 ***********************/
router.get("/sigin", (req, res) => {
	res.redirect("/");
});
router.post("/signin", (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	connection.query("SELECT * FROM tbluser where username=? and userpass=?", [username, password], function (err, results) {
		if (err) {
			console.log(err);
		}
		//when auth is 0, forbid login.
		else if (results.length == 1 && results[0].auth != 0) {
			req.session.username = results[0].username;
			req.session.grade = results[0].grade;
			req.session.class = results[0].class;

			//auth saving.
			//the array of 0 index is must be false.
			req.session.auth = constData.authList[Number(results[0].auth)]; //save auth at session.

			//session saving.
			req.session.save(function () {
				console.log("login Success!, name: ", results[0].username);
				res.redirect("/");
			});
		} else {
			console.log("not found");
			res.render("login", {
				title: "Sigin in",
				msg: "아이디나 비밀번호가 틀렸습니다",
				menu: "",
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
router.get("/signout", (req, res) => {
	if (req.session.auth) {
		let link = "/";
		//if user want to redirect other page.
		if (req.query.link) {
			if (req.query.link === "true") {
				link = "http://check.manmin.org/";
			}
		}
		req.session.destroy((err) => {
			if (err) {
				console.log(err);
				res.redirect("/");
			} else {
				req.session;
				console.log("signout success");
				if (link === "/") {
					res.render("signout", { title: "Sign out", msg: "Good Bye!", menu: "" });
				} else {
					res.redirect(link);
				}
			}
		});
	}
});
////////////////////////////////////// Sign in, out Router End///////////////////////////////////////////
module.exports = router;
