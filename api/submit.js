const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test connection
    await sql`SELECT 1`;
    
    const { name, highscore, games_played, total_wins } = req.body;

    if (!name || typeof highscore !== 'number' || typeof games_played !== 'number' || typeof total_wins !== 'number') {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Name too long (max 100 chars)' });
    }

    const result = await sql`
      INSERT INTO leaderboard (player_name, highscore, games_played, total_wins, last_updated)
      VALUES (${name}, ${highscore}, ${games_played}, ${total_wins}, NOW())
      ON CONFLICT (player_name) 
      DO UPDATE SET 
        highscore = ${highscore},
        games_played = ${games_played},
        total_wins = ${total_wins},
        last_updated = NOW()
      RETURNING *
    `;

    const player = result.rows[0];
    const isNewHighscore = player.highscore === highscore;

    return res.status(200).json({
      success: true,
      player,
      isNewHighscore
    });
  } catch (error) {
    console.error('Submit error:', error.message);
    
    return res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
};