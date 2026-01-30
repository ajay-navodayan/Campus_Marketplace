"""
Seed script to populate the database with comprehensive demo data.
Run with: python seed.py
"""

import os
from datetime import datetime, timedelta, timezone
from flask import Flask
from db import init_db_pool, get_db, close_pool

# Create a dummy app context to use the DB pool
app = Flask(__name__)
init_db_pool(app)

def reset_database():
    """Drop all tables to ensure clean slate."""
    print("Resetting database...")
    with app.app_context():
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("""
                DROP TABLE IF EXISTS reservations CASCADE;
                DROP TABLE IF EXISTS items CASCADE;
                DROP TABLE IF EXISTS categories CASCADE;
                DROP TABLE IF EXISTS users CASCADE;
            """)
            conn.commit()

def run_sql_file(filename):
    print(f"Executing SQL from {filename}...")
    with open(filename, "r") as f:
        sql = f.read()
    
    with app.app_context():
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute(sql)
            conn.commit()

def seed_data():
    """Seed database with realistic demo data."""
    with app.app_context():
        conn = get_db()
        with conn.cursor() as cur:
            print("Clearing existing data...")
            cur.execute("TRUNCATE TABLE reservations, items, categories, users CASCADE;")
            conn.commit()
            
            # =================================================================
            # USERS - One seller, one buyer
            # =================================================================
            print("Creating users...")
            cur.execute("""
                INSERT INTO users (email, name) VALUES 
                (%s, %s) RETURNING id
            """, ('alice@campus.edu', 'Alice Chen'))
            seller_id = cur.fetchone()['id']
            
            cur.execute("""
                INSERT INTO users (email, name) VALUES 
                (%s, %s) RETURNING id
            """, ('bob@campus.edu', 'Bob Miller'))
            buyer_id = cur.fetchone()['id']
            conn.commit()
            print(f"  Created seller: Alice Chen (ID: {seller_id})")
            print(f"  Created buyer: Bob Miller (ID: {buyer_id})")

            # =================================================================
            # CATEGORIES
            # =================================================================
            print("Creating categories...")
            categories = {}
            for cat_name in ['Electronics', 'Books', 'Furniture']:
                cur.execute("""
                    INSERT INTO categories (name) VALUES (%s) RETURNING id
                """, (cat_name,))
                categories[cat_name] = cur.fetchone()['id']
            conn.commit()
            print(f"  Created {len(categories)} categories")

            # =================================================================
            # ITEMS - Realistic marketplace items with placeholder images
            # =================================================================
            print("Creating items...")
            items_data = [
                # Available items
                {
                    'title': 'Dell XPS 15 Laptop',
                    'description': 'Excellent condition, 16GB RAM, 512GB SSD. Used for one semester.',
                    'image_url': 'https://placehold.co/400x300/2563eb/white?text=Laptop',
                    'price': 899.00,
                    'status': 'available',
                    'category': 'Electronics'
                },
                {
                    'title': 'IKEA Study Desk',
                    'description': 'White MALM desk, 140x65cm. Minor scratches but sturdy.',
                    'image_url': 'https://placehold.co/400x300/16a34a/white?text=Desk',
                    'price': 75.00,
                    'status': 'available',
                    'category': 'Furniture'
                },
                # Items that will have completed/expired/cancelled reservations
                {
                    'title': 'Physics Textbook Bundle',
                    'description': 'Halliday & Resnick + Lab Manual. Highlighted but complete.',
                    'image_url': 'https://placehold.co/400x300/dc2626/white?text=Books',
                    'price': 45.00,
                    'status': 'sold',  # Completed reservation
                    'category': 'Books'
                },
                {
                    'title': 'Mechanical Keyboard',
                    'description': 'Keychron K2, Brown switches. Great for coding.',
                    'image_url': 'https://placehold.co/400x300/9333ea/white?text=Keyboard',
                    'price': 65.00,
                    'status': 'available',  # Expired reservation (item back to available)
                    'category': 'Electronics'
                },
                {
                    'title': 'Ergonomic Office Chair',
                    'description': 'Mesh back, adjustable height. Perfect for long study sessions.',
                    'image_url': 'https://placehold.co/400x300/f59e0b/white?text=Chair',
                    'price': 120.00,
                    'status': 'available',  # Cancelled reservation (item back to available)
                    'category': 'Furniture'
                },
            ]
            
            created_items = {}
            for item in items_data:
                cur.execute("""
                    INSERT INTO items (title, description, image_url, price, status, seller_id, category_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    item['title'],
                    item['description'],
                    item['image_url'],
                    item['price'],
                    item['status'],
                    seller_id,
                    categories[item['category']]
                ))
                created_items[item['title']] = cur.fetchone()['id']
            conn.commit()
            print(f"  Created {len(created_items)} items")

            # =================================================================
            # RESERVATIONS - Different statuses for demo
            # =================================================================
            print("Creating reservations...")
            now = datetime.now(timezone.utc)
            
            # 1. COMPLETED reservation (Physics Textbook)
            cur.execute("""
                INSERT INTO reservations (item_id, buyer_id, status, expires_at, created_at)
                VALUES (%s, %s, 'completed', %s, %s)
            """, (
                created_items['Physics Textbook Bundle'],
                buyer_id,
                now - timedelta(days=5),  # Expired 5 days ago
                now - timedelta(days=7)   # Created 7 days ago
            ))
            print("  Created COMPLETED reservation (Physics Textbook)")
            
            # 2. EXPIRED reservation (Mechanical Keyboard)
            cur.execute("""
                INSERT INTO reservations (item_id, buyer_id, status, expires_at, created_at)
                VALUES (%s, %s, 'expired', %s, %s)
            """, (
                created_items['Mechanical Keyboard'],
                buyer_id,
                now - timedelta(hours=12),  # Expired 12 hours ago
                now - timedelta(days=2)     # Created 2 days ago
            ))
            print("  Created EXPIRED reservation (Mechanical Keyboard)")
            
            # 3. CANCELLED reservation (Office Chair)
            cur.execute("""
                INSERT INTO reservations (item_id, buyer_id, status, expires_at, created_at)
                VALUES (%s, %s, 'cancelled', %s, %s)
            """, (
                created_items['Ergonomic Office Chair'],
                buyer_id,
                now + timedelta(hours=20),  # Would have expired later
                now - timedelta(days=1)     # Created yesterday
            ))
            print("  Created CANCELLED reservation (Office Chair)")
            
            # 4. ACTIVE reservation (IKEA Desk) - for testing Confirm Sale
            cur.execute("""
                INSERT INTO reservations (item_id, buyer_id, status, expires_at, created_at)
                VALUES (%s, %s, 'active', %s, %s)
            """, (
                created_items['IKEA Study Desk'],
                buyer_id,
                now + timedelta(hours=23),  # Expires in 23 hours
                now - timedelta(hours=1)    # Created 1 hour ago
            ))
            # Update item status to reserved
            cur.execute("""
                UPDATE items SET status = 'reserved' WHERE id = %s
            """, (created_items['IKEA Study Desk'],))
            print("  Created ACTIVE reservation (IKEA Desk)")
            
            conn.commit()
            print("\nDemo data summary:")
            print(f"  Users: 2 (1 seller, 1 buyer)")
            print(f"  Categories: 3")
            print(f"  Items: 5 (1 available, 1 reserved, 1 sold)")
            print(f"  Reservations: 4 (1 active, 1 completed, 1 expired, 1 cancelled)")

if __name__ == "__main__":
    reset_database()
    
    schema_path = "schema.sql"
    if os.path.exists(schema_path):
        run_sql_file(schema_path)
    
    seed_data()
    close_pool()
    print("\n✓ Seeding complete!")
