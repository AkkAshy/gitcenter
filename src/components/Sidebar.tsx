import React, { useEffect, useState } from 'react';
import { Category, HistoricalSite } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { HiX } from 'react-icons/hi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteSelect: (siteId: number) => void;
}

export default function Sidebar({ isOpen, onClose, onSiteSelect }: SidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sites, setSites] = useState<HistoricalSite[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { lang, t } = useLanguage();

  useEffect(() => {
    api.getCategories().then(setCategories);
    api.getSites().then(setSites);
  }, []);

  const filteredSites = selectedCategory
    ? sites.filter(s => s.category?.id === selectedCategory)
    : sites;

  const getCategoryName = (cat: Category) => {
    switch (lang) {
      case 'uz': return cat.name_uz;
      case 'en': return cat.name_en;
      default: return cat.name_ru;
    }
  };

  const getSiteName = (site: HistoricalSite) => {
    switch (lang) {
      case 'uz': return site.name_uz;
      case 'en': return site.name_en;
      default: return site.name_ru;
    }
  };

  const getShortDesc = (site: HistoricalSite) => {
    switch (lang) {
      case 'uz': return site.short_description_uz;
      case 'en': return site.short_description_en;
      default: return site.short_description_ru;
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>{t("Joylar", "Места", "Places")}</h2>
        <button className="sidebar-close" onClick={onClose}><HiX /></button>
      </div>

      <div className="sidebar-categories">
        <button
          className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          {t("Hammasi", "Все", "All")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            style={{ borderColor: cat.color }}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {getCategoryName(cat)}
          </button>
        ))}
      </div>

      <div className="sidebar-sites">
        {filteredSites.map((site) => (
          <div
            key={site.id}
            className="sidebar-site-item"
            onClick={() => {
              onSiteSelect(site.id);
              onClose();
            }}
          >
            <div
              className="site-color-bar"
              style={{ background: site.category?.color || '#3B82F6' }}
            />
            <div className="site-info">
              <strong>{getSiteName(site)}</strong>
              <small>{getShortDesc(site)}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
