// Author lookup service.
//
// findAuthorByEmail() looks up a single author by their email address and
// returns that author together with their posts. The SQL is correct and
// uses parameterized queries — there is nothing wrong with the code.
//
// The performance problem in this tutorial is NOT in this file. It lives
// in the schema: there is no index on authors.email, so every lookup is a
// full sequential scan of the authors table. Fixing it is a one-line
// migration, not a code change. See db/add-email-index.sql.

const { pool } = require("./db");

async function findAuthorByEmail(email) {
  // Look up the author by email. Without an index on authors.email this
  // is a Seq Scan: Postgres reads every row and discards the ones that
  // don't match.
  const { rows: authors } = await pool.query(
    `SELECT id, name, email FROM authors WHERE email = $1`,
    [email]
  );

  if (authors.length === 0) {
    return null;
  }

  const author = authors[0];

  // Their posts (this part uses idx_posts_author_id and is already fast).
  const { rows: posts } = await pool.query(
    `SELECT id, title, published_at
       FROM posts
      WHERE author_id = $1
      ORDER BY published_at DESC`,
    [author.id]
  );

  return {
    id: author.id,
    name: author.name,
    email: author.email,
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      publishedAt: p.published_at,
    })),
  };
}

module.exports = { findAuthorByEmail };
