// ItemListPage - PRIMARY SCREEN: Browse Items
// Items visible immediately above the fold
// Status badges on cards are clickable to filter

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { useCategories } from '../hooks/useCategories';
import ItemGrid from '../components/items/ItemGrid';
import CategoryFilter from '../components/categories/CategoryFilter';
import { ITEM_STATUS } from '../constants/status';
import './ItemListPage.css';

function ItemListPage({ currentUser }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get('category') || null
    );
    const [statusFilter, setStatusFilter] = useState(null);

    const filters = {
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(statusFilter && { status: statusFilter })
    };

    const { items: allItems, loading, error, refetch } = useItems(filters);

    // Filter out current user's items
    const items = currentUser
        ? allItems.filter(item => item.seller_id !== currentUser.id && item.status !== ITEM_STATUS.SOLD)
        : allItems.filter(item => item.status !== ITEM_STATUS.SOLD);
    const { categories, loading: categoriesLoading } = useCategories();

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        if (categoryId) {
            setSearchParams({ category: categoryId });
        } else {
            setSearchParams({});
        }
    };

    // Handle status badge click from cards
    const handleStatusClick = (status) => {
        setStatusFilter(status);
    };

    useEffect(() => {
        refetch();
    }, [selectedCategory, statusFilter]);

    // Count by status for filter buttons
    const availableCount = items.filter(i => i.status === ITEM_STATUS.AVAILABLE).length;
    const reservedCount = items.filter(i => i.status === ITEM_STATUS.RESERVED).length;
    const soldCount = items.filter(i => i.status === ITEM_STATUS.SOLD).length;

    return (
        <div className="item-list-page">
            <div className="filters-bar">
                <div className="filter-group">
                    <span className="filter-label">Category:</span>
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                        loading={categoriesLoading}
                    />
                </div>

                <div className="filter-group">
                    <span className="filter-label">Status:</span>
                    <div className="status-filters">
                        <button
                            className={`filter-btn ${!statusFilter ? 'active' : ''}`}
                            onClick={() => setStatusFilter(null)}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn filter-btn-available ${statusFilter === ITEM_STATUS.AVAILABLE ? 'active' : ''}`}
                            onClick={() => setStatusFilter(ITEM_STATUS.AVAILABLE)}
                        >
                            <span className="filter-dot filter-dot-available"></span>
                            Available {!statusFilter && `(${availableCount})`}
                        </button>
                        <button
                            className={`filter-btn filter-btn-reserved ${statusFilter === ITEM_STATUS.RESERVED ? 'active' : ''}`}
                            onClick={() => setStatusFilter(ITEM_STATUS.RESERVED)}
                        >
                            <span className="filter-dot filter-dot-reserved"></span>
                            Reserved {!statusFilter && `(${reservedCount})`}
                        </button>

                    </div>
                </div>
            </div>

            <ItemGrid
                items={items}
                loading={loading}
                error={error}
                emptyMessage="No items found"
                currentUser={currentUser}
                onStatusClick={handleStatusClick}
            />
        </div>
    );
}

export default ItemListPage;
