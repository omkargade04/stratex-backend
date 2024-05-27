import express, { Request, Response } from "express";
import { generateUserToken } from "../middleware/user.middleware";
import { client } from "../model/db";
import { ReqMid } from "../types/user";
import { QueryResult } from "pg";
import bcrypt from "bcryptjs";
const csv = require("csvtojson");
require("dotenv").config();

const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  console.log(req.body);
  if (!name || !email || !password || !role) {
    console.log("Fill all details", req.body);
    return res
      .status(401)
      .json({ status: false, message: "Fill all the fields" });
  }
  try {
    console.log("Inserting all fields ", req.body);
    // Get the current timestamp in ISO format
    const timeStamp: string = new Date().toISOString();
    // Insert data into users table
    const insertUser: string =
      "INSERT INTO users(name, email, password, role, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING name, email, created_at";
    // Hash the user's password using bcrypt
    const hashPassword = await bcrypt.hash(password, 10);
    // Prepare the values for the SQL query
    console.log(hashPassword);
    const values: any[] = [
      name,
      email,
      hashPassword,
      role,
      timeStamp,
      timeStamp,
    ];
    // Execute the SQL query to insert the user data into the database
    const result: QueryResult<any> = await client.query(insertUser, values);
    const data = result.rows;

    console.log(data); // Log the data returned by the query (for debugging purposes)

    // Send a success response to the client
    res
      .status(200)
      .json({ status: true, message: "User created successfully." });
  } catch (err: any) {
    // Handle errors that occurred during the database operation

    // Extract the duplicate error message from the error object
    const duplicateError: string = err.message
      .split(" ")
      .pop()
      .replaceAll('"', "");

    if (duplicateError === "user_email_key") {
      // If a user with the same email already exists, send a 409 Conflict response
      res.status(409).json({ error: "User with this email already exists." });
    } else {
      // For other errors, log the error and send a 500 Internal Server Error response
      console.log(err);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }
};

const signin = async (req: ReqMid, res: Response) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ status: false, content: { message: "Password is required" } });
  }
  try {
    const query = `SELECT * FROM users WHERE email=$1`;
    const param = [email];
    const data: QueryResult<any> = await client.query(query, param);
    console.log(data.rows[0]);

    if (data.rowCount === 1) {
      const auth = await bcrypt.compare(password, data.rows[0].password);
      if (auth) {
        const token = await generateUserToken(data.rows[0].id);
        const user = data.rows[0];
        delete user.password;
        return res.json({
          status: true,
          token: token,
          user: user,
          message: "User signed in successfully",
        });
      } else {
        return res
          .status(400)
          .json({ status: false, message: "Invalid password" });
      }
    } else {
      return res.status(400).json({ status: false, message: "User Not Found" });
    }
  } catch (err: any) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

const postBooks = async (req: ReqMid, res: Response) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ status: false, message: "Access denied" });
    }

    const books: any[] = [];

    csv()
      .fromFile(req.file.path)
      .then(async (response: any) => {
        for (let i = 0; i < response.length; i++) {
          books.push({
            title: response[i].title,
            author: response[i].author,
            published_at: response[i].publishedDate,
            price: response[i].price,
            fk_seller: req.user.id,
          });
        }

        try {
          await client.query("BEGIN");
          for (const book of books) {
            console.log(book);
            await client.query(
              "INSERT INTO books (title, author, price, published_at, fk_seller) VALUES ($1, $2, $3, $4, $5)",
              [
                book.title,
                book.author,
                book.price,
                book.published_at,
                book.fk_seller,
              ]
            );
          }
          await client.query("COMMIT");
          res.status(201).json({ status: true, message: "Books added successfully" });
        } catch (err) {
          await client.query("ROLLBACK");
          console.error(err);
          res.status(500).json({ status: false, message: "Internal server error" });
        }
      });
  } catch (err: any) {
    return res
      .status(400)
      .json({ status: false, message: "Internal server error" });
  }
};

const getMyBooks = async (req: ReqMid, res: Response) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ status: false, message: "Access denied" });
    }

    const result = await client.query(
      "SELECT * FROM books WHERE fk_seller = $1",
      [req.user.id]
    );
    res
      .status(200)
      .json({ status: true, data: result.rows, message: "My books retrieved" });
  } catch (err: any) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const editBook = async (req: ReqMid, res: Response) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const id = req.params.id;

    const query = `SELECT * FROM books WHERE id = $1`;
    const params: any[] = [id];
    const result = await client.query(query, params);

    if (req.user.id !== result.rows[0].fk_seller) {
      return res
        .status(400)
        .json({ status: false, message: "Book belongs to someone else" });
    }

    const book = result.rows[0];

    const title = req.body.title || book.title;
    const author = req.body.author || book.author;
    const price = req.body.price || book.price;

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    await client.query(
      "UPDATE books SET title = $1, author = $2, price = $3 WHERE id = $4 AND fk_seller = $5",
      [title, author, price, id, req.user.id]
    );

    res
      .status(200)
      .json({ status: true, message: "Book updated successfully" });
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const deleteBook = async (req: ReqMid, res: Response) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const id = req.params.id;

    const query = `SELECT * FROM books WHERE id = $1`;
    const params: any[] = [id];
    const result = await client.query(query, params);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.user.id !== result.rows[0].fk_seller) {
      return res
        .status(400)
        .json({ status: false, message: "Book belongs to someone else" });
    }

    const deleteQuery = `DELETE FROM books WHERE id = $1 AND fk_seller = $2`;
    const deleteParams = [id, req.user.id];
    await client.query(deleteQuery, deleteParams);
    res
      .status(201)
      .json({ status: true, message: "Book deleted successfully" });
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const getAllBooks = async (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM books`;
    const result = await client.query(query);
    res.status(200).json({
      status: true,
      data: result.rows,
      message: "All books retrieved",
    });
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const getABook = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const query = `SELECT * FROM books WHERE id=$1`;
    const param = [id];
    const result = await client.query(query, param);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      status: true,
      data: result.rows[0],
      message: "Book details retrieved",
    });
  } catch (err: any) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = {
  signup,
  signin,
  postBooks,
  getMyBooks,
  editBook,
  deleteBook,
  getAllBooks,
  getABook,
};
