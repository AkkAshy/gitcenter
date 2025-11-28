import React, { useEffect, useState } from 'react';
import { HistoricalSite, Guide } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface SiteCardProps {
  siteId: number;
  onClose: () => void;
  onGuideSelect: (guide: Guide) => void;
}

export default function SiteCard({ siteId, onClose, onGuideSelect }: SiteCardProps) {
  const [site, setSite] = useState<HistoricalSite | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [showGuides, setShowGuides] = useState(false);
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    api.getSite(siteId).then((data) => {
      setSite(data);
      setLoading(false);
    });
    api.getSiteGuides(siteId).then(setGuides);
  }, [siteId]);

  if (loading || !site) {
    return (
      <div className="site-card">
        <div className="site-card-loading">
          {t("Yuklanmoqda...", "Загрузка...", "Loading...")}
        </div>
      </div>
    );
  }

  const getName = () => {
    switch (lang) {
      case 'uz': return site.name_uz;
      case 'en': return site.name_en;
      default: return site.name_ru;
    }
  };

  const getDescription = () => {
    switch (lang) {
      case 'uz': return site.description_uz;
      case 'en': return site.description_en;
      default: return site.description_ru;
    }
  };

  const getFacts = () => {
    switch (lang) {
      case 'uz': return site.facts_uz;
      case 'en': return site.facts_en;
      default: return site.facts_ru;
    }
  };

  return (
    <div className="site-card">
      <button className="site-card-close" onClick={onClose}>×</button>

      {site.main_image && (
        <img src={site.main_image} alt={getName()} className="site-card-image" />
      )}

      <div className="site-card-content">
        <div className="site-card-category" style={{ background: site.category?.color || '#3B82F6' }}>
          {lang === 'uz' ? site.category?.name_uz : lang === 'en' ? site.category?.name_en : site.category?.name_ru}
        </div>

        <h2 className="site-card-title">{getName()}</h2>

        {site.built_date && (
          <p className="site-card-date">
            {t("Qurilgan sana", "Дата постройки", "Built date")}: {site.built_date}
          </p>
        )}

        <p className="site-card-description">{getDescription()}</p>

        {getFacts() && (
          <div className="site-card-facts">
            <h4>{t("Qiziqarli faktlar", "Интересные факты", "Interesting facts")}</h4>
            <p style={{ whiteSpace: 'pre-line' }}>{getFacts()}</p>
          </div>
        )}

        {site.address && (
          <p className="site-card-address">
            <strong>{t("Manzil", "Адрес", "Address")}:</strong> {site.address}
          </p>
        )}

        {site.working_hours && (
          <p className="site-card-hours">
            <strong>{t("Ish vaqti", "Часы работы", "Working hours")}:</strong> {site.working_hours}
          </p>
        )}

        {site.ticket_price && (
          <p className="site-card-price">
            <strong>{t("Chipta narxi", "Цена билета", "Ticket price")}:</strong> {site.ticket_price}
          </p>
        )}

        <div className="site-card-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowGuides(!showGuides)}
          >
            {t("Gidlar", "Гиды", "Guides")} ({guides.length})
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => {
              const lat = site.latitude;
              const lng = site.longitude;
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
            }}
          >
            {t("Yo'nalish", "Маршрут", "Route")}
          </button>
        </div>

        {showGuides && guides.length > 0 && (
          <div className="guides-list">
            <h4>{t("Mavjud gidlar", "Доступные гиды", "Available guides")}</h4>
            {guides.map((guide) => (
              <div key={guide.id} className="guide-mini-card" onClick={() => onGuideSelect(guide)}>
                <div className="guide-mini-info">
                  <strong>{guide.full_name}</strong>
                  {guide.is_verified && <span className="verified-badge">✓</span>}
                  <div className="guide-mini-rating">★ {guide.rating} ({guide.total_reviews})</div>
                  <div className="guide-mini-price">
                    {parseInt(guide.price_per_hour).toLocaleString()} {t("so'm/soat", "сум/час", "sum/hour")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
