const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/ryigit");

module.exports.addMember = (first_name, last_name, email, password) => {
    return db.query(
        `
        INSERT INTO users(first_name,last_name,email,password_hash)
        VALUES ($1,$2,$3,$4) RETURNING id`,
        [first_name, last_name, email, password]
    );
};

module.exports.getAllMembers = () => {
    return db.query(`SELECT * FROM users`);
};

module.exports.getMembersByEmail = (email) => {
    return db.query(
        `
        SELECT * FROM users WHERE email=$1`,
        [email]
    );
};

module.exports.getMembersById = (id) => {
    return db.query(
        `
        SELECT * FROM users WHERE id=$1`,
        [id]
    );
};

module.exports.addSignature = (user_id, url) => {
    return db.query(
        `
        INSERT INTO signatures(user_id,signature)
        VALUES ($1,$2) RETURNING signature`,
        [user_id, url]
    );
};

module.exports.getAllSignatures = () => {
    return db.query(
        `
        SELECT * FROM signatures`
    );
};

module.exports.getSignature = (id) => {
    return db.query(
        `
        SELECT * FROM signatures WHERE user_id=$1`,
        [id]
    );
};
