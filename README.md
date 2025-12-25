
# AI Dataset Annotation Tool - Assignment 2

## Overview
A full-stack web application for uploading images, managing labels, assigning labels to images, viewing annotated images, and deleting images. Built with Express.js backend and responsive Bootstrap frontend.

## Features Implemented
- Responsive UI with Bootstrap 5 and custom styling
- Image upload with initial label assignment
- Label management (create new labels)
- View all images 
- Delete image functionality (removes from database and filesystem)
- All associated labels removed on image deletion
- Mocha unit tests for key API routes
- TDD workflow demonstrated in commit history


## Project Structure
SoftwareDesign_AS2/
├── public/                  # Frontend: HTML, CSS, JS files
├── src/
│   ├── api/                 # API routes (image.ts, label.ts, annotation.ts)
│   ├── tests/               # Mocha test files
│   ├── db.ts                # Database connection
│   ├── server.ts            # Express server
│   ├── prepare.ts           # Prepared statements
│   └── init-db.ts           # Database schema initialization
├── uploads/                 # Uploaded image files
├── db.sqlite3               # SQLite database
├── package.json
└── README.md


## Setup and Running the Application

1. Clone the repository:
   ```bash
   git clone https://github.com/steve-nip/software-ass2.git
   cd software-ass2

2. Install dependencies:
   npm install

3. Initialize the database (creates tables):
   npx ts-node src/init-db.ts

4. Start the server:
   npx ts-node src/server.ts

5. Open in browser:
   http://localhost:8100

6. Running tests:
   npm test

