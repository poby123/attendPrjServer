var express = require('express');
var router = express.Router();

var data = {
  "title": "The Basics - Networking",
  "description": "Your app fetched this from a remote endpoint!",
  "movies": [
    { "id": "1", "title": "Star Wars", "releaseYear": "1977" },
    { "id": "2", "title": "Back to the Future", "releaseYear": "1985" },
    { "id": "3", "title": "The Matrix", "releaseYear": "1999" },
    { "id": "4", "title": "Inception", "releaseYear": "2010" },
    { "id": "5", "title": "Interstellar", "releaseYear": "2014" }
  ]
}
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(data);
});

router.post('/', function(req, res, next){
  console.log(req.body);
  let username = req.body.username;
  let password = req.body.password;
  console.log(username);
  console.log(password);
  res.json(data);
});

module.exports = router;
