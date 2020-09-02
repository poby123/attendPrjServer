/*

 The Router for editing year planner of each grade's event.
 This Router is allowed to executives and administor.
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
	if (req.session.auth === constData.executivesAuth || req.session.auth === constData.adminAuth) {
		connection.query("SELECT * FROM tblplanner where grade=? ORDER BY no ASC", [req.session.grade], (err, result) => {
			if (err) {
				console.log(err);
				res.render("planner", {
					title: "Planner",
					msg: "Error is occured during get data!",
					result: 0,
					menu: constData.nav[req.session.auth],
				});
			} else {
				console.log("result.length : ", result.length);
				if (result.length === 0) {
					res.render("planner", {
						title: "Planner",
						msg: "",
						result: 0,
						menu: constData.nav[req.session.auth],
					});
				} else {
					res.render("planner", {
						title: "Planner",
						msg: "",
						result: result,
						menu: constData.nav[req.session.auth],
					});
				}
			}
		});
	} else {
		res.redirect("/");
	}
});

router.put("/save", (req, res) => {
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
		updatePlannerQuery = updatePlannerQuery + ` ` + updatePlannerSundayQuery + ` ` + updatePlannerTuesdayQuery + ` ` + updatePlannerDisplayQuery + ` ` + updatePlannerQueryTail;

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
		res.redirect("/");
	}
});

router.get("/make", (req, res) => {
	if (req.session.auth === constData.executivesAuth || req.session.auth === constData.adminAuth) {
		connection.query(`SELECT COUNT(*) FROM tblplanner where grade=?`, [req.session.grade], (err, result) => {
			if (err) {
				console.log(err);
				res.redirect("/board");
			}
			//there is no planner table
			else if (result[0]["COUNT(*)"] === 0) {
				console.log("insert table");
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
						res.render("planner", {
							title: "Planner",
							msg: "Error is occured during make planner table",
							menu: constData.nav[req.session.auth],
						});
					} else {
						res.redirect("/planner");
					}
				});
			} else {
				console.log("already exist");
				res.redirect("/planner");
			}
		});
	}
});

module.exports = router;
