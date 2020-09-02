/*

  The Admin Router For only Administor's Signin, Signout, Member Editing.

*/
var express = require("express");
var mysql = require("mysql");
const session = require("express-session");
var xl = require("excel4node"); /*https://www.npmjs.com/package/excel4node*/
var router = express.Router();

const dbConfig = require("../config/database.js");
const sessionAuth = require("../config/session.js");
const constData = require("../config/constants.js");

const connection = mysql.createPool(dbConfig);

router.use(session(sessionAuth));

/* GET home page. */
router.get("/", (req, res) => {
	res.redirect("/");
});

///////////////////////////////////////// Edit User Start ////////////////////////////////////////////
/*****************
 **
 *
 * editUser Router
 *
 *
 ***********************/
router.get("/editUser", (req, res) => {
	if (req.session.auth === constData.adminAuth) {
		connection.query("SELECT username, grade, class, auth FROM tbluser", (err, results) => {
			if (err) {
				res.render("index", {
					title: "admin Page",
					msg: "error is occured!",
					menu: constData.nav[constData.adminAuth],
				});
			} else {
				res.render("editUser", {
					title: "admin Page",
					msg: "",
					results: results,
					menu: constData.nav[constData.adminAuth],
				});
			}
		});
	} else {
		res.redirect("/");
	}
});

/*****************
 **
 *
 * Edit User post router
 *
 *
 ***********************/
router.post("/editUser", (req, res) => {
	if (req.session.auth === constData.adminAuth) {
		connection.query("SELECT username FROM tbluser", (err, results) => {
			if (err) {
				console.log(err);
				res.redirect("/admin/editUser");
			} else {
				for (let i = 0; i < results.length; i++) {
					let username = results[i].username;
					let namegrade = username + "grade";
					let nameclass = username + "class";
					let nameauth = username + "auth";
					connection.query("UPDATE tbluser SET grade=?, class=?, auth=? WHERE username=?", [req.body[namegrade], req.body[nameclass], req.body[nameauth], username], (err, result) => {
						if (err) {
							console.log(err);
						}
					});
				}
				res.redirect("/admin/editUser");
			}
		});
	} else {
		res.redirect("/");
	}
});

/*****************
 **
 *
 * Edit User Delete Router
 *
 *
 ***********************/
router.get("/editUser/delete", (req, res) => {
	if (req.session.auth === constData.adminAuth) {
		//console.log(req.query.target);

		//for preventing delete admin self.
		if (req.query.target === req.session.username) {
			res.redirect("/admin/editUser");
		} else {
			connection.query("DELETE FROM tbluser WHERE username=?", [req.query.target], (error, results) => {
				if (error) {
					console.log(error);
					res.redirect("/admin/editUser");
				} else {
					res.redirect("/admin/editUser");
				}
			});
		}
	} else {
		res.redirect("/");
	}
});

/*****************
 **
 *
 * Edit User ADD Router
 *
 *
 ***********************/
router.post("/editUser/add", (req, res) => {
	if (req.session.auth === constData.adminAuth) {
		//prevent add admin selves.
		if (req.body.username === req.session.username) {
			res.redirect("/admin/editUser");
		} else {
			connection.query(
				`INSERT INTO tbluser (username, userpass, grade, class, auth)
      VALUES( ? , ? , ? , ? , ? )`,
				[req.body.username, req.body.password, req.body.grade, req.body.class, req.body.auth],
				(error, results) => {
					if (error) {
						console.log(error);
						res.redirect("/admin/editUser");
					} else {
						res.redirect("/admin/editUser");
					}
				}
			);
		} //admin add check end
	} //session check end
	else {
		res.redirect("/");
	}
});

///////////////////////////////////////////Edit User End/////////////////////////////////////////////

///////////////////////////////////// Edit Class Member Start ////////////////////////////////////////////
/*****************
 **
 *
 * edit Class Member Router
 *
 *
 ***********************/
router.get("/editClassMember", (req, res) => {
	if (req.session.auth === constData.adminAuth) {
		let selectedGrade = req.session.grade;
		let selectedClass = 0;
		if (req.query.grade !== undefined && req.query.grade !== "") selectedGrade = req.query.grade;
		if (req.query.class !== undefined && req.query.class !== "") selectedClass = req.query.class;

		let selectQuery = "SELECT * FROM tblAttend WHERE grade=? ";
		let arg = [selectedGrade];
		if (selectedClass !== 0) {
			selectQuery += "AND class = ? ";
			arg.push(selectedClass);
		}
		selectQuery += " ORDER BY class ASC";

		connection.query(selectQuery, arg, (err, results) => {
			if (err) {
				console.log(err);
				res.render("editUser", {
					title: "admin Page",
					msg: "error is occured to get attend table",
					menu: constData.nav[constData.adminAuth],
				});
			} else {
				res.render("editClassMember", {
					title: "admin Page",
					msg: "",
					results: results,
					menu: constData.nav[constData.adminAuth],
				});
			}
		});
	} else {
		res.redirect("/");
	}
});

/*****************
 **
 *
 * Edit class member post router
 * It is allowed to class leader also.
 *
 *
 ***********************/
router.post("/editClassMember", (req, res) => {
	//It is allowed to all logined people.
	if (req.session.auth) {
		connection.query("SELECT name FROM tblAttend", (err, results) => {
			if (err) {
				console.log(err);
				res.redirect("/admin/editClassMember");
			} else {
				for (let i = 0; i < results.length; i++) {
					let name = results[i].name;
					let namegrade = name + "grade";
					let nameclass = name + "class";
					connection.query("UPDATE tblAttend SET grade=?, class=? WHERE name=?", [req.body[namegrade], req.body[nameclass], name], (err, result) => {
						if (err) {
							console.log(err);
						}
					});
				}
				res.redirect("/admin/editClassMember");
			}
		});
	} else {
		res.redirect("/");
	}
});

/*****************
 **
 *
 * Edit Class Member Delete Router
 *
 *
 ***********************/
router.get("/editClassMember/delete", (req, res) => {
	//It is allowed to all logined people.
	if (req.session.auth) {
		//flag for distinguish where request is from. if it is from /board, this variable'll be true.
		let isBoardAccess = req.query.location;
		connection.query("DELETE FROM tblAttend WHERE name=?", [req.query.target], (error) => {
			if (error) {
				console.log(error);
				isBoardAccess ? res.redirect("/board") : res.redirect("/admin/editClassMember");
			} else {
				isBoardAccess ? res.redirect("/board") : res.redirect("/admin/editClassMember");
			}
		});
	} else {
		res.redirect("/");
	}
});

/*****************
 **
 *
 * Edit Class Member ADD Router
 *
 *
 ***********************/
router.post("/editClassMember/add", (req, res) => {
	if (req.session.auth) {
		//name이라는 이름으로 한 명만 들어오는 경우 -> from admin
		if (req.body.name) {
			connection.query(
				`INSERT INTO tblAttend (name, grade, class)
      VALUES( ? , ? , ? )`,
				[req.body.name, req.body.grade, req.body.class],
				(error) => {
					if (error) {
						console.log(error);
						res.redirect("/admin/editClassMember");
					} else {
						res.redirect("/admin/editClassMember?grade=" + req.body.grade + "&class=" + req.body.class);
					}
				}
			);
		} //if(req.body.name) end
		//여러 명이 들어오는 경우.
		else if (req.body) {
			let sqlQuery = `INSERT INTO tblattend (name, grade, class) VALUES `;
			let userGrade = req.session.grade;
			let userClass = req.session.class;
			let queryArgs = [];

			for (let i = 0; i < req.body.length; i++) {
				queryArgs.push(req.body[i]);
				queryArgs.push(userGrade);
				queryArgs.push(userClass);

				sqlQuery += " ( ?,  ?,  ?) ";
				if (i != req.body.length - 1) {
					sqlQuery += ",";
				}
			}
			sqlQuery += ";";
			connection.query(sqlQuery, queryArgs, (err) => {
				let result = { result: true };
				if (err) {
					console.log(err);
					result.result = false;
				}
				res.json(result);
			});
		} //if(req.body) end
	} //session check end
	else {
		res.redirect("/");
	}
});

////////////////////////////////////Edit User End/////////////////////////////////////////////

//
module.exports = router;
