// src/init-db.ts
import { db } from './db';

console.log('Initializing database - creating tables...');

db.exec(`
  DROP TABLE IF EXISTS image_label;
  DROP TABLE IF EXISTS image;
  DROP TABLE IF EXISTS label;

  CREATE TABLE image (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    file_size INTEGER,
    mime_type TEXT,
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE label (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE image_label (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER NOT NULL,
    label_id INTEGER NOT NULL,
    annotation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES image(id) ON DELETE CASCADE,
    FOREIGN KEY (label_id) REFERENCES label(id) ON DELETE CASCADE,
    UNIQUE(image_id, label_id)
  );
`);

console.log('Database initialized successfully!');
console.log('All tables created. You can now start the server.');