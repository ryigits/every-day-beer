const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/ryigit");

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

