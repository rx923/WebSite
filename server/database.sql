CREATE DATABASE MAINDATABASE;

CREATE TABLE(USER_CREDENTIALS);

INSERT INTO USER_CREDENTIALS(
    name(varchar(50));
    age(INT(10));
    email(VARCHAR(255) PRIMARY KEY);
    created_at TIMESTAMP DEFAULT NOW();
);