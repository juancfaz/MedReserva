# Reservation System

## Overview
This is a full-stack reservation web application designed as a portfolio project. It allows users to register as patients or doctors, authenticate via login with JWT, make and manage medical appointment reservations, and enables admins, doctors, and patients to view their respective reservations through role-based dashboards.

## Features
- **User registration with role selection:** patients and doctors register with additional fields (birthdate, gender, specialty).**

- **User login with JWT authentication and token-based session management.**

- **Role-based access control:**  
  - Patients can make reservations.  
  - Doctors and admins can view relevant reservations.  
  - Admins have full access including editing and deleting reservations.

- **Reservation system:** patients book appointments selecting doctors, date/time, and reason.

- **Dynamic dashboards:**  
  - Admins see all reservations with patient and doctor info.  
  - Doctors see their patients’ reservations.  
  - Patients see their own reservations.

- **Responsive UI with modals for login and signup, form validation, and feedback messages.**

- **Backend with Node.js, Express, and SQLite for persistent data storage.**

## Technologies Used
- **Frontend:** HTML5, CSS3 (Flexbox, Grid), JavaScript (DOM manipulation, Fetch API)  
- **Backend:** Node.js, Express.js  
- **Database:** SQLite3  
- **Authentication:** JWT (JSON Web Tokens)  
- **Tools:** npm, SQLite CLI

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
    - **User interface:** http://localhost:3000/  
    - **Dashboard (for logged-in users):** http://localhost:3000/dashboard.html

## Project Structure

    /public
        ├── index.html          # User reservation form
        ├── dashboard.html          # User dashboard showing reservations per role
        ├── style.css           # Stylesheet
        └── app.js              # Client-side JavaScript for index.html
        server.js                 # Express server and API routes
        db.js                     # SQLite database connection and queries
        package.json              # npm configuration

## Usage
- **Registration:** Users register by selecting a role (patient or doctor), providing required details, and submitting the signup form.

- **Login:** Users log in with their email and password. A JWT token is stored in localStorage for session management.

- **Making reservations:** Only authenticated patients can make a reservation by selecting a doctor, date/time, and providing a reason.

- **Viewing reservations:**  
  - Patients see their own reservations on the dashboard.  
  - Doctors see reservations with their patients.  
  - Admins see all reservations with full details.

- **Logout:** Clears the token and resets UI state.

## Notes
- Passwords are stored in plaintext in this demo project—consider adding hashing for production use.
- JWT secret is hardcoded for simplicity; store secrets securely in environment variables for deployment.
- Basic validation and error handling are implemented on both frontend and backend.

## Credits
Developed by Juan Faz as a learning project in full-stack web development, combining frontend, backend, database, and authentication.
