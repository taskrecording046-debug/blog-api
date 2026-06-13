// Blog API
// GET /api/posts — list posts, each with its author and comment count.

const express = require("express");
const path = require("path");
const { listPostsWithDetails } = require("./posts-service");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/posts", async (req, res) => {
  const started = Date.now();
  try {
    const posts = await listPostsWithDetails();
    const ms = Date.now() - started;
    // Log how long the endpoint took — this is the number we watch.
    console.log(`GET /api/posts -> ${posts.length} posts in ${ms} ms`);
    res.json({ count: posts.length, tookMs: ms, posts });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to load posts. See server logs." });
  }
});

app.listen(PORT, () => {
  console.log(`Blog API listening on http://localhost:${PORT}`);
});
