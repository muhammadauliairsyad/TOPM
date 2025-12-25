# OPMV3

OpenMusic API v3 structure with API server and separate consumer worker.

## Struktur Repo

```
openmusic-api-v3/
├─ consumer/
├─ migrations/
├─ src/
├─ .env.example
├─ package.json
└─ README.md
```

## API Server

1. Copy `.env.example` to `.env` and fill in the values.
2. Run migrations with node-pg-migrate:

```bash
npm run migrate -- --database-url "$DATABASE_URL" --migrations-dir migrations --migrations-table migrations
```

3. Start the server:

```bash
npm start
```

## Consumer

1. Copy `consumer/.env.example` to `consumer/.env` and fill in the values.
2. Install dependencies and run:

```bash
cd consumer
npm install
npm start
```
