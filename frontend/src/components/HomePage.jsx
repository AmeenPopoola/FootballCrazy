import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Function to format date and time
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return {
    day: date.toLocaleString('en-US', { weekday: 'long' }),  // Day of the week
    date: date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),  // Full date (e.g., May 7, 2025)
    time: date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })  // Time (12-hour format)
  };
};

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

  // Group matches by day
  const groupedMatches = matches.reduce((acc, match) => {
    const matchDate = formatDate(match.utcDate);
    const dayKey = `${matchDate.day}, ${matchDate.date}`; // Using day and date as a unique key

    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(match);
    return acc;
  }, {});

  return (
    <div>
      <h2>Upcoming Premier League Matches</h2>
      {loading ? <p>Loading...</p> : (
        <div>
          {Object.keys(groupedMatches).map((day, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <h3>{day}</h3> {/* Display the day and date */}
              <ul>
                {groupedMatches[day].map((match, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <img 
                      src={`/logos/${match.homeTeam?.name}.png`} 
                      alt={match.homeTeam?.name} 
                      style={{ width: '30px', height: '30px' }} 
                      onError={(e) => e.target.src = '/logos/default.png'} 
                    />
                    {match.homeTeam?.name} vs
                    <img 
                      src={`/logos/${match.awayTeam?.name}.png`} 
                      alt={match.awayTeam?.name} 
                      style={{ width: '30px', height: '30px' }} 
                      onError={(e) => e.target.src = '/logos/default.png'} 
                    />
                    {match.awayTeam?.name} - <strong>{formatDate(match.utcDate).time}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
