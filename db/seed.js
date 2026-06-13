// Seed the database with enough data to make the N+1 problem visible.
// Run with: npm run seed

const fs = require("fs");
const path = require("path");
const { pool } = require("../src/db");

const AUTHOR_COUNT = 25;
const POST_COUNT = 200;
const MAX_COMMENTS_PER_POST = 8;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FIRST = ["Ada", "Alan", "Grace", "Linus", "Margaret", "Dennis", "Barbara", "Ken", "Edsger", "Donald"];
const LAST = ["Lovelace", "Turing", "Hopper", "Torvalds", "Hamilton", "Ritchie", "Liskov", "Thompson", "Dijkstra", "Knuth"];

const WORDS = "stream buffer index query latency cache schema vector kernel pointer thread socket daemon syntax token".split(" ");

function sentence(n) {
  return Array.from({ length: n }, () => pick(WORDS)).join(" ");
}

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("Schema created.");

  // Authors
  const authorIds = [];
  for (let i = 0; i < AUTHOR_COUNT; i++) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    const email = `user${i}@example.com`;
    const { rows } = await pool.query(
      "INSERT INTO authors (name, email) VALUES ($1, $2) RETURNING id",
      [name, email]
    );
    authorIds.push(rows[0].id);
  }
  console.log(`Inserted ${authorIds.length} authors.`);

  // Posts
  const postIds = [];
  for (let i = 0; i < POST_COUNT; i++) {
    const { rows } = await pool.query(
      "INSERT INTO posts (author_id, title, body) VALUES ($1, $2, $3) RETURNING id",
      [pick(authorIds), `Post ${i + 1}: ${sentence(4)}`, sentence(40)]
    );
    postIds.push(rows[0].id);
  }
  console.log(`Inserted ${postIds.length} posts.`);

  // Comments
  let commentCount = 0;
  for (const postId of postIds) {
    const n = Math.floor(Math.random() * (MAX_COMMENTS_PER_POST + 1));
    for (let j = 0; j < n; j++) {
      await pool.query(
        "INSERT INTO comments (post_id, author_id, body) VALUES ($1, $2, $3)",
        [postId, pick(authorIds), sentence(12)]
      );
      commentCount++;
    }
  }
  console.log(`Inserted ${commentCount} comments.`);

  await pool.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
