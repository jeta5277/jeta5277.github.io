const API_ENDPOINT = 'https://trivia.cyberwisp.com/getrandomchristmasquestion';
const newQuoteBtn = document.querySelector('#js-new-quote');

newQuoteBtn.addEventListener('click', getQuote);

function getQuote() {
    
    fetch(API_ENDPOINT)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            displayQuote(data);
        })
        .catch(function(error) {
            console.error(error);
            alert('Something went wrong!');
        });
}

function displayQuote(data) {
    document.getElementById('js-quote-text').textContent = data.question;
}

getQuote();

