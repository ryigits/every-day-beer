const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/ryigit");

module.exports.addPetition = (fname, lname, url, timestamp,email,password) => {
    return db.query(
        `
        INSERT INTO signatures(first,last,signature,date,email,password)
        VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [fname, lname, url, timestamp,email,password]
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

module.exports.getSignaturesById = (id) => {
    return db.query(
        `
        SELECT * FROM signatures WHERE id=$1`,
        [id]
    );
};

module.exports.getSignaturesByEmail = (email) => {
    return db.query(
        `
        SELECT * FROM signatures WHERE email=$1`,
        [email]
    );
};
