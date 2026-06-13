// Blog API
// GET /api/posts          — list posts, each with its author and comment count.
// GET /api/authors/lookup — find an author by email, with their posts.

const express = require("express");
const path = require("path");
const { listPostsWithDetails } = require("./posts-service");
const { findAuthorByEmail } = require("./author-service");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/posts", async (req, res) => {
  const started = Date.now();
  try {
    const posts = await listPostsWithDetails();
    const ms = Date.now() - started;
    console.log(`GET /api/posts -> ${posts.length} posts in ${ms} ms`);
    res.json({ count: posts.length, tookMs: ms, posts });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to load posts. See server logs." });
  }
});

// GET /api/authors/lookup?email=<email>
app.get("/api/authors/lookup", async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Pass ?email=<address>." });
  }

  const started = Date.now();
  try {
    const author = await findAuthorByEmail(email);
    const ms = Date.now() - started;
    console.log(`GET /api/authors/lookup (${email}) -> ${ms} ms`);
    if (!author) {
      return res.status(404).json({ error: "Author not found.", tookMs: ms });
    }
    res.json({ tookMs: ms, author });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Lookup failed. See server logs." });
  }
});

app.listen(PORT, () => {
  console.log(`Blog API listening on http://localhost:${PORT}`);
});
