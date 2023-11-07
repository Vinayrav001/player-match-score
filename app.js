const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dpPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();

app.use(express.json());

let db = null;

const objectSnakeToCamel = (newObject) => {
  return {
    playerId: newObject.player_id,
    playerName: newObject.player_name,
  };
};

const matchSnakeToCamel = (newObject) => {
  return {
    matchId: newObject.match_id,
    match: newObject.match,
    year: newObject.year,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const allPlayerList = `
    SELECT 
      *
    FROM 
      player_details;`;
  const playerList = await db.all(allPlayerList);
  response.send(
    playersList.map((eachPlayer) => objectSnakeToCamel(eachPlayer))
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT * 
    FROM player_details
    WHERE
        player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  response.send(objectSnakeToCamel(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}'
  WHERE
    player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});


app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsQuery = `
    SELECT *
    FROM match_details
    WHERE match_id = ${matchId};`;
  const matchDetails = await db.get(matchDetailsQuery);
  response.send(matchSnakeToCamel(matchDetails));
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT *
    FROM player_match_score
        NATURAL JOIN match_details
    WHERE 
        player_id = ${playerId};`;
  const playerMatches = await db.all(getPlayerMatchesQuery);      
  response.send(
      playerMatches.map((eachMatch) => matchSnakeToCamel(eachMatch)
      )
  );
});



app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
    SELECT * 
    FROM player_match_score 
        NATURAL JOIN player_details
    WHERE match_id = ${matchId};`;
  const playersArray = await db.all(getMatchPlayersQuery);
  response.send(
      playersArray.map((eachPlayer) =>
      objectSnakeToCamel(eachPlayer)
      )
  );
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getmatchPlayersQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName,
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
    FROM player_match_score
        NATURAL JOIN player_details
    WHERE 
        player_id = ${playerId};`;
  const playersMatchDetails = await db.get(getmatchPlayersQuery);
  response.send(playersMatchDetails);
});
module.exports = app;
