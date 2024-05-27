CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(10) CHECK (role IN ('user', 'seller')) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE user_token (
    id SERIAL PRIMARY KEY,
    token VARCHAR NOT NULL,
    fk_user INT NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY(fk_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    price NUMERIC NOT NULL,
    fk_seller INT NOT NULL,
    published_at TIMESTAMP,
    CONSTRAINT fk_seller FOREIGN KEY(fk_seller) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
