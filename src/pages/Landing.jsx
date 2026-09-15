import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Landing = () => {
    const bgRef = useRef(null);

    useEffect(() => {
        let ticking = false;

        const handleMouseMove = (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const x = (e.clientX / window.innerWidth - 0.5) * 8;
                    const y = (e.clientY / window.innerHeight - 0.5) * 8;
                    if (bgRef.current) {
                        bgRef.current.style.transform = `scale(1.02) translate(${x}px, ${y}px)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <section className="hero">
            <div className="hero__bg" ref={bgRef}>
                <video autoPlay loop muted playsInline className="hero__video">
                    <source src="/hero-vid.mp4" type="video/mp4" />
                </video>
            </div>

            <Navbar />

            <div className="hero__content">
                <div className="title-block">
                    <h1 className="title">HITNEXT</h1>
                    <span className="title__star">&#10033;</span>
                </div>

                <div className="desc-block">
                    <p className="desc">
                        HITNEXT is a challenging 11-level quiz game organized by GDGC NMIMS Indore. Solve each question to
                        unlock the next level and test your limits!
                    </p>
                </div>

                <div className="cta-block">
                    <Link to="/login" className="cta">
                        Continue to the game
                        <span className="cta__arrow">&#8594;</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Landing;
