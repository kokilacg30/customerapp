import React, { useEffect, useState } from 'react';
import { ArrowRight, Leaf, Zap, MapPin, ShieldCheck, Download, Smartphone } from 'lucide-react';
import './index.css';

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [carbonCount, setCarbonCount] = useState(10432);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate live carbon counter
  useEffect(() => {
    const interval = setInterval(() => {
      setCarbonCount(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className={`glass fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 border-b border-[#2A2A2A]' : 'py-6 border-b-0'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 5%' }}>
        <div style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Leaf color="#C7F432" size={28} />
          <span>TakeMy<span className="text-neon">Trash</span></span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600' }}>How it Works</a>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600' }}>Features</a>
          <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px', animation: 'none' }}>
            Get the App <Download size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 5%', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px', background: 'rgba(199, 244, 50, 0.15)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', zIndex: 1, width: '100%', marginTop: '80px' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '8px 16px', border: '1px solid var(--neon-green)', borderRadius: '100px', color: 'var(--neon-green)', fontWeight: '700', fontSize: '12px', marginBottom: '24px', letterSpacing: '1px' }}>
              THE FUTURE OF WASTE MANAGEMENT
            </div>
            <h1 className="text-gradient" style={{ fontSize: '72px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px' }}>
              We Turn Your Trash Into <span className="text-neon">Tomorrow.</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '40px', maxWidth: '500px' }}>
              The ultra-premium, AI-powered platform to schedule, track, and recycle your waste seamlessly. Join the green revolution today.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-primary">
                Download for iOS <ArrowRight size={20} />
              </button>
              <button className="btn-primary" style={{ background: 'var(--surface-dark)', color: 'white', border: '1px solid var(--border)', animation: 'none' }}>
                Download for Android
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* 3D Floating Mockup Placeholder */}
            <div className="float-animation" style={{ width: '320px', height: '640px', background: 'linear-gradient(180deg, #141414 0%, #0A0A0A 100%)', borderRadius: '40px', border: '8px solid #2A2A2A', boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px var(--neon-green-glow)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <Smartphone size={80} color="var(--neon-green)" style={{ marginBottom: '24px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: '800', textAlign: 'center', marginBottom: '16px' }}>TakeMyTrash<br/>Mobile App</h3>
                <div style={{ width: '100%', height: '8px', background: '#2A2A2A', borderRadius: '4px', marginBottom: '16px' }}>
                  <div style={{ width: '60%', height: '100%', background: 'var(--neon-green)', borderRadius: '4px' }}></div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>Real-time Tracking & Seamless Bookings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carbon Counter Section */}
      <section style={{ padding: '80px 5%', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Global Impact</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Live tracker of waste recycled by our community.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="text-neon" style={{ fontSize: '64px', fontWeight: '800', letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums' }}>
            {carbonCount.toLocaleString()} <span style={{ fontSize: '24px', color: 'var(--text-primary)' }}>KG</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>Carbon Offset Achieved</p>
        </div>
      </section>

      {/* Glassmorphic Features Bento Grid */}
      <section id="features" style={{ padding: '120px 5%', position: 'relative' }}>
        <div style={{ position: 'absolute', right: '0%', top: '30%', width: '500px', height: '500px', background: 'rgba(199, 244, 50, 0.08)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }}></div>
        
        <div style={{ textAlign: 'center', marginBottom: '80px', position: 'relative', zIndex: 1 }}>
          <h2 className="text-gradient" style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px' }}>Engineered for Perfection.</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>We rebuilt waste management from the ground up using industry-leading technology.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', position: 'relative', zIndex: 1 }}>
          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            <Zap color="var(--neon-green)" size={32} style={{ marginBottom: '24px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Lightning Fast Pickups</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Our routing algorithms dispatch the nearest truck to your location in milliseconds. Experience immediate pickups with Uber-style real-time tracking.</p>
          </div>
          
          <div className="glass-card">
            <ShieldCheck color="var(--neon-green)" size={32} style={{ marginBottom: '24px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Biometric Secure</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>FaceID and TouchID integrated directly into the app for frictionless, secure access.</p>
          </div>

          <div className="glass-card">
            <Leaf color="var(--neon-green)" size={32} style={{ marginBottom: '24px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Green Rewards</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Earn points for every KG you recycle. Grow your digital carbon forest.</p>
          </div>

          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            <MapPin color="var(--neon-green)" size={32} style={{ marginBottom: '24px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Contextual Color Morphing UI</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>The app chemically reacts to your actions. Select Electronic Waste and watch the entire interface morph to Neon Cyan. It's a living, breathing design system.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 5%', borderTop: '1px solid var(--border)', background: '#050505', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Leaf color="#C7F432" size={24} />
          <span>TakeMy<span className="text-neon">Trash</span></span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          © 2026 TakeMyTrash Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
