const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test connection
    await sql`SELECT 1`;
    
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    
    const result = await sql`
      SELECT player_name, highscore, games_played, total_wins, last_updated 
      FROM leaderboard 
      ORDER BY highscore DESC 
      LIMIT ${limit}
    `;
    
    return res.status(200).json(result.rows || []);
  } catch (error) {
    console.error('Leaderboard error:', error.message);
    
    return res.status(500).json({ 
      error: 'Database query failed',
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
};