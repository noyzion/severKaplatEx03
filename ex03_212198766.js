const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8574;

app.use(bodyParser.json());

let books = [];
let nextId = 1;

// Define book validation functions and filtering logic

// Define book validation functions
const findBookById = (id) => books.find(book => book.id === id);

const isBookTitleExists = (title) => books.some(book => book.title.toLowerCase() === title.toLowerCase());

const isValidYear = (year) => year >= 1940 && year <= 2100;

const isValidPrice = (price) => price > 0;

const validateGenres = (genres) => {
    const validGenres = ["SCI_FI", "NOVEL", "HISTORY", "MANGA", "ROMANCE", "PROFESSIONAL"];
    return genres.every(genre => validGenres.includes(genre) && validGenres.indexOf(genre) !== -1);
};



// Define book filtering function
const filterBooks = (books, filters, genersSplit) => {
    const { author, 'price-bigger-than':priceBiggerThan, 'price-less-than': priceLessThan, 'year-bigger-than': yearBiggerThan, 'year-less-than': yearLessThan, genres} = filters;
    return books.filter(book =>
        (!author || book.author.toLowerCase() === author.toLowerCase()) &&
        (!priceBiggerThan || book.price >= parseInt(priceBiggerThan)) &&
        (!priceLessThan || book.price <= parseInt(priceLessThan)) &&
        (!yearBiggerThan || book.year >= parseInt(yearBiggerThan)) &&
        (!yearLessThan || book.year <= parseInt(yearLessThan)) &&
        (!genersSplit || genersSplit.some(genre => book.genres.includes(genre.trim())))
    );
};

// Sanity check endpoint
app.get('/books/health', (req, res) => {
    res.send('OK');
});

// Endpoint to create a new Book
app.post('/book', (req, res) => {
    const { title, author, year, price, genres } = req.body;

    if (!title || isBookTitleExists(title)) {
        return res.status(400).json({ errorMessage: !title ? "Error: Book title is required" : `Error: Book with the title [${title}] already exists in the system` });
    }

    if (!author || !year || !isValidYear(year) || !price || !isValidPrice(price) || !genres || !Array.isArray(genres) || !validateGenres(genres)) {
        return res.status(400).json({ errorMessage: "Error: Invalid input data" });
    }

    const newBook = {
        id: nextId++,
        title,
        author,
        year,
        price,
        genres
    };

    books.push(newBook);
    res.status(200).json({ result: newBook.id });
});

//Q3
// Endpoint to get total number of books
app.get('/books/total', (req, res) => {
    const { author, 'price-bigger-than': priceBigger, 'price-less-than': priceLess, 'year-bigger-than': yearBigger, 'year-less-than': yearLess, genres } = req.query;
    let filteredBooks = books; //our arr of books from Q2
  
    //if the user put any genres
    if (genres) {
        const theUserGenresArray = genres.split(',').map(genre => genre.trim()); //split the genres the user put into an arrey
        if(!validateGenres(theUserGenresArray))
        {
            res.status(400).end();
        }
        filteredBooks = filteredBooks.filter(book => book.genres.some(genre => theUserGenresArray.includes(genre))); //Filter the books to only include those that match at least one of the genres provided by the user
    }
    
    if (author) {
    filteredBooks = filteredBooks.filter(book => book.author.toLowerCase() === author.toLowerCase());
    }
    if (priceBigger) {
    filteredBooks = filteredBooks.filter(book => book.price >= parseInt(priceBigger));
    }
    if (priceLess) {
    filteredBooks = filteredBooks.filter(book => book.price <= parseInt(priceLess));
    }
    if (yearBigger) {
    filteredBooks = filteredBooks.filter(book => book.year >= parseInt(yearBigger));
    }
    if (yearLess) {
    filteredBooks = filteredBooks.filter(book => book.year <= parseInt(yearLess));
    }
    
    res.status(200).json({ result: filteredBooks.length });
});

//Q4
app.get('/books', (req, res) => {

    const { author, 'price-bigger-than': priceBigger, 'price-less-than': priceLess, 'year-bigger-than': yearBigger, 'year-less-than': yearLess, genres } = req.query;
    let filteredBooks = books; //our arr of books from Q2
  
    //if the user put any genres
    if (genres) {
        const theUserGenresArray = genres.split(',').map(genre => genre.trim()); //split the genres the user put into an arrey
        if(!validateGenres(theUserGenresArray))
        {
            res.status(400).end();
        }
        filteredBooks = filteredBooks.filter(book => book.genres.some(genre => theUserGenresArray.includes(genre))); //Filter the books to only include those that match at least one of the genres provided by the user
    }
    
    if (author) {
    filteredBooks = filteredBooks.filter(book => book.author.toLowerCase() === author.toLowerCase());
    }
    if (priceBigger) {
    filteredBooks = filteredBooks.filter(book => book.price >= parseInt(priceBigger));
    }
    if (priceLess) {
    filteredBooks = filteredBooks.filter(book => book.price <= parseInt(priceLess));
    }
    if (yearBigger) {
    filteredBooks = filteredBooks.filter(book => book.year >= parseInt(yearBigger));
    }
    if (yearLess) {
    filteredBooks = filteredBooks.filter(book => book.year <= parseInt(yearLess));
    }

    const sortedBooks = filteredBooks.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
    res.status(200).json({ result: sortedBooks });
});


//Q5
// Endpoint to get single-book data
app.get('/book', (req, res) => {
    const { id } = req.query;
    const bookId = parseInt(id);

    const book = findBookById(bookId);
    if (book) {
        res.status(200).json({ result: book });
    } else {
        res.status(404).json({ errorMessage: `Error: no such Book with id ${bookId}` });
    }
});

// Endpoint to update Book's price
app.put('/book', (req, res) => {
    const { id, price } = req.query;
    const bookId = parseInt(id);
    const newPrice = parseInt(price);

    const book = findBookById(bookId);
    if (book) {
        if (newPrice >= 0) {
            const oldPrice = book.price;
            book.price = newPrice;
            res.status(200).json({ result: oldPrice });
        } else {
            res.status(400).json({ errorMessage: `Error: price update for book [${bookId}] must be a positive integer` });
        }
    } else {
        res.status(404).json({ errorMessage: `Error: no such Book with id ${bookId}` });
    }
});

// Endpoint to delete Book
app.delete('/book', (req, res) => {
    const { id } = req.query;
    const bookId = parseInt(id);

    const index = books.findIndex(book => book.id === bookId);
    if (index !== -1) {
        books.splice(index, 1);
        res.status(200).json({ result: books.length });
    } else {
        res.status(404).json({ errorMessage: `Error: no such Book with id ${bookId}` });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
