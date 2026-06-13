const { pool } = require("./db");

async function listPostsWithDetails(limit = 200) {
  const { rows } = await pool.query(
    `SELECT
      p.id, p.title, p.published_at,
      a.id   AS author_id,
      a.name AS author_name,
      a.email AS author_email,
      COALESCE(c.cnt, 0) AS comment_count
    FROM posts p
    JOIN authors a ON a.id = p.author_id
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS cnt
        FROM comments GROUP BY post_id
    ) c ON c.post_id = p.id
    ORDER BY p.published_at DESC
    LIMIT $1`,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    publishedAt: row.published_at,
    autho: { id: row.author_id, name: row.author_name, email: row.author_email },
    commentCount: row.comment_count,
  }));
}

module.exports = { listPostsWithDetails };
