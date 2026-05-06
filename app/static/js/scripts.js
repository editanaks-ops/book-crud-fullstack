"use strict";

document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();

    const createForm = document.getElementById('create-book-form');
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const book = {
            book_name: document.getElementById('book_name').value,
            author: document.getElementById('author').value,
            genre: document.getElementById('genre').value,
            date_issue: document.getElementById('date_issue').value,
            price: parseFloat(document.getElementById('price').value),
        };

        const response = await fetch('/api/books/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(book),
        });

        if (response.ok) {
            const newBook = await response.json();
            alert(`Book created: ${newBook.book_name} by ${newBook.author}`);
            createForm.reset();
            fetchBooks();
        }
    });

    const viewForm = document.getElementById('view-book-form');
    viewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookId = document.getElementById('view_book_id').value;
        const response = await fetch(`/api/books/${bookId}`);
        const resultDiv = document.getElementById('view-book-result');

        if (response.ok) {
            const book = await response.json();
            resultDiv.innerHTML = `
                <h4>Book Details:</h4>
                <p><strong>ID:</strong> ${book.id}</p>
                <p><strong>Name:</strong> ${book.book_name}</p>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Date of Issue:</strong> ${book.date_issue}</p>
                <p><strong>Price:</strong> $${book.price.toFixed(2)}</p>
            `;
        } else {
            resultDiv.innerHTML = `<p class="text-danger">Book not found</p>`;
        }
    });

    const updateForm = document.getElementById('update-book-form');
    updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookId = document.getElementById('update_book_id').value;

        const existingResponse = await fetch(`/api/books/${bookId}`);
        if (!existingResponse.ok) {
            alert('Book not found');
            return;
        }

        const existingBook = await existingResponse.json();

        const updatedBook = {
            book_name: document.getElementById('update_book_name').value || existingBook.book_name,
            author: document.getElementById('update_author').value || existingBook.author,
            genre: document.getElementById('update_genre').value || existingBook.genre,
            date_issue: document.getElementById('update_date_issue').value || existingBook.date_issue,
            price: parseFloat(document.getElementById('update_price').value) || existingBook.price,
        };

        const response = await fetch(`/api/books/${bookId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedBook),
        });

        if (response.ok) {
            const updated = await response.json();
            alert(`Book updated: ${updated.book_name} by ${updated.author}`);
            updateForm.reset();
            fetchBooks();
        }
    });

    const deleteForm = document.getElementById('delete-book-form');
    deleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookId = document.getElementById('delete_book_id').value;
        deleteBook(bookId);
        deleteForm.reset();
    });

    const filterForm = document.getElementById('filter-book-form');
    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const response = await fetch('/api/books/');
        const books = await response.json();

        const filterName = document.getElementById('filter_book_name').value.toLowerCase();
        const filterAuthor = document.getElementById('filter_author').value.toLowerCase();
        const filterGenre = document.getElementById('filter_genre').value.toLowerCase();
        const minPriceValue = document.getElementById('filter_min_price').value;
        const maxPriceValue = document.getElementById('filter_max_price').value;

        const minPrice = minPriceValue ? parseFloat(minPriceValue) : null;
        const maxPrice = maxPriceValue ? parseFloat(maxPriceValue) : null;

        const filteredBooks = books.filter(book => {
        const matchesText =
    (!filterName || book.book_name.toLowerCase().includes(filterName)) &&
    (!filterAuthor || book.author.toLowerCase().includes(filterAuthor)) &&
    (!filterGenre || book.genre.toLowerCase().includes(filterGenre));

    const matchesMinPrice = minPrice === null || book.price >= minPrice;
    const matchesMaxPrice = maxPrice === null || book.price <= maxPrice;

    return matchesText && matchesMinPrice && matchesMaxPrice;
});

        populateBooksTable(filteredBooks);
    });

    const resetFilterBtn = document.getElementById('reset-filter-btn');
    resetFilterBtn.addEventListener('click', () => {
        document.getElementById('filter_book_name').value = '';
        document.getElementById('filter_author').value = '';
        document.getElementById('filter_genre').value = '';
        document.getElementById('filter_min_price').value = '';
        document.getElementById('filter_max_price').value = '';
        fetchBooks();
    });

    async function fetchBooks() {
        const response = await fetch('/api/books/');

        if (response.ok) {
            const books = await response.json();
            populateBooksTable(books);
        }
    }

    async function deleteBook(bookId) {
        if (!confirm(`Are you sure you want to delete book ID ${bookId}?`)) {
            return;
        }

        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        });

        if (response.ok) {
            const deletedBook = await response.json();
            alert(`Book deleted: ${deletedBook.book_name} by ${deletedBook.author}`);
            fetchBooks();
        } else {
            alert('Error deleting book');
        }
    }

    function populateBooksTable(books) {
        const tbody = document.querySelector('#books-table tbody');
        tbody.innerHTML = '';

        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No books found</td></tr>';
            return;
        }

        books.forEach(book => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${book.id}</td>
                <td>${book.book_name}</td>
                <td>${book.author}</td>
                <td>${book.genre}</td>
                <td>${book.date_issue}</td>
                <td>$${book.price.toFixed(2)}</td>
                <td>
          <button class="btn btn-warning btn-sm edit-btn">
             Edit
          </button>
           <button class="btn btn-danger btn-sm delete-btn">
            Delete
    </button>
</td>
            `;

            const editButton = tr.querySelector('.edit-btn');
editButton.addEventListener('click', () => {
    document.getElementById('update_book_id').value = book.id;
    document.getElementById('update_book_name').value = book.book_name;
    document.getElementById('update_author').value = book.author;
    document.getElementById('update_genre').value = book.genre;
    document.getElementById('update_date_issue').value = book.date_issue;
    document.getElementById('update_price').value = book.price;
});

const deleteButton = tr.querySelector('.delete-btn');
deleteButton.addEventListener('click', () => {
    deleteBook(book.id);
});

            tbody.appendChild(tr);
        });
    }
});