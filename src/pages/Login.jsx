import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const Login = () => {
    const [teamName, setTeamName] = useState('');
    const [teamCode, setTeamCode] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        if (!teamName.trim() || !teamCode.trim()) {
            setError('Please enter both team name and code.');
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('login-team', {
                body: { teamName, teamCode }
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error || 'Failed to login');

            // Save to localStorage securely
            localStorage.setItem('hitnext_session', data.sessionToken);
            localStorage.setItem('hitnext_team_id', data.teamId);

            // Redirect to quiz page
            navigate('/quiz');
        } catch (err) {
            setError(err.message === 'Invalid credentials' ? 'Incorrect team name or code.' : 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="hero">
            <div className="hero__bg" style={{ background: 'url(/loginimg.jpg) center/cover no-repeat' }}></div>
            <Navbar />

            <div className="hero__content" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%', padding: '0 8% 0 150px', height: 'calc(100vh - 80px)' }}>
                <form onSubmit={handleLogin} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    padding: '36px',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '360px',
                    border: 'none',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '32px', fontWeight: '500', margin: '0', color: '#f0ebe3' }}>LOGIN HERE</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(240, 235, 227, 0.6)' }}>Team Name</label>
                        <input 
                            type="text" 
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Byte Busters"
                            disabled={isLoading}
                            style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: 'none',
                                padding: '16px',
                                borderRadius: '12px',
                                color: '#f0ebe3',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'background 0.3s'
                            }}
                            onFocus={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                            onBlur={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.3)'}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(240, 235, 227, 0.6)' }}>6-Digit Code</label>
                        <input 
                            type="text" 
                            value={teamCode}
                            onChange={(e) => setTeamCode(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                            disabled={isLoading}
                            style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: 'none',
                                padding: '16px',
                                borderRadius: '12px',
                                color: '#f0ebe3',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'background 0.3s'
                            }}
                            onFocus={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                            onBlur={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.3)'}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#ff6b6b', fontSize: '14px', background: 'rgba(255, 107, 107, 0.1)', padding: '12px', borderRadius: '8px' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="cta" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                        {isLoading ? 'Authenticating...' : 'Enter the Grid'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Login;
