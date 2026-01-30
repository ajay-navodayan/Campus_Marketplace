// UserMenu - Dropdown menu for user profile and actions

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserMenu.css';

function UserMenu({ currentUser, users = [], onUserChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return '?';
        return String(name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Handle menu item click
    const handleMenuItemClick = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    // Handle demo user selection
    const handleUserSelect = (user) => {
        onUserChange(user);
        setIsOpen(false);
    };

    return (
        <div className="user-menu" ref={menuRef}>
            <button
                className={`user-menu-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {currentUser ? (
                    <>
                        <div className="user-avatar">
                            {getInitials(currentUser.name)}
                        </div>
                        <span className="user-name">{currentUser.name}</span>
                    </>
                ) : (
                    <>
                        <div className="user-avatar" style={{ background: '#94a3b8' }}>
                            👤
                        </div>
                        <span className="user-name">Log In</span>
                    </>
                )}
                <span className="user-menu-chevron">▼</span>
            </button>

            {isOpen && <div className="user-menu-backdrop" onClick={() => setIsOpen(false)} />}

            <div className={`user-menu-dropdown ${isOpen ? 'open' : ''}`}>
                {/* Navigation Section - Only if logged in */}
                {currentUser && (
                    <div className="user-menu-section">
                        <button
                            className="user-menu-item"
                            onClick={() => handleMenuItemClick('/my-items')}
                        >
                            <span className="user-menu-item-icon">📦</span>
                            <span className="user-menu-item-label">My Items</span>
                        </button>
                        <button
                            className="user-menu-item"
                            onClick={() => handleMenuItemClick('/my-reservations')}
                        >
                            <span className="user-menu-item-icon">🔖</span>
                            <span className="user-menu-item-label">My Reservations</span>
                        </button>
                    </div>
                )}

                {/* Demo Users Section */}
                {users && users.length > 0 && (
                    <div className="user-menu-section">
                        <div className="demo-users-header">
                            {currentUser ? 'Switch User' : 'Select User'}
                        </div>
                        {users.map(user => (
                            <button
                                key={user.id}
                                className={`demo-user-item ${currentUser?.id === user.id ? 'active' : ''}`}
                                onClick={() => handleUserSelect(user)}
                            >
                                <div className="demo-user-avatar">
                                    {getInitials(user.name)}
                                </div>
                                <div className="demo-user-info">
                                    <div className="demo-user-name">{user.name}</div>
                                    <div className="demo-user-email">{user.email}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserMenu;
