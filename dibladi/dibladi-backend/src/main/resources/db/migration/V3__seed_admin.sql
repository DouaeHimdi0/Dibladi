-- V3: Seed default admin user for DiblaDi backend

INSERT INTO users (email, password, role, first_name, last_name)
VALUES
    ('support@dblady.com', '$2a$10$5Gq1Tt7EzVO2A4zB9svxF.gqtMwB6tyzJ7oKZfT6q.R9aLsr1SR9a', 'ADMIN', 'Support', 'DiblaDi');
