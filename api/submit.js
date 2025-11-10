// Serverless function: POST /api/submit
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, highscore, games_played, total_wins } = req.body;

    // Validate input
    if (!name || typeof highscore !== 'number' || typeof games_played !== 'number' || typeof total_wins !== 'number') {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Name too long' });
    }

    // Upsert player score
    const result = await sql`
      INSERT INTO leaderboard (player_name, highscore, games_played, total_wins, last_updated)
      VALUES (${name}, ${highscore}, ${games_played}, ${total_wins}, NOW())
      ON CONFLICT (player_name) 
      DO UPDATE SET 
        highscore = GREATEST(leaderboard.highscore, ${highscore}),
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
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Failed to submit score' });
  }
}