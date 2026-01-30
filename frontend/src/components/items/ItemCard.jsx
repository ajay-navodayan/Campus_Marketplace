// ItemCard component - Clear, functional item display
// Entire card is clickable, status badge filters when clicked

import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { ITEM_STATUS } from '../../constants/status';
import './ItemCard.css';

function ItemCard({ item, currentUser, onStatusClick }) {
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };


    const isSold = item.status === ITEM_STATUS.SOLD;
    const isOwner = currentUser && item.seller_id === currentUser.id;

    const handleCardClick = () => {
        navigate(`/items/${item.id}`);
    };

    const handleStatusClick = (status) => {
        if (onStatusClick) {
            onStatusClick(status);
        }
    };

    return (
        <div
            className={`item-card ${isSold ? 'item-card-sold' : ''}`}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
        >
            {/* Status Badge - Top Right, Clickable to filter */}
            <div className="item-card-badge">
                <StatusBadge
                    status={item.status}
                    type="item"
                    clickable={!!onStatusClick}
                    onClick={handleStatusClick}
                />
            </div>

            {/* Category Tag */}
            {item.category_name && (
                <span className="item-category">{item.category_name}</span>
            )}

            {/* Title */}
            <h3 className="item-title">{item.title}</h3>

            {/* Price - Prominent */}
            <div className="item-price">{formatPrice(item.price)}</div>

            {/* Seller Info */}
            <div className="item-seller">
                {item.seller_name ? (
                    <span>Listed by {isOwner ? 'you' : item.seller_name}</span>
                ) : (
                    isOwner && <span className="item-owner-tag">Your listing</span>
                )}
            </div>
        </div>
    );
}

export default ItemCard;
