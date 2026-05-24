-- QueryMind AI Test SQL File
-- This file contains schema + intentionally slow SQL query

CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT NOT NULL,
  product_id INT NOT NULL,
  status VARCHAR(50),
  total DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id)
);

CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  country VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2),
  category_id INT,
  supplier_id INT,
  stock INT DEFAULT 0
);

CREATE TABLE categories (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE suppliers (
  id INT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  country VARCHAR(50)
);

-- Bad query for testing optimizer
SELECT *
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id
JOIN categories cat ON p.category_id = cat.id
JOIN suppliers s ON p.supplier_id = s.id
WHERE o.status LIKE '%pending%'
  AND c.email LIKE '%@gmail.com'
  AND p.price > 500
GROUP BY c.id
ORDER BY o.created_at;