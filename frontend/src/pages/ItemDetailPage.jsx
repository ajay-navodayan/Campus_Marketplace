// ItemDetailPage - Clear item details with unambiguous state

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useItem } from '../hooks/useItems';
import { getReservations, createReservation, cancelReservation } from '../api/reservations';
import { markItemSold } from '../api/items';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import ReservationTimer from '../components/reservations/ReservationTimer';
import { ITEM_STATUS, RESERVATION_STATUS } from '../constants/status';
import './ItemDetailPage.css';

function ItemDetailPage({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { item, loading, error, refetch } = useItem(id);
    const [reservation, setReservation] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState(null);

    useEffect(() => {
        if (item && item.status === ITEM_STATUS.RESERVED) {
            getReservations({ item_id: item.id, status: RESERVATION_STATUS.ACTIVE })
                .then(reservations => {
                    if (reservations.length > 0) {
                        setReservation(reservations[0]);
                    }
                })
                .catch(console.error);
        } else {
            setReservation(null);
        }
    }, [item]);

    if (loading) {
        return <div className="page-message">Loading item...</div>;
    }

    if (error) {
        return (
            <div className="page-message page-error">
                <p>Error: {error}</p>
                <Link to="/items">Back to items</Link>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="page-message">
                <p>Item not found</p>
                <Link to="/items">Back to items</Link>
            </div>
        );
    }

    const isOwner = currentUser && item.seller_id === currentUser.id;
    const isBuyer = reservation && currentUser && reservation.buyer_id === currentUser.id;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };


    const handleReserve = async () => {
        if (!currentUser) return;
        setActionLoading(true);
        setActionError(null);
        try {
            await createReservation(item.id, currentUser.id);
            refetch();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkSold = async () => {
        if (!currentUser) return;
        setActionLoading(true);
        setActionError(null);
        try {
            await markItemSold(item.id, currentUser.id);
            refetch();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!currentUser || !reservation) return;
        setActionLoading(true);
        setActionError(null);
        try {
            await cancelReservation(reservation.id, currentUser.id);
            setReservation(null);
            refetch();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Determine what actions are available and why
    const getActionState = () => {
        if (item.status === ITEM_STATUS.SOLD) {
            return { canAct: false, reason: 'This item has been sold.' };
        }

        if (!currentUser) {
            return { canAct: false, reason: 'Select a user to take action.' };
        }

        if (item.status === ITEM_STATUS.AVAILABLE) {
            if (isOwner) {
                return { canAct: false, reason: 'You own this item. Wait for a buyer to reserve it.' };
            }
            return { canAct: true, action: 'reserve' };
        }

        if (item.status === ITEM_STATUS.RESERVED) {
            if (isOwner) {
                return { canAct: true, action: 'confirm-sale' };
            }
            if (isBuyer) {
                return { canAct: true, action: 'cancel' };
            }
            return { canAct: false, reason: 'This item is reserved by another user.' };
        }

        return { canAct: false, reason: '' };
    };

    const actionState = getActionState();

    return (
        <div className="item-detail-page">
            <Link to="/items" className="back-link">← Back to items</Link>

            <div className="item-detail-card">
                <div className="item-detail-header">
                    <StatusBadge status={item.status} type="item" />
                    {isOwner && <span className="owner-label">Your listing</span>}
                </div>

                <h1 className="item-detail-title">{item.title}</h1>

                <div className="item-detail-price">{formatPrice(item.price)}</div>

                {item.description && (
                    <div className="item-detail-section">
                        <h3>Description</h3>
                        <p>{item.description}</p>
                    </div>
                )}

                <div className="item-detail-meta">
                    <div className="meta-item">
                        <span className="meta-label">Seller:</span>
                        <span className="meta-value">User #{item.seller_id}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Listed:</span>
                        <span className="meta-value">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Reservation state - only show when reserved */}
                {item.status === ITEM_STATUS.RESERVED && reservation && (
                    <div className="reservation-info">
                        <ReservationTimer expiresAt={reservation.expires_at} />
                        {isBuyer && <span className="reservation-yours">You reserved this item</span>}
                    </div>
                )}

                {/* Action error */}
                {actionError && (
                    <div className="action-error">{actionError}</div>
                )}

                {/* Action section - always visible */}
                <div className="item-actions">
                    {actionState.canAct ? (
                        <>
                            {actionState.action === 'reserve' && (
                                <Button variant="primary" size="large" onClick={handleReserve} loading={actionLoading}>
                                    Reserve Item
                                </Button>
                            )}
                            {actionState.action === 'confirm-sale' && (
                                <div className="action-group">
                                    <Button variant="success" size="large" onClick={handleMarkSold} loading={actionLoading}>
                                        Confirm Sale
                                    </Button>
                                    <Button variant="danger" size="large" onClick={handleCancel} loading={actionLoading}>
                                        Cancel Reservation
                                    </Button>
                                </div>
                            )}
                            {actionState.action === 'cancel' && (
                                <Button variant="danger" size="large" onClick={handleCancel} loading={actionLoading}>
                                    Cancel My Reservation
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="action-blocked">
                            {actionState.reason}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ItemDetailPage;
