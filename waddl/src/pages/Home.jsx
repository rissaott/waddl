import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="app home">
      <header className="header">
        <div className="nav-container">
          <div className="logo-section">
            <div className="duck-logo">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Body */}
                <circle className="duck-body" cx="50" cy="50" r="40" fill="#FFE66D"/>
                {/* Wing */}
                <path className="duck-wing" d="M30 50C30 50 25 60 35 65C45 70 50 60 50 60" stroke="#FFD23F" strokeWidth="4" strokeLinecap="round"/>
                {/* Head */}
                <circle cx="70" cy="40" r="20" fill="#FFE66D"/>
                {/* Eye */}
                <circle className="duck-eye" cx="75" cy="35" r="4" fill="#333"/>
                {/* Beak */}
                <path d="M85 45C85 45 95 45 95 50C95 55 85 55 85 55" fill="#FF9A3C"/>
              </svg>
            </div>
            <h1 className="logo">waddl</h1>
          </div>
          <div className="nav-right">
            <button className="nav-button login-button">Log In</button>
            <button className="nav-button signup-button" onClick={() => navigate('/edit')}>Sign Up</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <div className="hero-left">
            <h2>VISUALIZE YOUR CODE JOURNEY</h2>
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-plus">+</span>
                <p>Get interactive visualizations for Python concepts</p>
              </div>
              <div className="feature-item">
                <span className="feature-plus">+</span>
                <p>Learn programming fundamentals with real-time feedback</p>
              </div>
              <div className="feature-item">
                <span className="feature-plus">+</span>
                <p>Practice with step-by-step visual walkthroughs</p>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="signup-form">
              <h3>Start learning to code for free</h3>
              <form>
                <div className="form-group">
                  <label>Email<span className="required">*</span></label>
                  <input type="email" placeholder="Enter your email" required />
                </div>
                <div className="form-group">
                  <label>Password<span className="required">*</span></label>
                  <input type="password" placeholder="Create a password" required />
                </div>
                <button className="cta-button" onClick={() => navigate('/edit')}>
                  Get Started
                </button>
                <div className="social-signup">
                  <p>Or sign up using:</p>
                  <div className="social-buttons">
                    <button className="social-button google">
                      <img src="/google-icon.svg" alt="Google" />
                    </button>
                    <button className="social-button github">
                      <img src="/github-icon.svg" alt="GitHub" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home; 