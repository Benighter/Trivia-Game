var score = 0;
var currentQuestionIndex = 0;
var questions = [];
var gameStarted = false;

function startGame() {
    score = 0;
    currentQuestionIndex = 0;
    questions = [];
    document.getElementById('score').textContent = score;

    var category = document.getElementById('category').value;
    var difficulty = document.getElementById('difficulty').value;

    // Remove category and difficulty selectors from the screen
    document.getElementById('category-container').style.display = 'none';
    document.getElementById('difficulty-container').style.display = 'none';

    // Build the API request URL
    var apiUrl = 'https://opentdb.com/api.php?amount=10';

    if (category !== '0') {
        apiUrl += `&category=${category}`;
    }

    if (difficulty !== '') {
        apiUrl += `&difficulty=${difficulty}`;
    }

    // Make the API request
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.response_code === 0) {
                questions = data.results;
                displayQuestion(questions[currentQuestionIndex]);
                gameStarted = true;
                document.getElementById('start-button').style.display = 'none';
                document.getElementById('resign-button').style.display = 'block';
            } else {
                console.error('Error fetching questions:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
        });
}

function resignGame() {
    if (gameStarted) {
        gameStarted = false;
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('score-container').style.display = 'block'; // Show the score container
        document.getElementById('score').textContent = score;
        document.getElementById('category-container').style.display = 'block'; // Show the category selector
        document.getElementById('difficulty-container').style.display = 'block'; // Show the difficulty selector
        document.getElementById('resign-button').style.display = 'none';
        document.getElementById('start-button').style.display = 'block';
        showAnswers();
    }
}

function displayQuestion(question) {
    var container = document.getElementById('question-container');
    container.innerHTML = ''; // Clear previous question

    var questionElem = document.createElement('div');
    questionElem.classList.add('question');
    questionElem.innerHTML = `
        <h3>Question:</h3>
        <p>${question.question}</p>
        <p>Category: ${question.category}</p>
        <p>Difficulty: ${question.difficulty}</p>
        <p>Options:</p>
        ${getOptionsHtml(question, currentQuestionIndex)}
        <button onclick="submitAnswer('${question.correct_answer}')">Submit</button>
    `;

    container.appendChild(questionElem);
    container.style.display = 'block'; // Show the question

    if (currentQuestionIndex === 0) {
        document.getElementById('score-container').style.display = 'none'; // Hide the score
    }
}

function getOptionsHtml(question, questionIndex) {
    var optionsHtml = '';
    var options = question.incorrect_answers.slice();
    options.push(question.correct_answer);
    options = shuffleArray(options);

    for (var i = 0; i < options.length; i++) {
        optionsHtml += `
            <input type="radio" name="option${questionIndex}" value="${options[i]}">
            <label>${options[i]}</label><br>
        `;
    }

    return optionsHtml;
}

function shuffleArray(array) {
    var currentIndex = array.length;
    var temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function submitAnswer(correctAnswer) {
    if (!gameStarted) {
        return;
    }

    var selectedAnswer = document.querySelector(`input[name="option${currentQuestionIndex}"]:checked`);

    if (selectedAnswer) {
        if (selectedAnswer.value === correctAnswer) {
            score++;
            selectedAnswer.nextElementSibling.classList.add('correct-answer');
        } else {
            selectedAnswer.nextElementSibling.classList.add('wrong-answer');
            var correctOption = document.querySelector(`input[value="${correctAnswer}"]`);
            correctOption.nextElementSibling.classList.add('correct-answer');
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            displayQuestion(questions[currentQuestionIndex]);
        } else {
            endGame();
        }

        document.getElementById('score').textContent = score;
    }
}

function endGame() {
    gameStarted = false;
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('score-container').style.display = 'block'; // Show the score container
    document.getElementById('score').textContent = score;
    document.getElementById('category-container').style.display = 'block'; // Show the category selector
    document.getElementById('difficulty-container').style.display = 'block'; // Show the difficulty selector
    document.getElementById('resign-button').style.display = 'none';
    document.getElementById('start-button').style.display = 'block';
    showAnswers();
}

function showAnswers() {
    var answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';
    var answersLabel = document.getElementById('answers-label');
    var correctAnswersCount = 0;

    for (var i = 0; i < questions.length; i++) {
        var question = questions[i];
        var correctAnswer = question.correct_answer;
        var selectedAnswer = document.querySelector(`input[name="option${i}"]:checked`);

        var questionElem = document.createElement('div');
        questionElem.classList.add('question');
        questionElem.innerHTML = `
            <h3>Question:</h3>
            <p>${question.question}</p>
            <p>Category: ${question.category}</p>
            <p>Difficulty: ${question.difficulty}</p>
            <p>Options:</p>
            ${getOptionsHtml(question, i)}
        `;

        if (selectedAnswer) {
            var selectedAnswerValue = selectedAnswer.value;
            var optionElements = questionElem.querySelectorAll('input');

            for (var j = 0; j < optionElements.length; j++) {
                var option = optionElements[j];

                if (option.value === selectedAnswerValue) {
                    option.nextElementSibling.classList.add('wrong-answer');
                }

                if (option.value === correctAnswer) {
                    option.nextElementSibling.classList.add('correct-answer');
                }
            }

            if (selectedAnswerValue === correctAnswer) {
                correctAnswersCount++;
            }
        } else {
            var optionElements = questionElem.querySelectorAll('input');

            for (var j = 0; j < optionElements.length; j++) {
                var option = optionElements[j];

                if (option.value === correctAnswer) {
                    option.nextElementSibling.classList.add('correct-answer');
                }
            }
        }

        answersContainer.appendChild(questionElem);
    }

    if (correctAnswersCount === questions.length) {
        answersLabel.textContent = 'Congratulations! You answered all questions correctly.';
    } else {
        answersLabel.textContent = 'Answers:';
    }

    answersLabel.style.display = 'block';
}
