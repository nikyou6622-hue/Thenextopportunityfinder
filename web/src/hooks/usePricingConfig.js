import { useState, useEffect } from 'react';
import apiFetch from '../lib/apiClient';

const DEFAULT_PRICING = {
  promo_price: 79,
  standard_price: 699,
  current_price: 79,
  is_promo_active: true,
  promo_expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  currency: 'INR',
  formatted_price: '₹79',
  formatted_standard: '₹699',
  headline: 'Lock in ₹79 before it becomes ₹699.',
  subheadline: 'Company-specific questions, unlimited tailored resumes, voice AI mock interviews — all unlocked. Your ATS score stays free, always. Early price ends soon.',
  cta_text: 'Unlock Pro — ₹79 (price rises to ₹699 soon)'
};

export function usePricingConfig() {
  const [config, setConfig] = useState(DEFAULT_PRICING);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false, formatted: '' });

  useEffect(() => {
    let isMounted = true;
    const fetchPricing = async () => {
      try {
        const res = await apiFetch('/api/pricing/config');
        if (res && res.ok) {
          const data = await res.json();
          if (data && isMounted) {
            setConfig(data);
          }
        }
      } catch (err) {
        console.warn('Could not load server pricing config, using default launch promo:', err);
      }
    };
    fetchPricing();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!config.promo_expires_at) return;

    const updateCountdown = () => {
      const targetTime = new Date(config.promo_expires_at).getTime();
      const now = Date.now();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          formatted: 'Promo expired'
        });
      } else {
        const totalSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        setTimeLeft({
          hours,
          minutes,
          seconds,
          isExpired: false,
          formatted: `${hours}h ${minutes}m ${seconds}s`
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [config.promo_expires_at]);

  const isPromoActive = config.is_promo_active && !timeLeft.isExpired;
  const currentPrice = isPromoActive ? config.promo_price : config.standard_price;
  const formattedPrice = `₹${currentPrice}`;
  const formattedStandard = `₹${config.standard_price}`;

  return {
    promoPrice: config.promo_price,
    standardPrice: config.standard_price,
    currentPrice,
    formattedPrice,
    formattedStandard,
    isPromoActive,
    promoExpiresAt: config.promo_expires_at,
    timeLeft,
    countdownText: isPromoActive ? (timeLeft.hours > 0 ? `${timeLeft.hours}h ${timeLeft.minutes}m` : `${timeLeft.minutes}m ${timeLeft.seconds}s`) : '',
    headline: config.headline || 'Lock in ₹79 before it becomes ₹699.',
    subheadline: config.subheadline || 'Company-specific questions, unlimited tailored resumes, voice AI mock interviews — all unlocked. Your ATS score stays free, always. Early price ends soon.',
    ctaText: isPromoActive ? `Unlock Pro — ${formattedPrice} (price rises to ₹699 soon)` : `Unlock Pro — ${formattedPrice}`
  };
}

export default usePricingConfig;
