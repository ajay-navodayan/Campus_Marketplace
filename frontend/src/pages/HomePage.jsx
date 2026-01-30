// HomePage - Redirects to Browse Items as primary screen
// Items should be visible immediately, no hero section

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to items page - this is the primary screen
        navigate('/items', { replace: true });
    }, [navigate]);

    return null;
}

export default HomePage;
