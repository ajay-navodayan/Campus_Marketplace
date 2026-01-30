// MyItemsPage - Seller view of their listings

import { useItems } from '../hooks/useItems';
import ItemGrid from '../components/items/ItemGrid';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { ITEM_STATUS } from '../constants/status';
import './MyItemsPage.css';

function MyItemsPage({ currentUser }) {
    const { items, loading, error } = useItems(
        currentUser ? { seller_id: currentUser.id } : {}
    );

    if (!currentUser) {
        return (
            <div className="my-items-page">
                <div className="page-message">
                    Select a user to view their items.
                </div>
            </div>
        );
    }

    // Group items by status for seller clarity
    const availableItems = items.filter(i => i.status === ITEM_STATUS.AVAILABLE);
    const reservedItems = items.filter(i => i.status === ITEM_STATUS.RESERVED);
    const soldItems = items.filter(i => i.status === ITEM_STATUS.SOLD);

    return (
        <div className="my-items-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">My Items</h1>
                    <p className="page-subtitle">{items.length} listings</p>
                </div>
                <Link to="/items/new">
                    <Button variant="primary">List New Item</Button>
                </Link>
            </header>

            {loading ? (
                <div className="page-message">Loading your items...</div>
            ) : error ? (
                <div className="page-message page-error">Error: {error}</div>
            ) : items.length === 0 ? (
                <div className="page-message">
                    You haven't listed any items yet.
                    <Link to="/items/new" className="page-message-link">Create your first listing</Link>
                </div>
            ) : (
                <div className="items-sections">
                    {reservedItems.length > 0 && (
                        <section className="items-section">
                            <h2 className="section-title">
                                Pending Sale ({reservedItems.length})
                                <span className="section-hint">Buyer reserved - confirm or cancel</span>
                            </h2>
                            <ItemGrid items={reservedItems} currentUser={currentUser} />
                        </section>
                    )}

                    {availableItems.length > 0 && (
                        <section className="items-section">
                            <h2 className="section-title">Available ({availableItems.length})</h2>
                            <ItemGrid items={availableItems} currentUser={currentUser} />
                        </section>
                    )}

                    {soldItems.length > 0 && (
                        <section className="items-section">
                            <h2 className="section-title">Sold ({soldItems.length})</h2>
                            <ItemGrid items={soldItems} currentUser={currentUser} />
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyItemsPage;
