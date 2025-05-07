import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameweek, setSelectedGameweek] = useState(null);
  const [filterUpcoming, setFilterUpcoming] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/matches')
      .then(res => {
        const allMatches = res.data.matches || [];
        const relevantMatches = allMatches.filter(
          m => m.status === "TIMED" || m.status === "FINISHED"
        );

        const sorted = relevantMatches.sort(
          (a, b) => new Date(a.utcDate) - new Date(b.utcDate)
        );

        const upcoming = sorted.filter(m => new Date(m.utcDate) > new Date());
        const past = sorted.filter(m => new Date(m.utcDate) <= new Date());

        const filtered = filterUpcoming ? upcoming : past;

        const gameweeks = [...new Set(filtered.map(m => m.matchday))];
        setMatches(filtered);
        setSelectedGameweek(gameweeks[0]);
      })
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [filterUpcoming]);

  const filteredMatches = selectedGameweek
    ? matches.filter(m => m.matchday === selectedGameweek)
    : matches;

  const groupedByDate = filteredMatches.reduce((acc, match) => {
    const date = new Date(match.utcDate).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  return (
    <div>
      <h2 style={{ color: '#fff' }}>{filterUpcoming ? "Upcoming Fixtures" : "Previous Results"} Premier League Matches</h2>

      {loading ? <p>Loading...</p> : (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#ccc' }}>Choose Gameweek:</label>
            <select
              onChange={(e) => setSelectedGameweek(Number(e.target.value))}
              value={selectedGameweek}
            >
              {[...new Set(matches.map(m => m.matchday))].map(gw => (
                <option key={gw} value={gw}>Gameweek {gw}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => setFilterUpcoming(true)}>Upcoming Games</button>
            <button onClick={() => setFilterUpcoming(false)}>Previous Results</button>
          </div>

          {Object.entries(groupedByDate).map(([date, matchList]) => (
            <div key={date}>
              <h3 style={{ color: '#ddd' }}>{date}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {matchList.map((match, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: '10px',
                      padding: '1rem',
                      width: '300px',
                      backgroundColor: '#1e1e1e',
                      color: '#f1f1f1',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.4)'
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      {new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                          src={`/logos/${match.homeTeam?.name}.png`}
                          alt={match.homeTeam?.name}
                          style={{ width: '30px', height: '30px' }}
                          onError={(e) => e.target.src = '/logos/default.png'}
                        />
                        <span>{match.homeTeam?.name}</span>
                      </div>
                      <strong> vs </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                          src={`/logos/${match.awayTeam?.name}.png`}
                          alt={match.awayTeam?.name}
                          style={{ width: '30px', height: '30px' }}
                          onError={(e) => e.target.src = '/logos/default.png'}
                        />
                        <span>{match.awayTeam?.name}</span>
                      </div>
                    </div>

                    {match.status === "FINISHED" && (
                      <div style={{ marginTop: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                        Final Score: {match.score.fullTime.home} : {match.score.fullTime.away}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchesPage;

