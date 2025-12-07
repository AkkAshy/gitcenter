import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HistoricalSite } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { HiSearch } from 'react-icons/hi';
import './LandingOverlay.css';

const SearchIcon = () => React.createElement(HiSearch as React.ComponentType);

interface LandingOverlayProps {
  onEnter: () => void;
  onSiteSelect: (siteId: number) => void;
}

export default function LandingOverlay({ onEnter, onSiteSelect }: LandingOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HistoricalSite[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { lang, t } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        api.searchSites(query, lang).then(setResults);
        setIsSearchOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsSearchOpen(false);
    }
  }, [query, lang]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getName = (site: HistoricalSite) => {
    switch (lang) {
      case 'uz': return site.name_uz;
      case 'en': return site.name_en;
      default: return site.name_ru;
    }
  };

  const handleSelect = (site: HistoricalSite) => {
    onSiteSelect(site.id);
    setQuery('');
    setIsSearchOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Если клик не по поиску - закрываем оверлей
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onEnter();
      }, 500);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`landing-overlay ${isExiting ? 'exiting' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="landing-glass">
        <div className="landing-content" onClick={(e) => e.stopPropagation()}>
          <h1 className="landing-title">Qoraqalpog'iston</h1>
          <p className="landing-subtitle">
            {t(
              "Tarixiy joylarni kashf eting",
              "Откройте исторические места",
              "Discover historical places"
            )}
          </p>

          <div className="landing-search" ref={searchRef}>
            <div className="landing-search-input-wrapper">
              <span className="landing-search-icon"><SearchIcon /></span>
              <input
                type="text"
                className="landing-search-input"
                placeholder={t(
                  "Joyni qidiring...",
                  "Найти место...",
                  "Search for a place..."
                )}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setIsSearchOpen(true)}
              />
            </div>

            {isSearchOpen && results.length > 0 && (
              <div className="landing-search-results">
                {results.map((site) => (
                  <div
                    key={site.id}
                    className="landing-search-item"
                    onClick={() => handleSelect(site)}
                  >
                    <div
                      className="landing-search-color"
                      style={{ background: site.category?.color || '#3B82F6' }}
                    />
                    <div className="landing-search-info">
                      <strong>{getName(site)}</strong>
                      <small>
                        {lang === 'uz' ? site.category?.name_uz : lang === 'en' ? site.category?.name_en : site.category?.name_ru}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="landing-hint">
            {t(
              "Xaritani ko'rish uchun istalgan joyga bosing",
              "Нажмите в любое место чтобы открыть карту",
              "Click anywhere to explore the map"
            )}
          </p>

          <div className="landing-actions">
            <Link to="/demo" className="landing-demo-link">
              {t("Demo ko'rish", "Смотреть демо", "Watch demo")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
