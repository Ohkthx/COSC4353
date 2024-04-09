# Fuel Quotes

This project is a Node.js application for getting fuel pricing for a client

## Installation

Before running the application, make sure you have Node.js and npm (Node Package Manager) installed on your system.

For the database portion, a file named `.env` in the `Project/` directory is used to setup the connection string from MongoDB. An example of the `.env` is below:

```bash
MONGO_URL=mongodb://localhost/cosc4353
MONGO_USER=username
MONGO_PASSWORD=password
```

### Dependencies

- [Express](https://expressjs.com/): Fast, unopinionated, minimalist web framework for Node.js.
- [body-parser](https://www.npmjs.com/package/body-parser): Node.js body parsing middleware.

To install the dependencies, navigate to the project directory in your terminal and run:

```bash
npm install express body-parser express-session mongoose
```
