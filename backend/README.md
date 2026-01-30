# Campus Marketplace Backend (Flask)

Simplified Flask backend with pure SQL architecture.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set environment variables (optional, defaults to local):
   ```bash
   export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campus_marketplace"
   ```

3. Initialize Database:
   ```bash
   psql $DATABASE_URL -f schema.sql
   ```
   *(Or copy content of schema.sql and run in your SQL tool)*

4. Run Application:
   ```bash
   flask run
   # OR
   python app.py
   ```

## Architecture

- **app.py**: Entry point, defines routes.
- **db.py**: Database connection pool (psycopg).
- **services/**: Business logic and raw SQL queries.
- **schema.sql**: Database definition (Run this to create tables).

## Endpoints

- `GET /items`: List items.
- `POST /items`: Create item.
- `POST /items/<id>/reserve`: Reserve item.
- `POST /items/reservations/<id>/confirm`: Confirm purchase.
