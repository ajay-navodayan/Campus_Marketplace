# Campus Marketplace

A lightweight campus marketplace system designed to demonstrate clean API-driven architecture and transactional integrity in a full-stack application.

---

## Problem Statement

Campus communities often struggle with:

- **Scattered listings** — Items posted across multiple platforms (WhatsApp groups, notice boards, social media)
- **Reservation conflicts** — Multiple buyers interested in the same item with no coordination
- **Unclear availability** — No way to know if an item is still available or already claimed

This system provides a centralized platform where sellers can list items, buyers can reserve them, and the entire flow is managed through a single source of truth.

---

## System Overview

### How It Works

1. **Listing** — Sellers create item listings with title, description, price, and category
2. **Reservation** — Buyers reserve available items (item becomes "reserved" for 24 hours)
3. **Confirmation** — Seller confirms the sale (item becomes "sold") or buyer cancels (item returns to "available")

### Key Design Principles

| Principle | Implementation |
|-----------|----------------|
| Backend is the single source of truth | All state changes happen via API → Database → Response |
| Frontend contains no business logic | UI only renders data from API responses |
| Same UI for all users | Alice and Bob see the same components; differences are data-driven |
| Transactional integrity | Reservation logic uses database constraints and atomic transactions |

---

## Architecture

### Backend

- **Framework**: Flask (Python)
- **Database**: PostgreSQL
- **Data Access**: Raw SQL (no ORM)
- **Driver**: psycopg

#### Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Demo users (Alice, Bob) |
| `categories` | Item categories (Electronics, Books, Furniture) |
| `items` | Listings with status (available, reserved, sold) |
| `reservations` | Reservation records with status (active, completed, cancelled, expired) |

#### Transaction Guarantees

- `reserve_item`: Atomically updates item status + creates reservation
- `confirm_reservation`: Atomically marks reservation completed + item sold
- `cancel_reservation`: Atomically marks reservation cancelled + item available

### Frontend

- **Framework**: React
- **Build Tool**: Vite
- **Language**: JavaScript

#### Main Views

| Page | Purpose |
|------|---------|
| Browse Items | View all available items |
| Item Detail | View item details, reserve if available |
| My Reservations | View active and past reservations |
| Create Listing | List a new item for sale |

---

## Demo Users

The system includes three demo users for testing the marketplace:

| User | Email | Demo Activity |
|------|-------|---------------|
| Ajay | ajay@campus.edu | Selling laptop & CSE textbooks, reserved Ritik's keyboard (expired) |
| Ritik | ritik@campus.edu | Selling hoodie & keyboard, bought Manu's math book |
| Manu | manu@campus.edu | Selling backpack & math book (sold), reserving Ajay's laptop |

All users see the same UI and can both buy and sell. Their different experiences come purely from the data returned by APIs based on their interactions.

---

---

## API Overview

### Items

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/items` | GET | List all items (with optional filters) |
| `/items` | POST | Create a new item listing |
| `/items/{id}` | GET | Get item details |
| `/items/{id}/sold` | POST | Mark item as sold directly |

### Reservations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reservations` | GET | List reservations (with optional filters) |
| `/reservations` | POST | Create a reservation for an item |
| `/reservations/{id}/confirm` | POST | Confirm sale (item → sold) |
| `/reservations/{id}/cancel` | POST | Cancel reservation (item → available) |

### Supporting

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users` | GET | List demo users |
| `/categories` | GET | List categories |

---

## Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (running locally)

### Database Setup

1. Create a PostgreSQL database named `campus_marketplace`
2. Set the `DATABASE_URL` environment variable:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/campus_marketplace"
   ```

### Backend

```bash
cd backend

# Create virtual environment
python -m venv ../venv
source ../venv/bin/activate  # On Windows: ..\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database
python seed.py

# Run the server
flask run --host=0.0.0.0 --port=8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend runs at `http://localhost:5173` and connects to the backend at `http://localhost:8000`.

---

## Project Structure

```
├── backend/
│   ├── app.py              # Flask routes
│   ├── db.py               # Database connection pool
│   ├── schema.sql          # Table definitions
│   ├── seed.py             # Demo data seeding
│   ├── requirements.txt    # Python dependencies
│   └── services/           # Business logic
│       ├── items.py
│       ├── categories.py
│       ├── users.py
│       └── reservations.py
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API client functions
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   └── constants/      # Status constants
│   ├── package.json
│   └── vite.config.js
```

---

## Non-Goals

This is an interview assignment focused on demonstrating architecture. The following are **intentionally not implemented**:

- ❌ Authentication / Authorization
- ❌ Payment processing
- ❌ Image uploads
- ❌ Real-time updates
- ❌ Production deployment
- ❌ Rate limiting / Security hardening

---

## Author

Built as a Product/System Design interview assignment demonstrating clean architecture, API-driven design, and transactional database operations.
