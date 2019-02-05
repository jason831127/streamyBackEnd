CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;
CREATE USER IF NOT EXISTS db_user@localhost IDENTIFIED BY 'db_user';
GRANT ALL PRIVILEGES ON mydb.* TO 'db_user'@'localhost';
