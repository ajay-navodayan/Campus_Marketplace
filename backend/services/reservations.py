from db import get_cursor, get_db
from datetime import datetime, timedelta, timezone

def list_reservations(buyer_id=None, status=None):
    """List reservations with full item details."""
    query = """
        SELECT 
            r.id,
            r.item_id,
            r.buyer_id,
            r.status,
            r.expires_at,
            r.created_at,
            i.title as item_title,
            i.price as item_price,
            i.status as item_status,
            i.image_url as item_image_url,
            c.name as category_name
        FROM reservations r
        JOIN items i ON r.item_id = i.id
        JOIN categories c ON i.category_id = c.id
        WHERE 1=1
    """
    params = []
    if buyer_id:
        query += " AND r.buyer_id = %s"
        params.append(buyer_id)
    if status:
        query += " AND r.status = %s"
        params.append(status)
    query += " ORDER BY r.created_at DESC"
    
    with get_cursor() as cur:
        cur.execute(query, params)
        return cur.fetchall()

def reserve_item(item_id, buyer_id, duration_hours=24):
    """
    Reserve an item for a buyer.
    Transactional: Check item -> Update item -> Create reservation.
    """
    expires_at = datetime.now(timezone.utc) + timedelta(hours=duration_hours)
    
    conn = get_db() # Get connection explicitly for manual transaction control
    try:
        with conn.cursor() as cur:
            # 1. Optimistic Update: Try to mark as reserved
            cur.execute("""
                UPDATE items 
                SET status = 'reserved', updated_at = NOW()
                WHERE id = %s AND status = 'available'
            """, (item_id,))
            
            if cur.rowcount == 0:
                conn.rollback()
                return {"error": "Item not available"}
            
            # 2. Create Reservation
            try:
                cur.execute("""
                    INSERT INTO reservations (item_id, buyer_id, expires_at, status)
                    VALUES (%s, %s, %s, 'active')
                    RETURNING id
                """, (item_id, buyer_id, expires_at))
            except Exception as e:
                # Catch unique constraint violation if any
                conn.rollback()
                return {"error": str(e)}
            
            res_id = cur.fetchone()['id']
            conn.commit()
            return {"reservation_id": res_id, "expires_at": expires_at}
            
    except Exception as e:
        conn.rollback()
        raise e

def confirm_reservation(reservation_id):
    """
    Complete a purchase.
    Transactional: Update item -> Update reservation.
    """
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Check reservation status
            cur.execute("""
                SELECT item_id, status FROM reservations 
                WHERE id = %s FOR UPDATE
            """, (reservation_id,))
            res = cur.fetchone()
            
            if not res:
                conn.rollback()
                return {"error": "Reservation not found"}
            
            if res['status'] != 'active':
                conn.rollback()
                return {"error": "Reservation not active"}
                
            item_id = res['item_id']
            
            # Update Item to SOLD
            cur.execute("UPDATE items SET status = 'sold' WHERE id = %s", (item_id,))
            
            # Update Reservation to COMPLETED
            cur.execute("UPDATE reservations SET status = 'completed' WHERE id = %s", (reservation_id,))
            
            conn.commit()
            return {"status": "confirmed", "item_id": item_id}
            
    except Exception as e:
        conn.rollback()
        raise e

def cancel_reservation(reservation_id, user_id):
    """
    Cancel an active reservation.
    Transactional: Update reservation -> Update item back to available.
    """
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Check reservation exists and belongs to user
            cur.execute("""
                SELECT item_id, buyer_id, status FROM reservations 
                WHERE id = %s FOR UPDATE
            """, (reservation_id,))
            res = cur.fetchone()
            
            if not res:
                conn.rollback()
                return {"error": "Reservation not found"}
            
            if str(res['buyer_id']) != str(user_id):
                conn.rollback()
                return {"error": "Not authorized to cancel this reservation"}
            
            if res['status'] != 'active':
                conn.rollback()
                return {"error": "Reservation not active"}
                
            item_id = res['item_id']
            
            # Update Reservation to CANCELLED
            cur.execute("UPDATE reservations SET status = 'cancelled' WHERE id = %s", (reservation_id,))
            
            # Update Item back to AVAILABLE
            cur.execute("UPDATE items SET status = 'available', updated_at = NOW() WHERE id = %s", (item_id,))
            
            conn.commit()
            return {"status": "cancelled", "item_id": item_id}
            
    except Exception as e:
        conn.rollback()
        raise e
