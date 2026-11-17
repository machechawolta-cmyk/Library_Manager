CREATE DATABASE IF NOT EXISTS library;
USE library;

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  author VARCHAR(100) NOT NULL,
  genre VARCHAR(50),
  isbn VARCHAR(20) NOT NULL UNIQUE,
  quantity INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  membership_id VARCHAR(30) NOT NULL UNIQUE,
  role ENUM('admin','member') NOT NULL DEFAULT 'member',
  password VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NULL,
  type ENUM('ADD','BORROW') NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (name, membership_id, role, password) VALUES
  ('Admin', 'ADMIN001', 'admin', '$2b$10$mzXXTpYRd0.uhlI1YMvUe.bgDFrfGVD095BDrHmgaVmN.weEGHSKS'),
  ('Test Member', 'MEM001', 'member', '$2b$10$eRGbCl91yMi7aT.bkk0MRO/nZmH95BQgfCEK7W3X/KeTi5Ap9Zc8G')
ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role);
INSERT IGNORE INTO books (title, author, genre, isbn, quantity) VALUES
  ('Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5),
  ('Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 1),
  ('Atomic Habits', 'James Clear', 'Self-help', '9780735211292', 3);
