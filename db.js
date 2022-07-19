const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/ryigit");

module.exports.addMember = (name, lname, password, date, email) => {
    return db.query(
        `
        INSERT INTO members(name,lname,password,date,email)
        VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [name, lname, password, date, email]
    );
};

module.exports.getAllMembers = () => {
    return db.query(`SELECT * FROM members`);
};

module.exports.getMembersByEmail = (email) => {
    return db.query(
        `
        SELECT * FROM members WHERE email=$1`,
        [email]
    );
};

module.exports.getMembersById = (id) => {
    return db.query(
        `
        SELECT * FROM members WHERE id=$1`,
        [id]
    );
};

module.exports.addSignature = (id, url) => {
    return db.query(
        `
        INSERT INTO signatures(id,url)
        VALUES ($1,$2) RETURNING url`,
        [id, url]
    );
};

module.exports.getAllSignatures = () => {
    return db.query(
        `
        SELECT * FROM signatures`
    );
};
