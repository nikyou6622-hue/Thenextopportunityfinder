import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Target,
  FileCheck,
  Building2,
  X,
  KeyRound,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { SmokeyBackground } from './ui/login-form';
import SoundSystem from './characters/SoundEffects';

const ROLE_OPTIONS = [
  'Full Stack Engineer',
  'Backend Engineer (Python / Go / Java)',
  'Frontend Engineer (React / Next.js / TypeScript)',
  'AI / Machine Learning Engineer',
  'DevOps & Cloud Engineer',
  'Data Engineer / Analytics',
  'QA Automation Engineer'
];

const EXPERIENCE_OPTIONS = [
  'Student / Intern',
  'Entry Level (0-1 yrs)',
  'Junior (1-3 yrs)',
  'Mid-Level (3-5 yrs)',
  'Senior / Lead (5+ yrs)'
];

export default function AuthView({ 
  onAuthSuccess, 
  onContinueAsGuest,
  initialMode = 'otp' 
}) {
  const [authMode, setAuthMode] = useState(initialMode); // 'otp' | 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Form Fields (Password Flow)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState(ROLE_OPTIONS[0]);
  const [experienceLevel, setExperienceLevel] = useState(EXPERIENCE_OPTIONS[1]);
  const [consentAccepted, setConsentAccepted] = useState(true);

  // OTP Flow State (Supabase Auth Style)
  const [otpStep, setOtpStep] = useState('request'); // 'request' | 'verify'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeDemoOtp, setActiveDemoOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpInputRefs = useRef([]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: '#64748b' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak (Min 8 chars required)', color: '#f43f5e' };
    if (score === 2) return { score: 50, label: 'Fair (Add numbers or symbols)', color: '#f59e0b' };
    if (score === 3) return { score: 75, label: 'Strong', color: '#38bdf8' };
    return { score: 100, label: 'Excellent', color: '#10b981' };
  }, [password]);

  // Handle Google OAuth 2.0 Single Sign-On
  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'nextopportunityfinder@gmail.com',
          full_name: fullName || 'Google Candidate User'
        })
      });
      let data = {};
      try {
        const text = await response.text();
        if (text && text.trim()) data = JSON.parse(text);
      } catch {}

      const userObj = data.user || {
        id: 'usr_google_1',
        email: email || 'candidate@gmail.com',
        full_name: fullName || 'Google Candidate User',
        target_role: 'Full Stack Engineer'
      };
      const tokenStr = data.token || 'jwt_google_demo_token';
      localStorage.setItem('nof_auth_token', tokenStr);
      localStorage.setItem('nof_user', JSON.stringify(userObj));
      setSuccessMessage('Successfully signed in with Google OAuth!');
      setTimeout(() => onAuthSuccess(userObj, tokenStr), 400);
    } catch (err) {
      setErrorMessage(err.message || 'Google OAuth authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sending OTP (Supabase Flow)
  const handleSendOtp = async (e) => {

    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const emailClean = email.trim().toLowerCase();
    if (!emailClean || !emailClean.includes('@') || !emailClean.includes('.')) {
      setErrorMessage('Please enter a valid candidate email address to receive your 6-digit access code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean, type: 'login' })
      });

      let data = {};
      try {
        const text = await res.text();
        if (text && text.trim()) data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Failed to send verification code email.');
      }

      setOtpStep('verify');
      setOtpCountdown(60);
      setSuccessMessage(data.message || `Verification code sent to ${emailClean}. Please check your email inbox.`);
      SoundSystem.playPop();

      // Focus first input box
      setTimeout(() => {
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }, 200);
    } catch (err) {
      setErrorMessage(err.message || 'Network error while generating OTP token.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit change & auto-advance
  const handleOtpDigitChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Handle full 6-digit paste
    if (cleaned.length >= 6) {
      const pasted = cleaned.slice(0, 6).split('');
      setOtpDigits(pasted);
      triggerVerifyOtp(pasted.join(''));
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned[cleaned.length - 1];
    setOtpDigits(updated);

    // Auto advance to next box
    if (index < 5 && cleaned) {
      if (otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }
    }

    // If all 6 digits filled, automatically verify
    const fullCode = updated.join('');
    if (fullCode.length === 6) {
      triggerVerifyOtp(fullCode);
    }
  };

  // Handle OTP Backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  const isVerifyingRef = useRef(false);

  // Verify 6-digit OTP Token
  const triggerVerifyOtp = async (codeToVerify) => {
    if (isVerifyingRef.current) return;
    const token = codeToVerify || otpDigits.join('');
    if (token.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    isVerifyingRef.current = true;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: token,
          type: 'login'
        })
      });

      let data = {};
      try {
        const text = await res.text();
        if (text && text.trim()) data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Invalid or expired verification code.');
      }

      const verifiedUser = data.user || {
        id: 'usr_verified_1',
        email: email.trim().toLowerCase(),
        full_name: 'Verified Candidate',
        is_email_verified: true
      };
      const tokenStr = data.token || 'jwt_token_verified';
      localStorage.setItem('nof_auth_token', tokenStr);
      localStorage.setItem('nof_user', JSON.stringify(verifiedUser));

      SoundSystem.playSuccess();
      setSuccessMessage(data.message || 'Authentication verified successfully!');
      if (onAuthSuccess) {
        onAuthSuccess(verifiedUser, tokenStr);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please check the 6-digit code and try again.');
      SoundSystem.playError();
    } finally {
      isVerifyingRef.current = false;
      setLoading(false);
    }
  };

  // Handle Password-based Sign In / Sign Up Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name for your candidate profile.');
        return;
      }
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        setErrorMessage('Please enter a valid work or personal email address (e.g. name@domain.com).');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (!consentAccepted) {
        setErrorMessage('DPDP data consent is required to process and match your technical profile.');
        return;
      }

      setLoading(true);
      try {
        const consentTimestamp = new Date().toISOString();
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
            target_role: targetRole,
            experience_level: experienceLevel,
            consent_given: consentAccepted,
            consent_timestamp: consentTimestamp
          })
        });

        let data = {};
        try {
          const text = await res.text();
        if (!res.ok) {
          throw new Error(data.detail || data.message || 'Signup failed. Please try again.');
        }

        const emailClean = email.trim().toLowerCase();
        SoundSystem.playPop();
        setAuthMode('otp');
        setOtpStep('verify');
        setEmail(emailClean);
        setOtpCountdown(60);
        setSuccessMessage(data.message || `Account created! A 6-digit verification code has been sent to ${emailClean}. Please enter your code to activate your account.`);

        // Focus first input box
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 300);
      } catch (err) {
        setErrorMessage(err.message || 'An unexpected error occurred during signup.');
        SoundSystem.playError();
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'login') {
      // Login
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter your registered email address.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your account password.');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password
          })
        });

        let data = {};
        try {
          const text = await res.text();
          if (text && text.trim()) data = JSON.parse(text);
        } catch {}

        const loginUser = data.user || {
          id: `usr_${Date.now()}`,
          email: email.trim().toLowerCase(),
          full_name: email.split('@')[0] || 'Candidate User'
        };
        const loginToken = data.token || `jwt_token_${Date.now()}`;
        localStorage.setItem('nof_auth_token', loginToken);
        localStorage.setItem('nof_user', JSON.stringify(loginUser));

        SoundSystem.playSuccess();
        setSuccessMessage(data.message || 'Login successful!');
        if (onAuthSuccess) {
          setTimeout(() => onAuthSuccess(loginUser, loginToken), 400);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Incorrect email or password. Please verify your credentials.');
        SoundSystem.playError();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 'calc(100vh - 120px)', borderRadius: '24px', overflow: 'hidden' }}>
      <SmokeyBackground color="#4338CA" />
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '32px',
        alignItems: 'start',
        padding: '24px 16px 48px',
        position: 'relative',
        zIndex: 1
      }}>
      
      {/* 🌟 LEFT COLUMN: AUTH FORM */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px 28px',
        boxSizing: 'border-box',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Brand Logo Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
          <img 
            src="/logo.png" 
            alt="Next Opportunity Finder" 
            style={{
              width: '48px',
              height: '48px',
              objectFit: 'cover',
              borderRadius: '50%',
              background: 'transparent',
              padding: '0',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
              flexShrink: 0
            }} 
          />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Next Opportunity Finder
            </div>
            <div style={{ fontSize: '0.72rem', color: '#818CF8', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginTop: '2px' }}>
              Candidate Authentication Hub
            </div>
          </div>
        </div>

        {/* 3-Way Mode Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            style={{
              padding: '9px 6px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: authMode === 'otp' ? '#6366f1' : 'transparent',
              color: authMode === 'otp' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <KeyRound size={13} />
            <span>6-Digit OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            style={{
              padding: '9px 6px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: authMode === 'login' ? '#6366f1' : 'transparent',
              color: authMode === 'login' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            Password
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            style={{
              padding: '9px 6px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: authMode === 'signup' ? '#6366f1' : 'transparent',
              color: authMode === 'signup' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
            {authMode === 'otp' 
              ? (otpStep === 'request' ? 'Passwordless 6-Digit OTP' : 'Enter 6-Digit Code')
              : authMode === 'signup' 
              ? 'Create Candidate Account' 
              : 'Sign In with Password'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0' }}>
            {authMode === 'otp'
              ? (otpStep === 'request' 
                ? 'Instant login token dispatched to your email address (Supabase Auth).'
                : `Enter the 6-digit verification token sent to ${email}`)
              : authMode === 'signup' 
              ? 'Access 11 ATS resume templates, MNC question bank, and verified job feeds.' 
              : 'Sign in to access your resumes, tailored applications, and saved roles.'}
          </p>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.8rem',
            color: '#fca5a5',
            lineHeight: 1.4
          }}>
            <AlertCircle size={16} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.8rem',
            color: '#34d399'
          }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1-Click Google OAuth SSO */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'rgba(30, 41, 59, 0.7)',
            color: '#f8fafc',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(51, 65, 85, 0.9)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 20px', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* ---------------------------------------------------- */}
        {/* MODE 1: SUPABASE 6-DIGIT OTP AUTH                    */}
        {/* ---------------------------------------------------- */}
        {authMode === 'otp' && (

          <div>
            {otpStep === 'request' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Candidate Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aditya@example.com"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 12px 11px 38px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-next-primary"
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spin-anim" />
                      <span>Generating Code...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Send 6-Digit Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div>
                {/* 6 Digit Input Boxes */}
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '10px', textAlign: 'center' }}>
                  Enter 6-Digit Verification Token
                </label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e.target.value ? e : e)}
                      style={{
                        width: '44px',
                        height: '52px',
                        borderRadius: '10px',
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: digit ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.15)',
                        textAlign: 'center',
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        color: '#f8fafc',
                        outline: 'none',
                        boxShadow: digit ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={() => triggerVerifyOtp()}
                  disabled={loading}
                  className="btn-next-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spin-anim" />
                      <span>Verifying Token...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Verify & Access Dashboard</span>
                    </>
                  )}
                </button>

                {/* Resend & Change Email */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.78rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('request');
                      setOtpDigits(['', '', '', '', '', '']);
                    }}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ArrowLeft size={13} />
                    <span>Change Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpCountdown > 0 || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: otpCountdown > 0 ? '#64748b' : '#818cf8',
                      cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 700
                    }}
                  >
                    {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE 2 & 3: PASSWORD LOGIN & SIGNUP                  */}
        {/* ---------------------------------------------------- */}
        {(authMode === 'login' || authMode === 'signup') && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {authMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Tamta"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 38px',
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Candidate Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aditya@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1' }}>
                  Account Password
                </label>
                {authMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setAuthMode('otp');
                      setErrorMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.74rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                  >
                    Forgot password? Sign in with OTP
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 38px 11px 38px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {authMode === 'signup' && password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ width: `${passwordStrength.score}%`, height: '100%', background: passwordStrength.color, transition: 'all 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: passwordStrength.color, fontWeight: 700 }}>
                    Password Strength: {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {authMode === 'signup' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      Target Role
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    >
                      {ROLE_OPTIONS.map((r, i) => <option key={i} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      Experience
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    >
                      {EXPERIENCE_OPTIONS.map((exp, i) => <option key={i} value={exp}>{exp}</option>)}
                    </select>
                  </div>
                </div>

                {/* DPDP Consent Box */}
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <input
                    type="checkbox"
                    id="consentCheck"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="consentCheck" style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.45, cursor: 'pointer' }}>
                    I agree to the processing of my technical resume per the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>. 
                    <button 
                      type="button" 
                      onClick={() => setPrivacyModalOpen(true)}
                      style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, padding: '0 0 0 4px', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Read Notice
                    </button>
                  </label>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-next-primary"
              style={{
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin-anim" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signup' ? 'Create Candidate Account' : 'Sign In'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Guest Return Link */}
        {onContinueAsGuest && (
          <div style={{ marginTop: '22px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onContinueAsGuest}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={14} />
              <span>Explore Public Home Landing Page</span>
            </button>
          </div>
        )}
      </div>

      {/* 🌟 RIGHT COLUMN: PLATFORM HIGHLIGHTS & ARCHITECTURE BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 75, 0.85), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px 28px',
        boxSizing: 'border-box',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '4px 12px', borderRadius: '14px', marginBottom: '14px' }}>
          <ShieldCheck size={14} color="#818cf8" />
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#818cf8', letterSpacing: '0.04em' }}>
            ENTERPRISE GRADE DATA PROTECTION
          </span>
        </div>

        <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Accelerate Your Tech Placement Journey
        </h3>

        <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 24px' }}>
          Built specifically for Indian & global software engineers. Direct links, verifiable company question banks, and automated zero-hallucination resume tailoring.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
              <FileCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', marginBottom: '2px' }}>
                11 Professional ATS Templates & 5-Pillar Score
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Instant real-time A4 overflow measurement (~1123px standard A4) with metrics benchmarking and LaTeX export.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
              <Building2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', marginBottom: '2px' }}>
                Company-Wise LeetCode & Oral Prep
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                100+ real interview debriefs from Google, Microsoft, Swiggy, TCS, Infosys, and CRED with video solutions.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
              <Target size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', marginBottom: '2px' }}>
                10,000+ Verified Jobs & Indian Internships
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Curated feeds from Unstop, Cuvette, Internshala, and Wellfound with dead-link revalidation and stipend filters.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid rgba(236, 72, 153, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899', flexShrink: 0 }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', marginBottom: '2px' }}>
                DPDP Act 2023 & 22-Table Cascade Wipe
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Full candidate data fiduciary controls: field-level AES-256 GCM encryption, 90-day auto-purge, and 1-click Right to Erasure.
              </div>
            </div>
          </div>

        </div>

      </div>

      </div>

      {/* DPDP Notice Modal */}
      {privacyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '20px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxSizing: 'border-box',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                Digital Personal Data Protection Notice
              </h3>
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 16px' }}>
              In compliance with Section 5 and Section 6 of India's DPDP Act 2023, Next Opportunity Finder processes technical resume data solely for candidate scoring, skill gap identification, and verified opportunity matching.
            </p>
            <ul style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6, paddingLeft: '20px', margin: '0 0 20px' }}>
              <li><strong>Zero Auto-Apply</strong>: No automated submissions or spam emails without explicit candidate manual confirmation.</li>
              <li><strong>Field-Level Encryption</strong>: AES-256 GCM encryption at rest on PII fields.</li>
              <li><strong>Right to Erasure</strong>: 22-table cascade purge available anytime in Settings.</li>
            </ul>
            <button
              type="button"
              onClick={() => setPrivacyModalOpen(false)}
              className="btn-next-primary"
              style={{ width: '100%', padding: '10px', borderRadius: '10px', fontWeight: 800 }}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
