CREATE DATABASE IF NOT EXISTS library_management_db;

USE library_management_db;

CREATE TABLE Students (
                          student_id VARCHAR(255) PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          email VARCHAR(255) NOT NULL UNIQUE,
                          phone VARCHAR(255),
                          total_fines_due FLOAT NOT NULL DEFAULT 0.0
);

CREATE TABLE Books (
                       book_id CHAR(36) PRIMARY KEY,
                       title VARCHAR(255) NOT NULL,
                       author VARCHAR(255) NOT NULL,
                       isbn VARCHAR(255) NOT NULL UNIQUE,
                       total_copies INT NOT NULL DEFAULT 1,
                       available_copies INT NOT NULL DEFAULT 1
);

CREATE TABLE IssueTransactions (
                                   id INT AUTO_INCREMENT PRIMARY KEY,
                                   student_id VARCHAR(255) NOT NULL,
                                   book_id CHAR(36) NOT NULL,
                                   issue_date DATETIME NOT NULL,
                                   due_date DATETIME NOT NULL,
                                   return_date DATETIME,
                                   fine_amount FLOAT NOT NULL DEFAULT 0.0,
                                   is_returned BOOLEAN NOT NULL DEFAULT FALSE,
                                   FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE RESTRICT,
                                   FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE RESTRICT
);