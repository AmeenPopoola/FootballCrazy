import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();  // Default locale format: e.g., "9/6/2025, 6:30:00 PM"
  };

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
            <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={`/logos/${match.homeTeam?.name}.png`}
                alt={match.homeTeam?.name}
                style={{ width: '30px', height: '30px', marginRight: '8px' }}
                onError={(e) => e.target.src = '/logos/default.png'} // fallback image
              />
              {match.homeTeam?.name} vs
              <img
                src={`/logos/${match.awayTeam?.name}.png`}
                alt={match.awayTeam?.name}
                style={{ width: '30px', height: '30px', margin: '0 8px' }}
                onError={(e) => e.target.src = '/logos/default.png'}
              />
              {match.awayTeam?.name}  - <strong>{formatDate(match.utcDate)}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;