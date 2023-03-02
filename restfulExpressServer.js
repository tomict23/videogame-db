/*
 ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
 ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
 ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
 ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
 ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
 ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
*/
// "use strict";

// let fs = require('fs');
const path = require("path");

const { Pool } = require("pg");

const express = require("express");
const server = express();
const port = process.env.PORT || 8000; // port that Express will listen to for requests

const bodyParser = require("body-parser");
server.use(bodyParser.json());

// use DATABASE_HOST environmental variable if it exists (set by docker compose),
// or default to localhost if no value is set (run outside docker)
const DB_HOST = process.env.DATABASE_HOST || "localhost";

const pool = new Pool({
  user: "postgres",
  host: DB_HOST,
  database: "games",
  password: "password",
  port: 5432,
});
/*
 ██████╗  ██████╗ ██╗   ██╗████████╗██╗███╗   ██╗ ██████╗ 
 ██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██║████╗  ██║██╔════╝ 
 ██████╔╝██║   ██║██║   ██║   ██║   ██║██╔██╗ ██║██║  ███╗
 ██╔══██╗██║   ██║██║   ██║   ██║   ██║██║╚██╗██║██║   ██║
 ██║  ██║╚██████╔╝╚██████╔╝   ██║   ██║██║ ╚████║╚██████╔╝
 ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝ 
*/
/*
  ██████╗ ███████╗████████╗
 ██╔════╝ ██╔════╝╚══██╔══╝
 ██║  ███╗█████╗     ██║   
 ██║   ██║██╔══╝     ██║   
 ╚██████╔╝███████╗   ██║   
  ╚═════╝ ╚══════╝   ╚═╝   
*/
//GET req for main page
server.get("/", (req, res, next) => {
  pool.query(
    "SELECT * FROM videogames LEFT JOIN companies ON videogames.company_id = companies.id",
    (err, data) => {
      if (err) {
        return next(err);
      }
      console.log(data.rows);
      return res.send(data.rows);
    }
  );
});

// GET request to /videogame - Read all the games
server.get("/videogame", (req, res, next) => {
  // Get all the rows in videogames table
  pool.query("SELECT * FROM videogames", (err, result) => {
    if (err) {
      return next(err);
    }

    const rows = result.rows;
    console.log(rows);
    return res.send(rows);
  });
});

// GET request to /company - Read all the companies
server.get("/company", (req, res, next) => {
  // Get all the rows in companies table
  pool.query("SELECT * FROM companies", (err, result) => {
    if (err) {
      return next(err);
    }

    const rows = result.rows;
    console.log(rows);
    return res.send(rows);
  });
});

// GET request to /videogame/:id - Read one game
server.get("/videogame/:id", (req, res, next) => {
  // Get a single game from the table
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).send("No game found with that ID");
  }
  console.log("id: ${id}");

  pool.query("SELECT * FROM videogames WHERE id = $1", [id], (err, result) => {
    if (err) {
      return next(err);
    }

    const game = result.rows[0];
    console.log("Game Id: ${id}, values: ${game}");
    if (game) {
      return res.send(game);
    } else {
      return res.status(404).send("No game found with that ID");
    }
  });
});

/*
 ██████╗  ██████╗ ███████╗████████╗
 ██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝
 ██████╔╝██║   ██║███████╗   ██║   
 ██╔═══╝ ██║   ██║╚════██║   ██║   
 ██║     ╚██████╔╝███████║   ██║   
 ╚═╝      ╚═════╝ ╚══════╝   ╚═╝   
*/

//Server POST to add a new company to the list
server.post("/company", (req, res, next) => {
  const name = req.body.name;

  console.log("Request body: ${req.body}");
  // check request data - if everything exists and id is a number
  if (name) {
    pool.query(
      "INSERT INTO companies (name) VALUES ($1) RETURNING *",
      [name],
      (err, data) => {
        const company = data.rows[0];
        console.log("Added Company: ${name}");
        if (company) {
          return res.send(company);
        } else {
          return next(err);
        }
      }
    );
  } else {
    return res.status(400).send("Unable to add company from request body");
  }
});

// POST to /videogame - Add a game
server.post("/videogame", (req, res, next) => {
  const name = req.body.name;
  const companyId = req.body.company_id;
  const year = req.body.year;
  //
  if (name && companyId && year) {
    pool.query(
      "INSERT INTO videogames (name, company_id, year) VALUES ($1, $2, $3) RETURNING *",
      [name, companyId, year],
      (err, data) => {
        const game = data.rows[0];
        if (game) {
          console.log("Added Game:", req.body);
          return res.send(game);
        } else {
          console.log("User tried adding:", req.body);
          return next(err);
        }
      }
    );
  } else {
    return res.status(400).send("Unable to add game from request body");
  }
  //
});

/*
 ██████╗  █████╗ ████████╗ ██████╗██╗  ██╗
 ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║  ██║
 ██████╔╝███████║   ██║   ██║     ███████║
 ██╔═══╝ ██╔══██║   ██║   ██║     ██╔══██║
 ██║     ██║  ██║   ██║   ╚██████╗██║  ██║
 ╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
*/

// PATCH to /videogame/:id - Update a game
server.patch("/videogame/:id", (req, res, next) => {
  // parse id from URL
  const id = Number.parseInt(req.params.id);
  // get data from request body
  const name = req.body.name;
  const year = req.body.year;
  // if id input is ok, make DB call to get existing values
  if (!Number.isInteger(id)) {
    res.status(400).send("No pet found with that ID");
  }
  console.log("GameId: ", id);
  // get current values of the game with that id from our DB
  pool.query("SELECT * FROM videogames WHERE id = $1", [id], (err, result) => {
    if (err) {
      return next(err);
    }
    console.log("request body", req.body);
    const game = result.rows[0];
    console.log("Game Id:", id, "Values:", game);
    if (!game) {
      return res.status(404).send("No game found with that ID");
    } else {
      const updatedName = name || game.name;
      const updatedYear = year || game.year;

      pool.query(
        "UPDATE videogames SET name=$1, year=$2 WHERE id = $3 RETURNING *",
        [updatedName, updatedYear, id],
        (err, data) => {
          if (err) {
            return next(err);
          }
          const updatedGame = data.rows[0];
          console.log("updated row:", updatedGame);
          return res.send(updatedGame);
        }
      );
    }
  });
});

/*
 ██████╗ ███████╗██╗     ███████╗████████╗███████╗
 ██╔══██╗██╔════╝██║     ██╔════╝╚══██╔══╝██╔════╝
 ██║  ██║█████╗  ██║     █████╗     ██║   █████╗  
 ██║  ██║██╔══╝  ██║     ██╔══╝     ██║   ██╔══╝  
 ██████╔╝███████╗███████╗███████╗   ██║   ███████╗
 ╚═════╝ ╚══════╝╚══════╝╚══════╝   ╚═╝   ╚══════╝
*/

// DELETE to /videogame/:id - Delete a game
server.delete("/videogame/:id", (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send("No game found with that ID");
  }

  pool.query(
    "DELETE FROM videogames WHERE id = $1 RETURNING *",
    [id],
    (err, data) => {
      if (err) {
        return next(err);
      }

      const deletedGame = data.rows[0];
      console.log(deletedGame);
      if (deletedGame) {
        // respond with deleted row
        res.send(deletedGame);
      } else {
        res.status(404).send("No game found with that ID");
      }
    }
  );
});

/*
 ██████╗  ██████╗ ██╗   ██╗████████╗██╗███╗   ██╗ ██████╗     ███████╗███╗   ██╗██████╗ 
 ██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██║████╗  ██║██╔════╝     ██╔════╝████╗  ██║██╔══██╗
 ██████╔╝██║   ██║██║   ██║   ██║   ██║██╔██╗ ██║██║  ███╗    █████╗  ██╔██╗ ██║██║  ██║
 ██╔══██╗██║   ██║██║   ██║   ██║   ██║██║╚██╗██║██║   ██║    ██╔══╝  ██║╚██╗██║██║  ██║
 ██║  ██║╚██████╔╝╚██████╔╝   ██║   ██║██║ ╚████║╚██████╔╝    ███████╗██║ ╚████║██████╔╝
 ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝╚═╝  ╚═══╝╚═════╝ 
*/

// eslint-disable-next-line max-params
server.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.sendStatus(500);
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log("Listening on port", port);
});

module.exports = server;

/*
 ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗     ███████╗███╗   ██╗██████╗ 
 ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗    ██╔════╝████╗  ██║██╔══██╗
 ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝    █████╗  ██╔██╗ ██║██║  ██║
 ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗    ██╔══╝  ██║╚██╗██║██║  ██║
 ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║    ███████╗██║ ╚████║██████╔╝
 ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═══╝╚═════╝ 
*/
