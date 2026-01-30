// Header component - Clean, functional navigation

import { Link, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';
import './Header.css';

function Header({ currentUser, users, onUserChange }) {
    const location = useLocation();

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    Campus Marketplace
                </Link>

                <nav className="nav">
                    <Link
                        to="/items"
                        className={`nav-link ${location.pathname === '/items' ? 'active' : ''}`}
                    >
                        Browse Items
                    </Link>
                    <Link
                        to="/items/new"
                        className={`nav-link ${location.pathname === '/items/new' ? 'active' : ''}`}
                    >
                        List Item
                    </Link>
                    <Link
                        to="/my-items"
                        className={`nav-link ${location.pathname === '/my-items' ? 'active' : ''}`}
                    >
                        My Items
                    </Link>
                    <Link
                        to="/my-reservations"
                        className={`nav-link ${location.pathname === '/my-reservations' ? 'active' : ''}`}
                    >
                        My Reservations
                    </Link>
                </nav>

                <UserMenu
                    currentUser={currentUser}
                    users={users}
                    onUserChange={onUserChange}
                />
            </div>
        </header>
    );
}

export default Header;
