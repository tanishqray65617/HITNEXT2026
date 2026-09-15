import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="nav">
            <Link to="/">
                <img src="/logo.png" alt="Logo" className="nav__logo" />
            </Link>
        </nav>
    );
};

export default Navbar;
