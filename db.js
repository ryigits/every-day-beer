const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/ryigit");

module.exports.addPetition = (fname, lname, url,timestamp) => {
    return db.query(
        `
        INSERT INTO signatures(first,last,signature,date)
        VALUES ($1,$2,$3,$4)`,
        [fname, lname, url,timestamp]
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
