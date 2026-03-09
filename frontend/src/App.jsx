import { useEffect, useState } from "react";

function App() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/players-with-teams")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data);
      })
      .catch((err) => {
        console.error("Error fetching players:", err);
      });
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>MLB Analytics ⚾</h1>

      {players.length === 0 ? (
        <p>No players found</p>
      ) : (
        players.map((player) => (
          <div
            key={player.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <h2>
              {player.first_name} {player.last_name}
            </h2>
            <p>Position: {player.position}</p>
            <p>
              Team: {player.city} {player.team_name}
            </p>
            <p>Home Runs: {player.home_runs}</p>
            <p>Batting Avg: {player.batting_avg}</p>
            <p>RBI: {player.rbi}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;