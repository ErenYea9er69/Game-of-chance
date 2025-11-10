import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const result = await sql`SELECT COUNT(*) as count FROM leaderboard`;
    return res.status(200).json({ 
      status: 'OK', 
      database: 'connected',
      table: 'leaderboard',
      entries: result.rows[0].count
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    return res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message,
      hint: 'Check POSTGRES_URL environment variable in Vercel'
    });
  }
}