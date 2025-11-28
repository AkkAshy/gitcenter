import React, { useState, useEffect, useRef } from 'react';
import { HistoricalSite } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface SearchBarProps {
  onSelect: (siteId: number) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HistoricalSite[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { lang, t } = useLanguage();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        api.searchSites(query, lang).then(setResults);
        setIsOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, lang]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
    onSelect(site.id);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className="search-input"
        placeholder={t("Qidirish...", "Поиск...", "Search...")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
      />
      <span className="search-icon">🔍</span>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map((site) => (
            <div
              key={site.id}
              className="search-result-item"
              onClick={() => handleSelect(site)}
            >
              <div
                className="search-result-color"
                style={{ background: site.category?.color || '#3B82F6' }}
              />
              <div className="search-result-info">
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
  );
}
