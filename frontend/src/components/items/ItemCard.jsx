// ItemCard component - Enhanced with product images and modern styling

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

    const categoryIcons = {
        'Electronics': '💻',
        'Books': '📚',
        'Accessories': '🎒',
        'Furniture': '🪑',
        'Sports': '⚽',
        'Clothing': '👕',
        'Other': '📦'
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
            {/* Image Section */}
            <div className="item-card-image">
                {item.image_url ? (
                    <img src={item.image_url} alt={item.title} loading="lazy" />
                ) : (
                    <div className="item-card-placeholder">
                        <span className="placeholder-icon">
                            {categoryIcons[item.category_name] || '📦'}
                        </span>
                    </div>
                )}

                {/* Status Badge - Overlay on image */}
                <div className="item-card-badge">
                    <StatusBadge
                        status={item.status}
                        type="item"
                        clickable={!!onStatusClick}
                        onClick={handleStatusClick}
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="item-card-content">
                {/* Category Tag */}
                {item.category_name && (
                    <span className="item-category">{item.category_name}</span>
                )}

                {/* Title */}
                <h3 className="item-title">{item.title}</h3>

                {/* Price & Seller Footer */}
                <div className="item-card-footer">
                    <span className="item-price">{formatPrice(item.price)}</span>
                    <span className="item-seller">
                        {item.seller_name ? (
                            isOwner ? 'Your listing' : `by ${item.seller_name}`
                        ) : (
                            isOwner && 'Your listing'
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ItemCard;
