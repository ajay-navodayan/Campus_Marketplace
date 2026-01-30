// ReservationCard component - Compact card with action buttons

import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import ReservationTimer from './ReservationTimer';
import Button from '../common/Button';
import { RESERVATION_STATUS } from '../../constants/status';
import './ReservationCard.css';

function ReservationCard({ reservation, onConfirm, onCancel, confirming, cancelling }) {
    const isActive = reservation.status === RESERVATION_STATUS.ACTIVE;

    // Use full item details from reservation
    const itemTitle = reservation.item_title || 'Unknown Item';
    const itemPrice = reservation.item_price;
    const categoryName = reservation.category_name;
    const imageUrl = reservation.item_image_url || 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image';

    return (
        <div className={`reservation-card ${isActive ? 'reservation-card--active' : 'reservation-card--past'}`}>
            <img
                src={imageUrl}
                alt={itemTitle}
                className="reservation-card-thumb"
            />

            <div className="reservation-card-main">
                <div className="reservation-card-info">
                    <Link to={`/items/${reservation.item_id}`} className="reservation-item-title">
                        {itemTitle}
                    </Link>
                    <div className="reservation-item-meta">
                        {categoryName && <span className="reservation-category">{categoryName}</span>}
                        {itemPrice && <span className="reservation-price">${Number(itemPrice).toFixed(2)}</span>}
                    </div>
                </div>

                <div className="reservation-card-status">
                    <StatusBadge status={reservation.status} type="reservation" />
                    {isActive && <ReservationTimer expiresAt={reservation.expires_at} />}
                </div>
            </div>

            {isActive && (
                <div className="reservation-card-actions">
                    {onConfirm && (
                        <Button
                            variant="primary"
                            size="small"
                            onClick={() => onConfirm(reservation.id)}
                            loading={confirming}
                            disabled={cancelling}
                        >
                            Confirm Sale
                        </Button>
                    )}
                    {onCancel && (
                        <Button
                            variant="danger"
                            size="small"
                            onClick={() => onCancel(reservation.id)}
                            loading={cancelling}
                            disabled={confirming}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default ReservationCard;
