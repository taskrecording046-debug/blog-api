// ⚠️ Starter version — this module has a classic N+1 query problem.
//
// listPostsWithDetails() first runs ONE query to fetch all posts, then
// loops over them and runs TWO more queries PER post (one for the author,
// one for the comment count). For N posts that's 1 + 2N queries.
//
// It returns correct data, and on a tiny dev dataset it feels instant.
// But every extra post adds two more round-trips to the database, so the
// endpoint's latency grows linearly with the number of rows — the kind
// of thing that passes review and then melts in production.
//
// See posts-service.fixed.js for the corrected version.

const { pool } = require("./db");

async function listPostsWithDetails(limit = 200) {
  // Query #1: all the posts.
  const { rows: posts } = await pool.query(
    `SELECT id, author_id, title, published_at
       FROM posts
       ORDER BY published_at DESC
       LIMIT $1`,
    [limit]
  );

  const result = [];

  for (const post of posts) {
    // Query #2 (per post): the author.
    const { rows: authorRows } = await pool.query(
      `SELECT id, name, email FROM authors WHERE id = $1`,
      [post.author_id]
    );

    // Query #3 (per post): how many comments it has.
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM comments WHERE post_id = $1`,
      [post.id]
    );

    result.push({
      id: post.id,
      title: post.title,
      publishedAt: post.published_at,
      author: authorRows[0],
      commentCount: countRows[0].count,
    });
  }

  return result;
}

module.exports = { listPostsWithDetails };
