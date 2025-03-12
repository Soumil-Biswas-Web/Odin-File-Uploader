-- Create new Database
CREATE DATABASE all_table_1;

-- Connect to database
\c all_table_1 

-- check table
\d

-- Create new Table
CREATE TABLE users (
    username VARCHAR (255),
    first_name VARCHAR (255),
    last_name VARCHAR (255),
    password VARCHAR (255),
    isMember BOOLEAN,
    isAdmin BOOLEAN,
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY
);

-- View items in table
SELECT * FROM users;

-- Drop/ Delete table.
DROP TABLE users;

CREATE TABLE messages (
    message_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username VARCHAR (255),
    message TEXT,
    timestamp VARCHAR (255)
);

SELECT * FROM TABLE messages;