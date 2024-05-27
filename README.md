## Title

Stratex Backend Assessment

## Description

Developed a backend server for showcasing a list of books and their details using Node.js, Express.js and PostgreSQL in Typescript. Implemented adding books through csv file.

## Features

- This is a project a backend project where seller can login and add books by uploading the csv file. And user can view all the books

- Seller can view, edit and delete their own books.


# Installation

To install and run this project locally, add the following commands in your terminal, follow these steps:

1. Clone the repository from GitHub:

```bash
    `git clone https://github.com/omkargade04/stratex-backend.git`

```

2. Navigate into the project directory:

```bash
   `cd stratex-backend`
```

## Important

4. Ensure that the version of `Node.js` and `npm` you're using is compatible with the dependencies you're installing. Some dependencies may require specific Node.js versions.

```bash
   `npm install -g npm@latest`
```

5. Install `dependencies` (assuming you have `Node.js` and `npm` installed):

```bash
   `npm install`
```

6. Create a postgres database locally with name `bookstore` and run the query written in `models/init.sql` to create the tables.

7. Create a .env file in the directory and add your **postgres** credentials accordingly

   `PORT`=`5000`<br>
   `HOST`=`localhost`<br>
   `USER`=`postgres`<br>
   `PASSWORD`=`your-password`   
   `DB`=`bookstore`<br>  
   `TOKEN_SECRET`=`your-secret-token`


8. Run the below command to start the project

```bash
   `npm run dev`
```

9. Run `http://localhost:5000` on your local API tester such as Postman or Thunder to test the endpoints

## Documentation

I have provided a postman documentation consisting all the endpoints and how to use them

[Documentation Link](https://documenter.getpostman.com/view/27201705/2sA3QsAXTq)


