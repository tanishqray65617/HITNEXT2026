import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const Winners = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [winners, setWinners] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.functions.invoke('get-winners', {
                body: { password }
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error || 'Failed to fetch winners');

            setWinners(data.winners || []);
            setIsAuthenticated(true);
        } catch (err) {
            console.error(err);
            setError(err.message === 'Unauthorized access' ? 'Invalid organizer password.' : 'Failed to retrieve winners.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return 'Unknown';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <section className="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="hero__bg" style={{ background: 'var(--dark)' }}></div>
            <Navbar />

            <div className="hero__content" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '40px 24px', flex: 1 }}>
                
                {!isAuthenticated ? (
                    <form onSubmit={handleLogin} style={{
                        background: 'rgba(20, 20, 20, 0.7)',
                        backdropFilter: 'blur(16px)',
                        padding: '40px',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '400px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        alignSelf: 'center'
                    }}>
                        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', fontWeight: '500', margin: '0', textAlign: 'center', color: '#f0ebe3' }}>Organizer Access</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(240, 235, 227, 0.6)' }}>Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter passcode"
                                disabled={isLoading}
                                style={{
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    color: '#f0ebe3',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{ color: '#ff6b6b', fontSize: '14px', background: 'rgba(255, 107, 107, 0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading || !password} className="cta" style={{ width: '100%', justifyContent: 'center' }}>
                            {isLoading ? 'Verifying...' : 'Unlock Leaderboard'}
                        </button>
                    </form>
                ) : (
                    <div style={{
                        background: 'rgba(20, 20, 20, 0.7)',
                        backdropFilter: 'blur(16px)',
                        padding: '40px',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '800px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px'
                    }}>
                        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '32px', fontWeight: '500', margin: '0', color: '#4ade80', textAlign: 'center' }}>VICTORIOUS TEAMS</h2>
                        
                        {winners.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'rgba(240, 235, 227, 0.5)', padding: '40px 0' }}>
                                No teams have completed the grid yet.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {winners.map((team, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '24px',
                                        background: index === 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                                        border: index === 0 ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                                        borderRadius: '16px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                            <span style={{ fontFamily: 'Space Grotesk', fontSize: '24px', fontWeight: 'bold', color: index === 0 ? '#4ade80' : 'rgba(240, 235, 227, 0.4)' }}>
                                                #{index + 1}
                                            </span>
                                            <span style={{ fontSize: '20px', fontWeight: '500', color: index === 0 ? '#fff' : '#f0ebe3' }}>
                                                {team.team_name}
                                            </span>
                                        </div>
                                        <div style={{ color: 'rgba(240, 235, 227, 0.6)', fontFamily: 'monospace', fontSize: '16px' }}>
                                            {formatTime(team.completed_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Winners;
