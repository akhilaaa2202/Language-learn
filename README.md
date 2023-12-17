# Language Quiz Project

Welcome to the Language Quiz project! This application is designed to test your language skills through a series of interactive quizzes. The project is built with a decoupled architecture, utilizing Flask as the backend to host RESTful APIs and HTML, CSS, and JavaScript for the frontend.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Backend (Flask)](#backend-flask)
5. [Frontend (HTML, CSS, JS)](#frontend-html-css-js)
6. [API Endpoints](#api-endpoints)
7. [Authentication](#authentication)
8. [Contributing](#contributing)
9. [License](#license)

## Project Overview

The Language Quiz project is designed to provide users with an engaging quiz experience to test their language proficiency. The project is divided into two main components: the backend, built with Flask, and the frontend, developed using HTML, CSS, and JavaScript.

## Installation

To run the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/language-quiz-project.git
   cd language-quiz-project
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. Start the Flask backend server:
   ```bash
   python -m flask --app app.py run
   ```

2. Open the `index.html` file in your web browser to access the Language Quiz application. You can use the Live Server extension in VS Code to run the frontend.

   If you don't have the Live Server extension installed, you can install it from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

   Right-click on `index.html` in the VS Code editor and select "Open with Live Server" to launch the frontend.

## Backend (Flask)

The Flask backend serves as the core of the Language Quiz project, providing RESTful API endpoints to handle quiz data and user interactions. The backend is responsible for processing quiz submissions, retrieving quiz questions, and maintaining user scores.

## Frontend (HTML, CSS, JS)

The frontend of the Language Quiz project is built with HTML, CSS, and JavaScript. The interactive user interface allows users to answer quiz questions and receive immediate feedback. JavaScript is responsible for making asynchronous requests to the Flask backend to fetch quiz data and submit user responses.

## API Endpoints

- `POST /quiz`: Retrieve a random quiz question. (Requires JWT)
- `POST /login`: User login.
- `POST /register`: User registration.
- `GET /languages`: Retrieve available languages.
- `GET /leaderboard`: Retrieve the leaderboard.
- `POST /score`: Submit a user's score. (Requires JWT)

For detailed API documentation, refer to the [API Documentation](docs/api.md).

## Authentication

Certain endpoints (e.g., `/quiz`, `/score`) require authentication using JSON Web Tokens (JWT). Include the JWT token in the request headers for these endpoints.

## Contributing

If you would like to contribute to the project, please follow the [Contributing Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as per the terms of the license.

---

Thank you for using the Language Quiz project! If you have any questions or feedback, please don't hesitate to reach out to us. Happy quizzing!
