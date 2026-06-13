-- Large seed for the missing-index tutorial.
-- A small dataset can't show the cost of a sequential scan, so this loads
-- 50,000 authors and 500,000 posts. It uses generate_series so the whole
-- thing runs in a few seconds instead of row-by-row inserts.
--
-- Apply with:
--   psql -d blog -f db/seed-large.sql

\timing on

TRUNCATE comments, posts, authors RESTART IDENTITY CASCADE;

-- 50,000 authors with unique emails (user1@… … user50000@…)
INSERT INTO authors (name, email)
SELECT 'Author ' || g, 'user' || g || '@example.com'
FROM generate_series(1, 50000) g;

-- 500,000 posts, each assigned to a random author
INSERT INTO posts (author_id, title, body, published_at)
SELECT
  (floor(random() * 50000) + 1)::int,
  'Post ' || g || ' title',
  'Body text for post ' || g,
  now() - (random() * interval '365 days')
FROM generate_series(1, 500000) g;

-- A few comments so the posts endpoint still has data to show.
INSERT INTO comments (post_id, author_id, body)
SELECT
  (floor(random() * 500000) + 1)::int,
  (floor(random() * 50000) + 1)::int,
  'Comment body ' || g
FROM generate_series(1, 100000) g;

SELECT
  (SELECT count(*) FROM authors)  AS authors,
  (SELECT count(*) FROM posts)    AS posts,
  (SELECT count(*) FROM comments) AS comments;
