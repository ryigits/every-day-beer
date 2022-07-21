const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/ryigit");
const bcrypt = require("./bcrypt");

module.exports.addUser = (first_name, last_name, email, password) => {
    return db.query(
        `
        INSERT INTO users(first_name,last_name,email,password_hash)
        VALUES ($1,$2,$3,$4)  RETURNING id,first_name`,
        [first_name, last_name, email, password]
    );
};

module.exports.getAllUsers = () => {
    return db.query(`SELECT * FROM users`);
};

module.exports.getUserByEmail = (email) => {
    return db
        .query(
            `
        SELECT * FROM users WHERE email=$1`,
            [email]
        )
        .then((result) => {
            return result.rows[0];
        });
};

module.exports.getSignatureById = (id) => {
    return db.query(
        `
        SELECT * FROM signatures WHERE user_id=$1`,
        [id]
    );
};

module.exports.addSignature = (id, url) => {
    return db.query(
        `
        INSERT INTO signatures(user_id,signature)
        VALUES ($1,$2)`,
        [id, url]
    );
};

module.exports.getAllSignatures = () => {
    return db.query(
        `
        SELECT * FROM signatures`
    );
};

module.exports.authUser = (email, password) => {
    return db
        .query(
            `
        SELECT * FROM users WHERE email=$1`,
            [email]
        )
        .then((user) => {
            return bcrypt.compare(password, user.rows[0].password_hash);
        })
        .catch(() => false);
};

module.exports.createProfile = (id, city, age) => {
    return db.query(
        `
        INSERT INTO profiles(city,age,user_id) VALUES($2,$3,$1)`,
        [id, city, age]
    );
};

module.exports.getProfile = (user_id) => {
    return db.query(
        `
        SELECT * FROM profiles where user_id=$1`,
        [user_id]
    );
};

module.exports.updateProfile = (user_id, city, age) => {
    return db.query(
        `
        UPDATE profiles SET city=$2,age=$3 WHERE user_id=$1`,
        [user_id, city, age]
    );
};
