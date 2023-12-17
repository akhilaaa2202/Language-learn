function showLogin() {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');

    // Show login container and hide register container
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
   // e.preventDefault()
}

function showRegister() {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');

    // Show register container and hide login container
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
   // e.preventDefault()
}
let quizQuestions=[]



document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is already logged in
    if (isLoggedIn()) {
        // If logged in, show logout button and hide login and register buttons
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('language-container').style.display = 'block';
        quizQuestions=[]
        
    }

    // Fetch and populate the language dropdown menu
    fetchLanguages();
    quizQuestions=[]
    // Retrieve the selected language from local storage
    const selectedLanguage = localStorage.getItem('selectedLanguage');

    // Set the selected language in the dropdown
    if (selectedLanguage) {
        document.getElementById('language-select').value = selectedLanguage;
    }

    // Fetch quiz data after login
    if (isLoggedIn()) {
        fetchQuizForSelectedLanguage();
    }
});

function fetchLanguages() {
    fetch('http://127.0.0.1:5000/languages')
    .then(response => response.json())
    .then(data => {
        console.log('Languages response:', data);

        // Populate the language dropdown menu
        populateLanguageDropdown(data.languages);

        // Fetch quiz for the selected language
        fetchQuizForSelectedLanguage();
    })
    .catch(error => console.error('Error fetching languages:', error));
   // e.preventDefault()
}

function populateLanguageDropdown(languages) {
    const languageSelect = document.getElementById('language-select');

    // Add an option for each language
    languageSelect.innerHTML='';
    languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        languageSelect.appendChild(option);
    });

    // Retrieve the selected language from local storage
    const selectedLanguage = localStorage.getItem('selectedLanguage');

    // Set the selected language in the dropdown
    if (selectedLanguage) {
        languageSelect.value = selectedLanguage;
    }

    // Add event listener to save the selected language on change
    languageSelect.addEventListener('change', () => {
        const selectedLanguage = languageSelect.value;

        // Save the selected language to local storage
        localStorage.setItem('selectedLanguage', selectedLanguage);

        // Fetch quiz for the selected language
        fetchQuizForSelectedLanguage();
        quizQuestions=[]
    });
   // e.preventDefault()
}

function fetchQuizForSelectedLanguage() {
    const selectedLanguage = localStorage.getItem('selectedLanguage');

    // Fetch quiz data using the access token and selected language
    const accessToken = localStorage.getItem('accessToken');
    quizQuestions=[]
    // Replace 'http://127.0.0.1:5000/quiz' with your actual quiz endpoint
    fetch('http://127.0.0.1:5000/quiz', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: selectedLanguage }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Quiz data:', data);

        // Display all questions
        displayAllQuestions(data.questions);
        quizQuestions=data.questions;
    })
    .catch(error => console.error('Error fetching quiz data:', error));
//    e.preventDefault()
}

function displayAllQuestions(questions) {
    const questionsContainer = document.getElementById('questions-container');

    // Clear existing content
    questionsContainer.innerHTML = '';

    // Loop through all questions
    questions.forEach(question => {
        // Check if the question object is defined and has the expected properties
        if (question && 'question_text' in question && 'options' in question) {
            // Create a container for the current question
            const questionContainer = document.createElement('div');
            questionContainer.classList.add('question-container');

            // Display the question
            const questionElement = document.createElement('div');
            questionElement.textContent = question.question_text;
            questionContainer.appendChild(questionElement);

            // Check if options is an array
            if (Array.isArray(question.options)) {
                // Display options
                question.options.forEach((option, index) => {
                    const optionElement = document.createElement('div');
                    optionElement.innerHTML = `<input type="radio" name="question-${question.id}" value="${option.id}" class="question-option" required>${option.option_text}`;
                    questionContainer.appendChild(optionElement);
                });
            } else {
                console.error('Options is not an array:', question.options);
                questionContainer.textContent = 'Error: Options is not an array';
            }

            // Append the question container to the main questions container
            questionsContainer.appendChild(questionContainer);
        } else {
            console.error('Invalid question structure:', question);
            questionsContainer.textContent = 'Error: Invalid question structure';
        }
    });
  //  e.preventDefault()
}


// Your existing code ...

// Now, you can call displayAllQuestions with your questions array
// e.g., displayAllQuestions(quizQuestions);

// ... (your existing code)
function submitQuiz(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    const questions = quizQuestions;
    const selectedOptions = [];

    // Check if all questions have a selected option
    let isValid = true; // Flag to track validation status

    questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="question-${question.id}"]:checked`);
        if (selectedOption) {
            selectedOptions.push({
                questionId: question.id,
                selectedOptionId: parseInt(selectedOption.value),
            });
        } else {
            // If any question is not answered, set isValid to false
            isValid = false;
        }
    });

    if (!isValid) {
        // If any question is not answered, show an alert and stop the submission
        alert('Please answer all questions before submitting.');
        return false;
    }

    // Rest of your code remains unchanged
    // ...

    // Calculate score
    let score = 0;
    selectedOptions.forEach(selectedOption => {
        const question = questions.find(q => q.id === selectedOption.questionId);

        if (question && 'options' in question) {
            const correctOption = question.options.find(option => option.is_correct);

            if (correctOption && correctOption.id === selectedOption.selectedOptionId) {
                score++;
            }
        }
    });

    console.log('Score:', score);

    // Submit the score to the endpoint
    submitScore(score);
    displayResult(score);

    return false; // Add this line to prevent default form submission
}

function submitScore(score) {
    // Fetch the access token from local storage
    const accessToken = localStorage.getItem('accessToken');
    console.log(score);

    // Check if the access token is available
    if (accessToken) {
        // Replace 'http://127.0.0.1:5000/score' with your actual score submission endpoint
        const scoreSubmissionEndpoint = 'http://127.0.0.1:5000/score';

        // Create the request body
        const requestBody = {
            "score": String(score),
        };

        // Make the POST request to submit the score
        fetch(scoreSubmissionEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response, you can log or display a message
            console.log('Score submitted successfully:', data);
        })
        .catch(error => {
            // Handle errors, log or display an error message
            console.error('Error submitting score:', error);
        });
    } else {
        // Access token is not available, handle accordingly
        console.error('Access token is not available. Unable to submit score.');
    }

    return false; // Add this line to prevent default form submission
}

function displayResult(score) {
    // Hide the quiz form
    document.getElementById('quiz-form').style.display = 'none';

    // Show the result container
    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'block';

    // Display the score
    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.textContent = `Your Score: ${score}`;

    return false; // Add this line to prevent default form submission
}

// Add event listener to the form
document.getElementById('quiz-form').addEventListener('submit', submitQuiz);




// Function to handle login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulate API request (replace with actual fetch)
    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Login response:', data);

        // Check if the response contains a token
        if (data.token) {
            // Save the token to local storage
            saveAccessToken(data.token);

            // Hide login and register buttons, show logout button and language dropdown
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('register-btn').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'block';
            document.getElementById('language-container').style.display = 'block';

            // Hide login and register containers
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('register-container').style.display = 'none';

            // Fetch quiz data after login
            fetchQuizForSelectedLanguage();
        } else {
            console.error('Login failed. No token in the response.');
        }
    })
    .catch(error => console.error('Error during login:', error));
   // e.preventDefault()
}

// Function to handle registration
function register() {
    const regUsername = document.getElementById('reg-username').value;
    const regPassword = document.getElementById('reg-password').value;

    // API endpoint and request body for registration
    const registerEndpoint = 'http://127.0.0.1:5000/register';
    const requestBody = {
        username: regUsername,
        password: regPassword,
    };

    // Simulate API request (replace with actual fetch)
    fetch(registerEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Registration response:', data);

        // Check if the registration was successful
        if (data.message === 'User registered successfully') {
            // Display a success message (you can customize this part)
            alert('User registered successfully');

            // After successful registration, you might want to automatically log in the user
            // You can call the login function here with regUsername and regPassword

            // For demonstration purposes, we'll show a message
            console.log('You can now log in with your registered credentials.');
        } else {
            // Display an error message (you can customize this part)
            alert('Registration failed. Please try again.');
        }
    })
    .catch(error => console.error('Error during registration:', error));
   // e.preventDefault()
}

// Function to handle logout
function logout() {
    // Clear the access token from local storage
    clearAccessToken();

    // Show login and register buttons, hide logout button and language dropdown
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('register-btn').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('language-container').style.display = 'none';

    // Show login container, hide register container
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('register-container').style.display = 'none';
   // e.preventDefault()
}

// Function to save access token to local storage
function saveAccessToken(token) {
    // Save the token to local storage
    localStorage.setItem('accessToken', token);
    console.log('Access token saved to local storage');
   // e.preventDefault()
}

// Function to clear access token from local storage
function clearAccessToken() {
    // Clear the access token from local storage
    localStorage.removeItem('accessToken');
    console.log('Access token removed from local storage');
    //e.preventDefault()
}

// Function to check if user is logged in
function isLoggedIn() {
    // Check if the access token is present in local storage
    return !!localStorage.getItem('accessToken');

}
