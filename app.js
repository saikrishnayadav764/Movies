const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let db = null;
const dbPath = path.join(__dirname, "moviesData.db");

const server = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
};

server();

app.use(express.json());

function converter(obj) {
  return {
    movieName: obj.movie_name,
  };
}

function converter_two(obj) {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
}

function converter_three(obj) {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
}

app.get("/movies/", async (request, response) => {
  let query = `SELECT movie_name FROM movie`;
  let result = await db.all(query);
  let fin = result.map((ele) => {
    return converter(ele);
  });
  response.json(fin);
});

app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  let query = `INSERT INTO movie(director_id, movie_name, lead_actor) VALUES(${directorId}, '${movieName}', '${leadActor}')`; // Corrected variable name
  await db.run(query);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  let query = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  let result = await db.get(query);
  response.json(converter_three(result));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  let query = `UPDATE movie SET director_id = ${directorId}, 
  movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId}`;
  await db.run(query);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  let query = `DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(query);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  let query = `SELECT * FROM director`;
  let result = await db.all(query);
  let fin = result.map((ele) => {
    return converter_two(ele);
  });
  response.send(fin);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  let query = `SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  let result = await db.all(query);
  let fin = result.map((ele) => {
    return converter(ele);
  });
  response.send(fin);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

module.exports = app;
