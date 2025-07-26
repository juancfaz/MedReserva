# RS
Reservation System

## Overview
This is a simple reservation web application designed as a portfolio project. It allows users to make reservations via a responsive form and lets administrators view, search, edit, and delete reservations through an admin panel.

## Features
- **Responsive reservation form with client-side validation (name and datetime).**

- **Backend server built with Node.js and Express.**

- **Data persistence using SQLite database.**

- **Admin panel to list all reservations in a dynamic table.**

- **Search reservations by name.**

- **Edit reservations through a modal form.**

- **Delete reservations with confirmation.**

- **Real-time table updates after edits or deletions.**

- **Basic UI styled with CSS Flexbox and Grid for responsive layouts.**

## Technologies Used
- **Frontend: HTML5, CSS3 (Flexbox, Grid), JavaScript (DOM manipulation, Fetch API)**

- **Backend: Node.js, Express.js**

- **Database: SQLite3**

- **Tools: npm, SQLite CLI**

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/reservation-system.git
    cd reservation-system
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run the server:
    ```bash
    node server.js
    ```
4. Open your browser and navigate to:
- **User form: http://localhost:3000/**

- **Admin panel: http://localhost:3000/admin.html**

## Project Structure
    ```pgsql
        /public
            ├── index.html          # User reservation form
            ├── admin.html          # Admin panel
            ├── style.css           # Stylesheet
            └── app.js              # Client-side JavaScript for index.html
            server.js                 # Express server and API routes
            db.js                     # SQLite database connection and queries
            package.json              # npm configuration
    ```

## Usage
- **Make a reservation:**
Visit the home page, fill out the form with your full name and reservation datetime, and submit. Validations ensure the name is not empty and the datetime is in the future.

- **Admin panel:**
Navigate to /admin.html to view all reservations. Use the search box to filter by name. Edit a reservation by clicking “Edit,” updating the data in the modal, and saving. Delete a reservation by clicking “Delete” and confirming.

## Credits
Developed by Juan Faz as part of a learning project in web development and backend integration.
