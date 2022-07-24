DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    first_name    TEXT NOT NULL CHECK (first_name <> ''),
    last_name     TEXT NOT NULL CHECK (last_name <> ''),
    email         TEXT NOT NULL UNIQUE CHECK (email <> ''),
    password_hash TEXT NOT NULL CHECK (password_hash <> ''),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE signatures (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL UNIQUE REFERENCES users (id)ON DELETE CASCADE,
    signature TEXT    NOT NULL CHECK (signature != ''),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    id  SERIAL PRIMARY KEY,
    city TEXT DEFAULT NULL,
    age INT DEFAULT NULL,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id)ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);