# Blog API — Missing Index Debugging Tutorial (Starter)

This is the starter project for the companion tutorial on **missing
database indexes**. The `GET /api/authors/lookup?email=…` endpoint finds
an author by email. The SQL is correct, but `authors.email` has **no
index**, so every lookup is a full sequential scan of the authors table.
The fix is a one-line migration, not a code change.

## Requirements

- Node.js 18+ (Node 20 LTS recommended)
- PostgreSQL 14+ running locally
  - macOS: `brew install postgresql@16 && brew services start postgresql@16`

## Quick start

```bash
npm install
createdb blog

# load schema
psql -d blog -f db/schema.sql

# load a LARGE dataset (50k authors, 500k posts) so the seq scan is slow
psql -d blog -f db/seed-large.sql

npm start
```

Look up an author by email (note the `tookMs` field in the response):

```bash
curl -s "http://localhost:4000/api/authors/lookup?email=user12345@example.com"
```

## Reproducing and fixing

Inspect the query plan — you'll see a `Seq Scan` on `authors`:

```bash
psql -d blog -c "EXPLAIN ANALYZE SELECT id, name, email FROM authors WHERE email = 'user12345@example.com';"
```

Apply the index and inspect again — now an `Index Scan`:

```bash
psql -d blog -f db/add-email-index.sql
psql -d blog -c "EXPLAIN ANALYZE SELECT id, name, email FROM authors WHERE email = 'user12345@example.com';"
```

## Files

| File | Description |
|---|---|
| `db/schema.sql` | tables; note email is intentionally un-indexed |
| `db/seed.js` | small seed (200 posts) for the posts endpoint |
| `db/seed-large.sql` | large seed (50k authors / 500k posts) for this tutorial |
| `db/add-email-index.sql` | ✅ the fix: adds the missing index |
| `src/author-service.js` | author lookup by email (correct code, slow without index) |
| `src/posts-service.js` | posts listing (stable baseline) |
| `src/server.js` | Express app with per-request timing log |
| `public/index.html` | browser page |
