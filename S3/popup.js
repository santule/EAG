// Meditations quotes
const quotes = [
  {
    text: "Accept the things to which fate binds you, and love the people with whom fate brings you together, but do so with all your heart.",
    book: "Book IV"
  },
  {
    text: "The best revenge is to be unlike him who performed the injury.",
    book: "Book VI"
  },
  {
    text: "Waste no more time arguing about what a good man should be. Be one.",
    book: "Book X"
  },
  {
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    book: "Book VII"
  },
  {
    text: "When you arise in the morning, think of what a precious privilege it is to be alive - to breathe, to think, to enjoy, to love.",
    book: "Book II"
  }
];

// Get DOM elements
const quoteElement = document.getElementById('quote');
const referenceElement = document.getElementById('book-reference');
const newQuoteButton = document.getElementById('new-quote');

// Function to display a random quote
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  quoteElement.textContent = quote.text;
  referenceElement.textContent = quote.book;
}

// Event listeners
document.addEventListener('DOMContentLoaded', displayRandomQuote);
newQuoteButton.addEventListener('click', displayRandomQuote);
