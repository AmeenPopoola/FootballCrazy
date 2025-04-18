import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/matches')
      .then(res => {
        const allMatches = res.data.matches || [];
        const scheduledMatches = allMatches.filter(m => m.status === "TIMED");

        const today = new Date();
        const sortedGames = scheduledMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
        const upcomingMatches = sortedGames.filter(m => new Date(m.utcDate) > today);

        if (upcomingMatches.length > 0) {
          const latestMatchday = upcomingMatches[0].matchday;
          const nextGameweekMatches = upcomingMatches.filter(m => m.matchday === latestMatchday);
          setMatches(nextGameweekMatches);
        } else {
          setMatches([]); // No upcoming matches
        }
      })
      .catch(error => {
        console.error('Error fetching matches:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>Upcoming Premier League Matches</h2>
      {loading ? <p>Loading...</p> : (
        <ul>
          {matches.map((match, index) => (
            <li key={index}>
              {match.utcDate?.slice(0, 15)}: {match.homeTeam?.name} vs {match.awayTeam?.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;