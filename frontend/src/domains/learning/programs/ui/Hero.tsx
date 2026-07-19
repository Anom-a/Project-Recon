import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Globe, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';

import untitledLogo from '@/assets/logo.svg';
import sliderImg1 from '@/assets/slider/faj.jpg';
import sliderImg2 from '@/assets/slider/photo_2026-06-15_14-40-10.jpg';
import sliderImg3 from '@/assets/slider/photo_2026-06-15_18-51-59.jpg';
import sliderImg4 from '@/assets/slider/photo_2026-06-15_18-52-03.jpg';
import sliderImg5 from '@/assets/slider/photo_2026-06-15_18-52-07.jpg';
import sliderImg6 from '@/assets/slider/photo_2026-06-15_18-52-11.jpg';
import sliderImg7 from '@/assets/slider/photo_2026-06-15_18-52-21.jpg';
import sliderImg8 from '@/assets/slider/photo_2026-06-15_18-52-25.jpg';

import { cmsPublicApi, type HeroBannerResponse, type HomepageStats } from '../../../cms/public/api/cmsPublicApi';

const SLIDER_IMAGES = [
  sliderImg1, sliderImg2, sliderImg3, sliderImg4,
  sliderImg5, sliderImg6, sliderImg7, sliderImg8,
];

const SLIDE_DURATION = 6000;

const HERO_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  width: 2 + ((i * 7) % 4),
  left: (i * 28 + 11) % 100,
  top: (i * 37 + 17) % 100,
  drift: i % 2 === 0 ? 12 : -12,
  duration: 5 + (i % 4),
  delay: (i % 5) * 0.6,
  color: i % 2 === 0 ? 'rgba(37,99,235,0.25)' : 'rgba(87,223,254,0.2)',
}));

const trustItems = ['Competitions', 'STEM Labs', 'STEM Kits', 'Awards'];

const STAT_ACCENTS = [
  'from-blue-300 to-blue-400',
  'from-cyan-300 to-cyan-400',
  'from-indigo-300 to-indigo-400',
];

export function formatStatCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 10 || Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M+`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${k >= 10 || Number.isInteger(k) ? k.toFixed(0) : k.toFixed(1)}K+`;
  }
  return `${n}+`;
}

function formatInt(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString() : '0';
}

interface HeroProps {
  onDiscoverPrograms: () => void;
  onJoinCommunity: () => void;
  onShopStore?: () => void;
  homepageStats?: HomepageStats | null;
  statsLoading?: boolean;
}

export default function Hero({
  onDiscoverPrograms,
  onJoinCommunity,
  onShopStore,
  homepageStats = null,
  statsLoading = false,
}: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [banners, setBanners] = useState<HeroBannerResponse[]>([]);
  const [activeImages, setActiveImages] = useState<string[]>(SLIDER_IMAGES);
  const [stats, setStats] = useState<HomepageStats | null>(homepageStats);
  const [loadingStats, setLoadingStats] = useState(homepageStats == null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (homepageStats != null) {
      setStats(homepageStats);
      setLoadingStats(!!statsLoading);
    }
  }, [homepageStats, statsLoading]);

  useEffect(() => {
    if (homepageStats != null) return;
    const abort = new AbortController();
    setLoadingStats(true);
    cmsPublicApi.getHomepageStats(abort.signal)
      .then(data => setStats(data))
      .catch(err => { if (err.name !== 'AbortError') setStats(null); })
      .finally(() => setLoadingStats(false));
    return () => abort.abort();
  }, [homepageStats]);

  useEffect(() => {
    const abort = new AbortController();
    cmsPublicApi.getHeroBanners(abort.signal).then((data) => {
      if (data && data.length > 0) {
        setBanners(data);
        setActiveImages(data.map((b, i) => b.image || SLIDER_IMAGES[i % SLIDER_IMAGES.length]));
      }
    }).catch(err => { if (err.name !== 'AbortError') console.error(err); });
    return () => abort.abort();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeImages.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [activeImages.length]);

  const displayStats = [
    { value: loadingStats && !stats ? '…' : formatStatCount(stats?.future_engineers ?? 0), label: 'Future Engineers', accent: STAT_ACCENTS[0] },
    { value: loadingStats && !stats ? '…' : formatStatCount(stats?.programs ?? 0), label: 'Programs', accent: STAT_ACCENTS[1] },
    { value: loadingStats && !stats ? '…' : formatStatCount(stats?.competitions ?? 0), label: 'Competitions', accent: STAT_ACCENTS[2] },
  ];
  const missionPct = Math.min(100, Math.max(0, stats?.mission?.percentage ?? 0));
  const missionCurrent = stats?.mission?.current ?? 0;
  const missionTarget = stats?.mission?.target ?? 0;

  return (
    <section
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
      id="hero-banner"
    >
      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentSlide}
            src={activeImages[currentSlide]}
            alt={banners[currentSlide]?.title || "Ethio Robotics community and competition moments"}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center top' }}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* Desktop: left-to-right scrim — dark behind text column, fades right */}
        <div className="hidden lg:block absolute inset-0 z-[1] bg-gradient-to-r from-[#0B1220]/90 via-[#0B1220]/55 to-transparent" />

        {/* Desktop: bottom scrim — dark behind stat cards + progress bar */}
        <div className="hidden lg:block absolute inset-x-0 bottom-0 h-[35%] z-[1] bg-gradient-to-t from-[#0B1220]/85 to-transparent" />

        {/* Mobile: single bottom-anchored scrim covering bottom 70% */}
        <div className="block lg:hidden absolute inset-x-0 bottom-0 h-[70%] z-[1] bg-gradient-to-t from-[#0B1220]/90 to-transparent" />

        <div
          className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
          {HERO_PARTICLES.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${particle.width}px`,
                height: `${particle.width}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                background: particle.color,
              }}
              animate={{
                y: [0, -25, 0],
                x: [0, particle.drift, 0],
                opacity: [0.15, 0.5, 0.15],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── SLIDE DOTS ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {activeImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`rounded-full transition-all duration-500 ${
              idx === currentSlide
                ? 'w-10 h-1.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]'
                : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      {/*
        Mobile: content anchored to bottom so the upper photo stays visible.
        Desktop: content vertically centered with a left-aligned column.
      */}
      <div className="relative z-10 flex w-full flex-1 flex-col justify-end lg:justify-center px-6 lg:px-16 pb-24 pt-12 lg:py-24">
        <div className="w-full max-w-xl text-left flex flex-col gap-7">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/[0.06] backdrop-blur-md border border-white/[0.12] text-white/70 rounded-full text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-blue-300" />
              Robotics Academy
              <span className="w-px h-3 bg-white/15" />
              <span>🇪🇹</span>
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display font-bold text-white tracking-tight leading-[1.05]"
            style={{ fontSize: 'clamp(34px, 5.5vw, 66px)' }}
            id="hero-title"
          >
            {banners[currentSlide]?.title ? (
              <>{banners[currentSlide].title}</>
            ) : (
              <>
                <span className="text-white">Ethio Robotics</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-100">
                  builds future engineers
                </span>
                <br />
                <span className="text-white/90">through real robots.</span>
              </>
            )}
          </motion.h1>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={banners[currentSlide]?.subtitle || 'default-subtitle'}
              initial={{ opacity: 0, y: 16 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-sans text-white/60 leading-relaxed"
              style={{ fontSize: 'clamp(15px, 1.5vw, 18px)' }}
              id="hero-quote"
            >
              {banners[currentSlide]?.subtitle
                ? `"${banners[currentSlide].subtitle}"`
                : 'Learn robotics, join competitions, and build the future with STEM.'}
            </motion.p>
          </AnimatePresence>

          {/* Trust chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex flex-wrap items-center gap-2"
          >
            {trustItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/[0.08] text-white/40 rounded-full text-[11px] font-medium"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-blue-300/50" />
                {item}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1"
            id="hero-actions"
          >
            {banners[currentSlide]?.button_text && banners[currentSlide]?.button_url ? (
              <a
                href={banners[currentSlide].button_url!}
                target="_blank" rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center font-sans font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-700 text-white px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 overflow-hidden w-full sm:w-auto"
              >
                <span className="relative z-[1] flex items-center gap-2">
                  {banners[currentSlide].button_text}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            ) : (
              <button
                onClick={onDiscoverPrograms}
                className="group relative inline-flex items-center justify-center font-sans font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-700 text-white px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 overflow-hidden w-full sm:w-auto"
                id="btn-discover-programs"
              >
                <span className="relative z-[1] flex items-center gap-2">
                  Explore Programs
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            )}

            <button
              onClick={onJoinCommunity}
              className="group relative inline-flex items-center justify-center font-sans font-semibold text-sm bg-white/10 backdrop-blur-md border border-white/20 text-white px-7 py-3.5 rounded-xl hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 overflow-hidden w-full sm:w-auto"
              id="btn-join-community"
            >
              <span className="relative z-[1] flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Join Us
              </span>
            </button>

            <button
              onClick={onShopStore}
              className="group relative inline-flex items-center justify-center font-sans font-semibold text-sm bg-white/[0.06] backdrop-blur-md border border-white/15 text-white/60 px-5 py-3.5 rounded-xl hover:bg-white/15 hover:text-white hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 w-full sm:w-auto"
              id="btn-shop-store"
            >
              <span className="relative z-[1] flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                Shop Gear
              </span>
            </button>
          </motion.div>

          {/* Stats + Progress — same UI, values from CMS backend */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="w-full"
          >
            <div className="w-full bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
              <div className="flex flex-wrap items-stretch gap-x-0 gap-y-3">
                {displayStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={mounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.55 + i * 0.1 }}
                    className={`pr-4 mr-4 ${i < displayStats.length - 1 ? 'border-r border-white/10' : ''}`}
                  >
                    <div className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.accent}`}>
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-white/40 font-medium mt-0.5 uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-mono font-semibold text-white/30 uppercase tracking-[0.15em]">Mission Progress</span>
                  <span className="text-[11px] font-semibold text-white/50 font-mono">
                    {loadingStats && !stats ? '…' : `${formatInt(missionCurrent)} / ${formatInt(missionTarget)}`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    key={missionPct}
                    initial={{ width: 0 }}
                    animate={mounted && !loadingStats ? { width: `${missionPct}%` } : { width: 0 }}
                    transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 rounded-full"
                  />
                </div>
                <p className="text-[8px] text-white/20 font-medium text-right mt-0.5">
                  {loadingStats && !stats ? '…' : `${missionPct}% of National Goal`}
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
