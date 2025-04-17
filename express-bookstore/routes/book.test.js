process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let testValues = {
  isbn: "0691161518",
  amazon_url: "http://a.co/eobPtX2",
  author: "Matthew Lane",
  language: "english",
  pages: 264,
  publisher: "Princeton University Press",
  title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
  year: 2017,
};

let testBook;

beforeEach(async function () {
  testBook = await Book.create(testValues);
});

afterEach(async function () {
  await db.query("DELETE FROM books");
});

afterAll(async function () {
  await db.end();
});

describe("GET /books", function () {
  test("Get a list of all books", async function () {
    const response = await request(app).get("/books");
    expect(response.body.books).toContainEqual(
      expect.objectContaining(testValues)
    );
  });
});

describe("GET /books/:id", function () {
  test("Get a book by id", async function () {
    const response = await request(app).get(`/books/${testBook.isbn}`);
    expect(response.body.book).toEqual(expect.objectContaining(testValues));
  });

  test("Responds with 404 if book not found", async function () {
    const response = await request(app).get("/books/0");
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /books", function () {
  test("Create a new book", async function () {
    const response = await request(app).post("/books").send(testValues);
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toEqual(expect.objectContaining(testValues));
  });

  test("Responds with 400 if book is invalid", async function () {
    const response = await request(app).post("/books").send({});
    expect(response.statusCode).toBe(400);
  });
});

describe("PUT /books/:isbn", function () {
  test("Update a book", async function () {
    const response = await request(app).put(`/books/${testBook.isbn}`).send({
      isbn: testBook.isbn,
      amazon_url: "http://a.co/dwndwndwwd",
      author: "Honey king",
      language: "english",
      pages: 224,
      publisher: "Princeton University Print",
      title: "Power-Down:Video Games sad boy",
      year: 2011,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.book).toEqual(
      expect.objectContaining({
        isbn: testBook.isbn,
        amazon_url: "http://a.co/dwndwndwwd",
        author: "Honey king",
        language: "english",
        pages: 224,
        publisher: "Princeton University Print",
        title: "Power-Down:Video Games sad boy",
        year: 2011,
      })
    );
  });

  test("Responds with 400 if book is invalid", async function () {
    const response = await request(app).put(`/books/${testBook.isbn}`).send({});
    expect(response.statusCode).toBe(400);
  });
});

describe("DELETE /books/:isbn", function () {
  test("Deletes a single book", async function () {
    const response = await request(app).delete(`/books/${testBook.isbn}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: "Book deleted" });
  });
});
