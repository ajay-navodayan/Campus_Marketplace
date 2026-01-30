// HomePage - Campus Marketplace Landing Page
// Professional hero section with campus branding and quick actions

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getItems } from '../api/items';
import { getCategories } from '../api/categories';
import './HomePage.css';

function HomePage() {
    const [featuredItems, setFeaturedItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getItems({ status: 'available' }),
            getCategories()
        ]).then(([items, cats]) => {
            setFeaturedItems(items.slice(0, 4));
            setCategories(cats.filter(c => c.name !== 'Other').slice(0, 6));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

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

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-pattern"></div>
                <div className="hero-content">
                    <span className="hero-badge">🎓 Student Marketplace</span>
                    <h1 className="hero-title">
                        Buy & Sell Within<br />
                        <span className="gradient-text">Your Campus</span>
                    </h1>
                    <p className="hero-subtitle">
                        The trusted marketplace for students. Find textbooks, electronics, 
                        furniture and more from fellow students at great prices.
                    </p>
                    <div className="hero-actions">
                        <Link to="/items" className="btn-primary">
                            <span>Browse Items</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </Link>
                        <Link to="/items/new" className="btn-secondary">
                            <span>Start Selling</span>
                        </Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">100+</span>
                            <span className="stat-label">Active Listings</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">50+</span>
                            <span className="stat-label">Happy Students</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">24h</span>
                            <span className="stat-label">Reservation Hold</span>
                        </div>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card hero-card-1">
                        <span className="hero-card-emoji">📚</span>
                        <span>Textbooks</span>
                    </div>
                    <div className="hero-card hero-card-2">
                        <span className="hero-card-emoji">💻</span>
                        <span>Electronics</span>
                    </div>
                    <div className="hero-card hero-card-3">
                        <span className="hero-card-emoji">🎒</span>
                        <span>Accessories</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="section-header">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">Simple, safe, and designed for campus life</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Browse & Discover</h3>
                        <p>Explore items listed by students in your campus. Filter by category to find exactly what you need.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Reserve Securely</h3>
                        <p>Reserve items for 24 hours to arrange meetup. No one else can buy it while you decide.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🤝</div>
                        <h3>Meet & Trade</h3>
                        <p>Meet on campus to complete the transaction. Safe, local, and convenient.</p>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="section-header">
                    <h2 className="section-title">Popular Categories</h2>
                    <Link to="/items" className="section-link">View All →</Link>
                </div>
                <div className="categories-grid">
                    {categories.map((category, index) => (
                        <Link 
                            key={category.id} 
                            to={`/items?category=${category.id}`}
                            className="category-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <span className="category-icon">
                                {categoryIcons[category.name] || '📦'}
                            </span>
                            <span className="category-name">{category.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Items Section */}
            {featuredItems.length > 0 && (
                <section className="featured-section">
                    <div className="section-header">
                        <h2 className="section-title">Recently Listed</h2>
                        <Link to="/items" className="section-link">See All Items →</Link>
                    </div>
                    <div className="featured-grid">
                        {featuredItems.map((item, index) => (
                            <Link 
                                key={item.id} 
                                to={`/items/${item.id}`}
                                className="featured-item"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="featured-item-image">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.title} />
                                    ) : (
                                        <div className="featured-item-placeholder">
                                            {categoryIcons[item.category_name] || '📦'}
                                        </div>
                                    )}
                                    <span className="featured-item-status">Available</span>
                                </div>
                                <div className="featured-item-content">
                                    <span className="featured-item-category">{item.category_name}</span>
                                    <h3 className="featured-item-title">{item.title}</h3>
                                    <div className="featured-item-footer">
                                        <span className="featured-item-price">{formatPrice(item.price)}</span>
                                        <span className="featured-item-seller">by {item.seller_name}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to declutter?</h2>
                    <p>Turn your unused items into cash. List them in seconds.</p>
                    <Link to="/items/new" className="btn-primary">
                        <span>List Your First Item</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
