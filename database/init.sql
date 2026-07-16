-- Book Library Database Initialization Script
-- Creates the 'books' table if it does not already exist.

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed some starter data so the app isn't empty on first launch
INSERT INTO books (title, author, is_read) VALUES
    ('The Pragmatic Programmer', 'David Thomas & Andrew Hunt', false),
    ('Clean Code', 'Robert C. Martin', true),
    ('Designing Data-Intensive Applications', 'Martin Kleppmann', false)
ON CONFLICT DO NOTHING;
