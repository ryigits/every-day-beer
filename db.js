const spicedPg = require("spiced-pg");
const db = spicedPg(dbUrl);
var dbUrl =
    process.env.DATABASE_URL ||
    "postgres:postgres:postgres@localhost:5432/ryigit";
const bcrypt = require("./bcrypt");

module.exports.addUser = (first_name, last_name, email, password) => {
    return db
        .query(
            `
        INSERT INTO users(first_name,last_name,email,password_hash)
        VALUES ($1,$2,$3,$4)  RETURNING id,first_name`,
            [first_name, last_name, email, password]
        )
        .then((returning) => {
            let id = returning.rows[0].id;
            return db.query(
                `INSERT INTO profiles(city,age,user_id) VALUES (DEFAULT,DEFAULT,$1)`,
                [id]
            );
        });
};

module.exports.getAllUsers = () => {
    return db.query(`SELECT users.first_name,users.last_name,profiles.city,profiles.age
FROM users LEFT OUTER JOIN profiles ON users.id=profiles.user_id;`);
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
        VALUES ($1,$2) RETURNING signature`,
        [id, url]
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

// module.exports.createProfile = (id, city, age) => {
//     return db.query(
//         `
//         INSERT INTO profiles(city,age,user_id) VALUES($2,$3,$1)`,
//         [id, city, age]
//     );
// };

module.exports.getProfile = (id) => {
    return db.query(
        `
        SELECT profiles.user_id, profiles.city,profiles.age ,users.first_name,users.last_name,password_hash,signatures.signature FROM users LEFT OUTER JOIN signatures ON users.id=signatures.user_id LEFT OUTER JOIN profiles ON profiles.user_id=users.id WHERE users.id=$1;`,
        [id]
    );
};

module.exports.updateProfile = (user_id, first_name, last_name, age, city) => {
    let capitalizeCity =
        city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    return db
        .query(
            `
        INSERT INTO profiles(city,age,user_id) values($2,$3,$1) ON CONFLICT(user_id) DO UPDATE SET city=$2,age=$3;`,
            [user_id, capitalizeCity, age]
        )
        .then(() => {
            db.query(
                `
        UPDATE users SET first_name=$2,last_name=$3 WHERE id=$1`,
                [user_id, first_name, last_name]
            );
        });
};

module.exports.deleteSignature = (id) => {
    return db.query(
        `
        DELETE FROM signatures WHERE user_id=$1`,
        [id]
    );
};

module.exports.deleteUser = (id) => {
    return db.query(
        `
        DELETE FROM users WHERE id=$1`,
        [id]
    );
};
