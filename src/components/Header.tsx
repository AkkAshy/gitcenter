import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import SearchBar from './SearchBar';
import ImageSearch from './ImageSearch';
import { HiMenu } from 'react-icons/hi';
import { FaLandmark } from 'react-icons/fa';
import { MdCameraAlt } from 'react-icons/md';

// Wrapper для react-icons для совместимости с React 19
const MenuIcon = () => React.createElement(HiMenu as React.ComponentType);
const LandmarkIcon = () => React.createElement(FaLandmark as React.ComponentType);
const CameraIcon = () => React.createElement(MdCameraAlt as React.ComponentType);

interface HeaderProps {
  onMenuClick: () => void;
  onSiteSelect: (siteId: number) => void;
}

export default function Header({ onMenuClick, onSiteSelect }: HeaderProps) {
  const { lang, setLang } = useLanguage();
  const [showImageSearch, setShowImageSearch] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: "O'z" },
    { code: 'ru', label: 'Рус' },
    { code: 'en', label: 'Eng' },
  ];

  return (
    <header className="header">
      <button className="menu-btn" onClick={onMenuClick}>
        <MenuIcon />
      </button>

      <div className="header-logo">
        <span className="logo-icon"><LandmarkIcon /></span>
        <span className="logo-text">Guide Center Map</span>
      </div>

      <SearchBar onSelect={onSiteSelect} />

      <button
        className="image-search-btn"
        onClick={() => setShowImageSearch(true)}
        title="AI поиск по фото"
      >
        <CameraIcon />
      </button>

      <div className="language-switcher">
        {languages.map((l) => (
          <button
            key={l.code}
            className={`lang-btn ${lang === l.code ? 'active' : ''}`}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {showImageSearch && (
        <ImageSearch
          onSiteFound={onSiteSelect}
          onClose={() => setShowImageSearch(false)}
        />
      )}
    </header>
  );
}
