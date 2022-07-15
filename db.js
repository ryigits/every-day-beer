const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/actors");

db.query("SELECT * FROM actors")
    .then(function (result) {
        console.log(result.rows);
    })
    .catch(function (err) {
        console.log(err);
    });

module.exports.getCitites = () => {
    return;
};
