import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const Quiz = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionData, setQuestionData] = useState(null);
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completedAt, setCompletedAt] = useState(null);
    const [shake, setShake] = useState(false);
    const [isJigsawSolved, setIsJigsawSolved] = useState(false);

    const sessionToken = localStorage.getItem('hitnext_session');

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'JIGSAW_SOLVED') {
                setIsJigsawSolved(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const fetchQuestion = React.useCallback(async () => {
        if (!sessionToken) {
            navigate('/login');
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('get-question', {
                body: { sessionToken }
            });

            if (error) throw error;

            if (data.completed) {
                setIsCompleted(true);
                setCompletedAt(data.completedAt);
            } else if (data.success && data.question) {
                setQuestionData(data.question);
                setIsJigsawSolved(false);
            } else {
                throw new Error(data.error || 'Failed to fetch question');
            }
        } catch (err) {
            console.error(err);
            if (err.message.includes('Unauthorized') || err.message.includes('Invalid session')) {
                localStorage.removeItem('hitnext_session');
                navigate('/login');
            } else {
                setError('Failed to load question. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate, sessionToken]);

    useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    const handleSubmit = async (e, overrideAnswer) => {
        if (e) e.preventDefault();
        const submitValue = overrideAnswer || answer.trim();
        if (!submitValue) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const { data, error } = await supabase.functions.invoke('submit-answer', {
                body: { sessionToken, answer: submitValue }
            });

            if (error) throw error;

            if (data.isCorrect) {
                setAnswer('');
                if (data.completed) {
                    setIsCompleted(true);
                } else {
                    setIsLoading(true);
                    await fetchQuestion();
                }
            } else {
                setShake(true);
                setError('Incorrect answer. Try again!');
                setTimeout(() => setShake(false), 500);
            }
        } catch (err) {
            console.error(err);
            let errorMessage = 'Error submitting answer. Please try again.';
            if (err?.context) {
                try {
                    const errBody = await err.context.json();
                    if (errBody?.error) {
                        errorMessage = errBody.error;
                    }
                } catch {
                    // keep default fallback
                }
            }
            setShake(true);
            setError(errorMessage);
            setTimeout(() => setShake(false), 500);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <section className="hero">
                <div className="hero__bg" style={{ background: 'var(--dark)' }}></div>
                <Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--cream)' }}>
                    Loading your next challenge...
                </div>
            </section>
        );
    }

    if (isCompleted) {
        const timeString = completedAt ? new Date(completedAt).toLocaleString() : 'Loading...';
        return (
            <section style={{ height: '100vh', width: '100vw', background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '10vw', color: '#fff', margin: '0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>VICTORY</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Grotesk', fontSize: '18px', marginTop: '24px' }}>
                    Completed at: {timeString}
                </p>
            </section>
        );
    }

    const bgStyle = questionData?.options?.bg_image 
        ? { background: `url(${questionData.options.bg_image}) center/cover no-repeat` } 
        : { background: 'var(--dark)' };

    return (
        <section className="hero">
            <div className="hero__bg" style={{ ...bgStyle, filter: 'brightness(0.25)' }}></div>
            <Navbar />

            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: questionData?.options?.iframe_url ? 'column' : 'row', alignItems: questionData?.options?.iframe_url ? 'center' : 'flex-start', justifyContent: 'space-between', width: '100%', padding: '40px 8% 80px', minHeight: 'calc(100vh - 80px)', gap: '64px' }}>
                
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: questionData?.options?.iframe_url ? '100%' : '600px', width: questionData?.options?.iframe_url ? '100%' : 'auto', paddingTop: '40px', alignItems: questionData?.options?.iframe_url ? 'center' : 'flex-start', textAlign: questionData?.options?.iframe_url ? 'center' : 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '14px', fontWeight: 'bold' }}>Level</span>
                        <span style={{ fontFamily: 'Space Grotesk', fontSize: '32px', fontWeight: 'bold', color: 'var(--cream)' }}>{questionData?.question_number} / 11</span>
                    </div>

                    <div style={{ fontSize: '24px', lineHeight: '1.6', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', whiteSpace: 'pre-wrap' }}>
                        {questionData?.question_text}
                    </div>

                    {questionData?.options?.downloads && questionData.options.downloads.length > 0 && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {questionData.options.downloads.map((file, idx) => (
                                <a 
                                    key={idx} 
                                    href={`${file.url}?download`} 
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        transition: 'background 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    {file.name}
                                </a>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px', width: '100%', maxWidth: '600px' }}>
                        {!questionData?.options?.iframe_url ? (
                            <>
                                <input 
                                    type="text" 
                                    className="sleek-input"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Enter your answer..."
                                    disabled={isSubmitting}
                                    style={{
                                        borderBottomColor: error ? '#ff275e' : undefined,
                                        transform: shake ? 'translateX(5px)' : 'none'
                                    }}
                                />

                                {error && (
                                    <div style={{ color: '#ff275e', fontSize: '16px', fontWeight: '500' }}>
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <button type="submit" disabled={isSubmitting || !answer.trim()} className="cta">
                                        {isSubmitting ? 'Verifying...' : 'Submit Answer'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div>
                                {error && (
                                    <div style={{ color: '#ff275e', fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>
                                        {error}
                                    </div>
                                )}
                                <button 
                                    type="button" 
                                    onClick={() => handleSubmit(null, 'jigsaw_solved')} 
                                    disabled={!isJigsawSolved || isSubmitting} 
                                    className="cta"
                                    style={{
                                        opacity: (!isJigsawSolved || isSubmitting) ? 0.5 : 1,
                                        cursor: (!isJigsawSolved || isSubmitting) ? 'not-allowed' : 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    {isSubmitting ? 'Verifying...' : 'Proceed to Next Level'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {questionData?.options?.image_url && !questionData?.options?.iframe_url && (
                    <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', paddingTop: '40px' }}>
                        <img 
                            src={questionData.options.image_url} 
                            alt="Clue" 
                            style={{ 
                                maxWidth: '100%', 
                                objectFit: 'contain', 
                                borderRadius: '16px', 
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }} 
                        />
                    </div>
                )}
                {questionData?.options?.iframe_url && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '0px', height: '800px' }}>
                        <iframe 
                            src={questionData.options.iframe_url} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                border: 'none', 
                                borderRadius: '16px', 
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                background: 'transparent'
                            }} 
                            title="Puzzle"
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default Quiz;
