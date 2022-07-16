const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/ryigit");

module.exports.addPetition = (fname, lname, url) => {
    return db.query(
        `
        INSERT INTO signatures(first,last,signature)
        VALUES ($1,$2,$3)`,
        [fname, lname, url]
    );
};

module.exports.getSignature = (fname, lname) => {
    return db.query(
        `
        SELECT * FROM signatures WHERE first=$1 AND last=$2`,
        [fname, lname]
    );
};

module.exports.getAllSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};
