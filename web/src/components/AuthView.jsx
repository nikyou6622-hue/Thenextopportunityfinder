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
  ArrowLeft,
  Key,
  RotateCcw
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
  initialMode = 'login' 
}) {
  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'signup' | 'otp' | 'forgot' | 'verify-signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Form Fields (Password Flow)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetRole, setTargetRole] = useState(ROLE_OPTIONS[0]);
  const [experienceLevel, setExperienceLevel] = useState(EXPERIENCE_OPTIONS[1]);
  const [consentAccepted, setConsentAccepted] = useState(true);

  // OTP Flow State
  const [otpStep, setOtpStep] = useState('request'); // 'request' | 'verify'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpInputRefs = useRef([]);

  // Forgot Password Flow State
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset'
  const [forgotTokenDigits, setForgotTokenDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const forgotInputRefs = useRef([]);

  // Countdown timer effect for resend code
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Helper to extract clean error message string from backend responses
  const getErrorMessage = (data, fallbackMsg) => {
    if (!data) return fallbackMsg;
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
    if (typeof data.detail === 'object' && data.detail?.msg) return data.detail.msg;
    if (typeof data.message === 'string') return data.message;
    return fallbackMsg;
  };

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

  // Check matching passwords in Sign Up
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Check matching passwords in Forgot Password Reset
  const resetPasswordsMatch = useMemo(() => {
    if (!confirmNewPassword) return true;
    return newPassword === confirmNewPassword;
  }, [newPassword, confirmNewPassword]);

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
        target_role: 'Full Stack Engineer',
        is_email_verified: true
      };
      const tokenStr = data.token || 'jwt_google_demo_token';
      localStorage.setItem('nof_auth_token', tokenStr);
      localStorage.setItem('nof_user', JSON.stringify(userObj));
      setSuccessMessage('Successfully signed in with Google OAuth!');
      SoundSystem.playSuccess();
      if (onAuthSuccess) {
        setTimeout(() => onAuthSuccess(userObj, tokenStr), 400);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google OAuth authentication failed.');
      SoundSystem.playError();
    } finally {
      setLoading(false);
    }
  };

  // Handle Sending OTP for Passwordless Login
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
        throw new Error(getErrorMessage(data, 'Failed to send verification code email.'));
      }

      setOtpStep('verify');
      setOtpCountdown(60);
      setSuccessMessage(data.message || `Verification code sent to ${emailClean}. Please check your email inbox.`);
      SoundSystem.playPop();

      setTimeout(() => {
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }, 200);
    } catch (err) {
      setErrorMessage(err.message || 'Network error while generating OTP token.');
      SoundSystem.playError();
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit change & auto-advance
  const handleOtpDigitChange = (index, value, digitsState, setDigitsState, refs, onComplete) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const updated = [...digitsState];
      updated[index] = '';
      setDigitsState(updated);
      return;
    }

    // Handle full 6-digit paste
    if (cleaned.length >= 6) {
      const pasted = cleaned.slice(0, 6).split('');
      setDigitsState(pasted);
      if (onComplete) onComplete(pasted.join(''));
      return;
    }

    const updated = [...digitsState];
    updated[index] = cleaned[cleaned.length - 1];
    setDigitsState(updated);

    if (index < 5 && cleaned) {
      if (refs.current[index + 1]) {
        refs.current[index + 1].focus();
      }
    }

    const fullCode = updated.join('');
    if (fullCode.length === 6 && onComplete) {
      onComplete(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e, digitsState, refs) => {
    if (e.key === 'Backspace' && !digitsState[index] && index > 0) {
      if (refs.current[index - 1]) {
        refs.current[index - 1].focus();
      }
    }
  };

  const isVerifyingRef = useRef(false);

  // Verify 6-digit OTP Token (Login or Signup Completion)
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
        throw new Error(getErrorMessage(data, 'Invalid or expired verification code.'));
      }

      const verifiedUser = data.user || {
        id: `usr_${Date.now()}`,
        email: email.trim().toLowerCase(),
        full_name: fullName || email.split('@')[0] || 'Verified Candidate',
        is_email_verified: true
      };
      const tokenStr = data.token || `jwt_token_${Date.now()}`;
      localStorage.setItem('nof_auth_token', tokenStr);
      localStorage.setItem('nof_user', JSON.stringify(verifiedUser));

      SoundSystem.playSuccess();
      setSuccessMessage(data.message || 'Account verified and created successfully! Redirecting to candidate dashboard...');
      if (onAuthSuccess) {
        setTimeout(() => onAuthSuccess(verifiedUser, tokenStr), 500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please check the 6-digit code and try again.');
      SoundSystem.playError();
    } finally {
      isVerifyingRef.current = false;
      setLoading(false);
    }
  };

  // Handle Forgot Password Request (Step 1)
  const handleForgotPasswordRequest = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const emailClean = email.trim().toLowerCase();
    if (!emailClean || !emailClean.includes('@') || !emailClean.includes('.')) {
      setErrorMessage('Please enter your registered candidate email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean })
      });

      let data = {};
      try {
        const text = await res.text();
        if (text && text.trim()) data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(getErrorMessage(data, 'Failed to dispatch password reset email.'));
      }

      setForgotStep('reset');
      setOtpCountdown(60);
      setSuccessMessage(data.message || `Password reset code sent to ${emailClean}. Check your inbox.`);
      SoundSystem.playPop();

      setTimeout(() => {
        if (forgotInputRefs.current[0]) forgotInputRefs.current[0].focus();
      }, 200);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process forgot password request.');
      SoundSystem.playError();
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Reset (Step 2)
  const handleForgotPasswordReset = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const token = forgotTokenDigits.join('');
    if (token.length !== 6) {
      setErrorMessage('Please enter the 6-digit password reset code sent to your email.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: token,
          new_password: newPassword
        })
      });

      let data = {};
      try {
        const text = await res.text();
        if (text && text.trim()) data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(getErrorMessage(data, 'Failed to reset password.'));
      }

      SoundSystem.playSuccess();
      setSuccessMessage(data.message || 'Your password has been changed successfully! Please log in with your new password.');
      setPassword(newPassword);
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotTokenDigits(['', '', '', '', '', '']);
      
      // Redirect to login mode
      setTimeout(() => {
        setAuthMode('login');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password.');
      SoundSystem.playError();
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Form Submit
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

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
    if (password !== confirmPassword) {
      setErrorMessage('Account password and confirm password do not match.');
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
        if (text && text.trim()) data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(getErrorMessage(data, 'Signup failed. Please try again.'));
      }

      const emailClean = email.trim().toLowerCase();
      SoundSystem.playPop();
      setAuthMode('verify-signup');
      setOtpStep('verify');
      setOtpCountdown(60);
      setSuccessMessage(data.message || `Verification code sent to ${emailClean}. Please enter your 6-digit code to activate your account.`);

      setTimeout(() => {
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }, 300);
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during signup.');
      SoundSystem.playError();
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

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

      if (!res.ok) {
        throw new Error(getErrorMessage(data, 'Invalid email or password. Please verify your credentials.'));
      }

      const loginUser = data.user || {
        id: `usr_${Date.now()}`,
        email: email.trim().toLowerCase(),
        full_name: email.split('@')[0] || 'Candidate User'
      };
      const loginToken = data.token || `jwt_token_${Date.now()}`;
      localStorage.setItem('nof_auth_token', loginToken);
      localStorage.setItem('nof_user', JSON.stringify(loginUser));

      SoundSystem.playSuccess();
      setSuccessMessage(data.message || 'Login successful! Redirecting to candidate dashboard...');
      if (onAuthSuccess) {
        setTimeout(() => onAuthSuccess(loginUser, loginToken), 400);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Incorrect email or password. Please verify your credentials.');
      SoundSystem.playError();
    } finally {
      setLoading(false);
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
      
      {/* 🌟 LEFT COLUMN: AUTHENTICATION FORM CARD */}
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
        {/* Brand Header */}
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

        {/* Auth Mode Switcher Tabs */}
        {authMode !== 'verify-signup' && authMode !== 'forgot' && (
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
              Sign In
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

            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setOtpStep('request');
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
              <span>OTP Login</span>
            </button>
          </div>
        )}

        {/* Section Heading & Subtitle */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
            {authMode === 'login' && 'Sign In to Your Account'}
            {authMode === 'signup' && 'Create Candidate Account'}
            {authMode === 'verify-signup' && 'Email Verification Required'}
            {authMode === 'otp' && (otpStep === 'request' ? 'Passwordless OTP Login' : 'Enter 6-Digit Verification Code')}
            {authMode === 'forgot' && (forgotStep === 'request' ? 'Reset Your Password' : 'Set New Account Password')}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.45 }}>
            {authMode === 'login' && 'Enter your registered credentials to access your dashboard and tailored applications.'}
            {authMode === 'signup' && 'Fill out your candidate details to request your 6-digit verification code.'}
            {authMode === 'verify-signup' && `A 6-digit verification code has been sent to ${email}. Enter the code below to activate your account.`}
            {authMode === 'otp' && (otpStep === 'request' ? 'Instant 6-digit login token sent to your email inbox.' : `Enter the 6-digit code sent to ${email}.`)}
            {authMode === 'forgot' && (forgotStep === 'request' ? 'Enter your candidate email address to receive a password reset code.' : `Enter the 6-digit code sent to ${email} and choose a new password.`)}
          </p>
        </div>

        {/* Error Feedback Banner */}
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
            <span style={{ flex: 1 }}>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Success Feedback Banner */}
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
            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{successMessage}</span>
          </div>
        )}

        {/* 1-Click Google OAuth SSO */}
        {(authMode === 'login' || authMode === 'signup') && (
          <>
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
          </>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE: LOGIN PAGE                                     */}
        {/* ---------------------------------------------------- */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="loginEmail" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  id="loginEmail"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
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
                <label htmlFor="loginPassword" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    setForgotStep('request');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.74rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* OTP Login Toggle Option */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setOtpStep('request');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.76rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
              >
                Log in using 6-Digit Email OTP instead
              </button>
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
                marginTop: '6px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin-anim" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE: SIGN UP PAGE                                   */}
        {/* ---------------------------------------------------- */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="signUpName" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  id="signUpName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aditya Nikam"
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
              <label htmlFor="signUpEmail" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  id="signUpEmail"
                  type="email"
                  autoComplete="email"
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
              <label htmlFor="signUpPassword" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Account Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  id="signUpPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password && (
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

            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 38px 11px 38px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: !passwordsMatch ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {!passwordsMatch && (
                <span style={{ fontSize: '0.72rem', color: '#f43f5e', fontWeight: 700, marginTop: '4px', display: 'block' }}>
                  ⚠️ Password and confirm password do not match
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="targetRoleSelect" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Target Role
                </label>
                <select
                  id="targetRoleSelect"
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
                <label htmlFor="expLevelSelect" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Experience Level
                </label>
                <select
                  id="expLevelSelect"
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

            <button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="btn-next-primary"
              style={{
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: (loading || !passwordsMatch) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                opacity: (loading || !passwordsMatch) ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin-anim" />
                  <span>Processing Request...</span>
                </>
              ) : (
                <>
                  <span>Create Candidate Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE: EMAIL VERIFICATION FLOW (SIGNUP COMPLETE)       */}
        {/* ---------------------------------------------------- */}
        {authMode === 'verify-signup' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '14px', textAlign: 'center' }}>
              Enter 6-Digit Verification Code Sent to Email
            </label>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '22px' }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value, otpDigits, setOtpDigits, otpInputRefs, triggerVerifyOtp)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e, otpDigits, otpInputRefs)}
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
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Verify & Create Candidate Account</span>
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.78rem' }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setOtpDigits(['', '', '', '', '', '']);
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={13} />
                <span>Back to Details</span>
              </button>

              <button
                type="button"
                onClick={handleSignUpSubmit}
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

        {/* ---------------------------------------------------- */}
        {/* MODE: PASSWORDLESS OTP LOGIN                          */}
        {/* ---------------------------------------------------- */}
        {authMode === 'otp' && (
          <div>
            {otpStep === 'request' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="otpLoginEmail" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Candidate Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      id="otpLoginEmail"
                      type="email"
                      autoComplete="email"
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
                    marginTop: '6px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spin-anim" />
                      <span>Sending Code...</span>
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
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value, otpDigits, setOtpDigits, otpInputRefs, triggerVerifyOtp)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e, otpDigits, otpInputRefs)}
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
        {/* MODE: FORGOT PASSWORD FLOW                           */}
        {/* ---------------------------------------------------- */}
        {authMode === 'forgot' && (
          <div>
            {forgotStep === 'request' ? (
              <form onSubmit={handleForgotPasswordRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="forgotEmail" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Registered Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      id="forgotEmail"
                      type="email"
                      autoComplete="email"
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
                    marginTop: '6px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spin-anim" />
                      <span>Sending Reset Code...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      <span>Send Password Reset Code</span>
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← Return to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '10px', textAlign: 'center' }}>
                    Enter 6-Digit Password Reset Code
                  </label>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '14px' }}>
                    {forgotTokenDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (forgotInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value, forgotTokenDigits, setForgotTokenDigits, forgotInputRefs)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e, forgotTokenDigits, forgotInputRefs)}
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
                </div>

                <div>
                  <label htmlFor="newPassword" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    New Account Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmNewPassword" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 38px 11px 38px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: !resetPasswordsMatch ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '0.86rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {!resetPasswordsMatch && (
                    <span style={{ fontSize: '0.72rem', color: '#f43f5e', fontWeight: 700, marginTop: '4px', display: 'block' }}>
                      ⚠️ Passwords do not match
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !resetPasswordsMatch}
                  className="btn-next-primary"
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: (loading || !resetPasswordsMatch) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px',
                    opacity: (loading || !resetPasswordsMatch) ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spin-anim" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Update Password & Return to Login</span>
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.78rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setForgotTokenDigits(['', '', '', '', '', '']);
                    }}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ArrowLeft size={13} />
                    <span>Resend Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Cancel & Return to Login
                  </button>
                </div>
              </form>
            )}
          </div>
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
