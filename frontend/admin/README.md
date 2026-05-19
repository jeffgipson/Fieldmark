## Admin App

The admin app lives at `frontend/admin`. To run it:

```bash
cd frontend/admin
npm install
npm run dev
```

- It runs on http://localhost:5175
- Login with `admin@fieldmark.app` and password `password123` (from `api/.env.example`), or click **Use Demo Account**

## Sample data

The admin UI reads from the same PostgreSQL database as the API. If counts are zero, seed development data:

```bash
cd api
bin/rails db:seed
```

That loads ~100 Cape Girardeau farmers, vendors, benchmarks, and the admin account. Refresh the dashboard after seeding.

