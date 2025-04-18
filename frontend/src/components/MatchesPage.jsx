import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameweek, setSelectedGameweek] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/matches')
      .then(res => {
        const allMatches = res.data.matches || [];
        const scheduledMatches = allMatches.filter(m => m.status === "TIMED");

        const sortedGames = scheduledMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

        const upcomingMatches = sortedGames.filter(m => new Date(m.utcDate) > new Date());

        const gameweeks = [...new Set(upcomingMatches.map(m => m.matchday))];

        if (upcomingMatches.length > 0) {
          setMatches(upcomingMatches);
          setSelectedGameweek(gameweeks[0]); // Default to the first gameweek
        }
      })
      .catch(error => {
        console.error('Error fetching matches:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredMatches = selectedGameweek
    ? matches.filter(match => match.matchday === selectedGameweek)
    : matches;

  return (
    <div>
      <h2>Filter Premier League Matches by Gameweek</h2>
      {loading ? <p>Loading...</p> : (
        <div>
          <div>
            <label>Choose Gameweek:</label>
            <select
              onChange={(e) => setSelectedGameweek(Number(e.target.value))}
              value={selectedGameweek}
            >
              {Array.from(new Set(matches.map((match) => match.matchday)))
                .map((gameweek) => (
                  <option key={gameweek} value={gameweek}>
                    Gameweek {gameweek}
                  </option>
                ))}
            </select>
          </div>
          <ul>
            {filteredMatches.length === 0 ? (
              <p>No matches found for this gameweek.</p>
            ) : (
              filteredMatches.map((match, index) => (
                <li key={index}>
                  {match.utcDate?.slice(0, 15)}: {match.homeTeam?.name} vs {match.awayTeam?.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MatchesPage;