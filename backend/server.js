const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./database");

app.use(express.json());
app.use(cors());

// CREATE TEAMS TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name TEXT NOT NULL,
    city TEXT NOT NULL,
    league TEXT
  )
`, (err) => {
  if (err) {
    console.error("Error creating teams table:", err.message);
  } else {
    console.log("Teams table ready");
  }
});

// CREATE PLAYERS TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position TEXT,
    team_id INTEGER,
    home_runs INTEGER DEFAULT 0,
    batting_avg REAL DEFAULT 0.0,
    rbi INTEGER DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )
`, (err) => {
  if (err) {
    console.error("Error creating players table:", err.message);
  } else {
    console.log("Players table ready");
  }
});

// CREATE GAMES TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_date TEXT NOT NULL,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    FOREIGN KEY (home_team_id) REFERENCES teams(id),
    FOREIGN KEY (away_team_id) REFERENCES teams(id)
  )
`, (err) => {
  if (err) {
    console.error("Error creating games table:", err.message);
  } else {
    console.log("Games table ready");
  }
});

// CREATE PLAYER GAME STATS TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS player_game_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    at_bats INTEGER DEFAULT 0,
    hits INTEGER DEFAULT 0,
    home_runs INTEGER DEFAULT 0,
    rbi INTEGER DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
  )
`, (err) => {
  if (err) {
    console.error("Error creating player_game_stats table:", err.message);
  } else {
    console.log("Player game stats table ready");
  }
});

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("MLB Analytics API is running ⚾");
});

// TEST DATABASE ROUTE
app.get("/test-db", (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// ADD TEAM
app.post("/teams", (req, res) => {
  const { team_name, city, league } = req.body;

  const sql = `
    INSERT INTO teams (team_name, city, league)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [team_name, city, league], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: "Team added successfully",
      team_id: this.lastID
    });
  });
});

// GET ALL TEAMS
app.get("/teams", (req, res) => {
  db.all("SELECT * FROM teams", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json(rows);
  });
});

// ADD PLAYER
app.post("/players", (req, res) => {
  const { first_name, last_name, position, team_id, home_runs, batting_avg, rbi } = req.body;

  const sql = `
    INSERT INTO players (first_name, last_name, position, team_id, home_runs, batting_avg, rbi)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [first_name, last_name, position, team_id, home_runs, batting_avg, rbi], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: "Player added successfully",
      player_id: this.lastID
    });
  });
});

// GET ALL PLAYERS
app.get("/players", (req, res) => {
  db.all("SELECT * FROM players", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json(rows);
  });
});

// GET PLAYERS WITH TEAM INFO
app.get("/players-with-teams", (req, res) => {
  const sql = `
    SELECT
      players.id,
      players.first_name,
      players.last_name,
      players.position,
      players.home_runs,
      players.batting_avg,
      players.rbi,
      teams.team_name,
      teams.city,
      teams.league
    FROM players
    LEFT JOIN teams ON players.team_id = teams.id
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json(rows);
  });
});

// ADD GAME
app.post("/games", (req, res) => {
  const { game_date, home_team_id, away_team_id, home_score, away_score } = req.body;

  const sql = `
    INSERT INTO games (game_date, home_team_id, away_team_id, home_score, away_score)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [game_date, home_team_id, away_team_id, home_score, away_score], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: "Game added successfully",
      game_id: this.lastID
    });
  });
});

// GET ALL GAMES
app.get("/games", (req, res) => {
  db.all("SELECT * FROM games", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json(rows);
  });
});

// GET GAMES WITH TEAM NAMES
app.get("/games-with-teams", (req, res) => {
  const sql = `
    SELECT
      games.id,
      games.game_date,
      home.team_name AS home_team,
      away.team_name AS away_team,
      games.home_score,
      games.away_score
    FROM games
    LEFT JOIN teams AS home ON games.home_team_id = home.id
    LEFT JOIN teams AS away ON games.away_team_id = away.id
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json(rows);
  });
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});