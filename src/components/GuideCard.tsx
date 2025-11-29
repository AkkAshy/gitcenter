import React, { useState } from 'react';
import { Guide, PaymentConfirmation } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { HiUser, HiCheck, HiStar, HiX } from 'react-icons/hi';
import BookingModal from './BookingModal';

// Wrapper для react-icons для совместимости с React 19
const XIcon = () => React.createElement(HiX as React.ComponentType);
const CheckIcon = () => React.createElement(HiCheck as React.ComponentType);
const StarIcon = () => React.createElement(HiStar as React.ComponentType);
const UserIcon = () => React.createElement(HiUser as React.ComponentType);

interface GuideCardProps {
  guide: Guide;
  siteId?: number;
  onClose: () => void;
}

export default function GuideCard({ guide, siteId, onClose }: GuideCardProps) {
  const { t, lang } = useLanguage();
  const [showBooking, setShowBooking] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<PaymentConfirmation | null>(null);

  const getLangName = (code: string) => {
    const names: Record<string, Record<string, string>> = {
      uz: { uz: "O'zbek", ru: 'Узбекский', en: 'Uzbek' },
      ru: { uz: 'Rus', ru: 'Русский', en: 'Russian' },
      en: { uz: 'Ingliz', ru: 'Английский', en: 'English' },
      de: { uz: 'Nemis', ru: 'Немецкий', en: 'German' },
    };
    return names[code]?.[lang] || code;
  };

  return (
    <div className="guide-card">
      <button className="guide-card-close" onClick={onClose}><XIcon /></button>

      <div className="guide-card-header">
        <div className="guide-avatar">
          {guide.avatar ? (
            <img src={guide.avatar} alt={guide.full_name} />
          ) : (
            <div className="guide-avatar-placeholder"><UserIcon /></div>
          )}
        </div>
        <div className="guide-header-info">
          <h2>
            {guide.full_name}
            {guide.is_verified && <span className="verified-badge" title={t("Tasdiqlangan", "Верифицирован", "Verified")}><CheckIcon /></span>}
          </h2>
          <div className="guide-rating">
            <StarIcon /> {guide.rating} ({guide.total_reviews} {t("sharh", "отзывов", "reviews")})
          </div>
        </div>
      </div>

      <div className="guide-card-content">
        {guide.bio && (
          <p className="guide-bio">{guide.bio}</p>
        )}

        <div className="guide-details">
          <div className="guide-detail">
            <span className="detail-label">{t("Tajriba", "Опыт", "Experience")}</span>
            <span className="detail-value">{guide.experience_years} {t("yil", "лет", "years")}</span>
          </div>

          <div className="guide-detail">
            <span className="detail-label">{t("Narx", "Цена", "Price")}</span>
            <span className="detail-value highlight">
              {parseInt(guide.price_per_hour).toLocaleString()} {t("so'm/soat", "сум/час", "sum/hour")}
            </span>
          </div>

          <div className="guide-detail">
            <span className="detail-label">{t("O'rtacha davomiylik", "Средняя длительность", "Average duration")}</span>
            <span className="detail-value">{guide.average_tour_duration} {t("soat", "часа", "hours")}</span>
          </div>

          <div className="guide-detail">
            <span className="detail-label">{t("Tillar", "Языки", "Languages")}</span>
            <span className="detail-value">
              {guide.languages.map(l => getLangName(l)).join(', ')}
            </span>
          </div>
        </div>

        <div className="guide-actions">
          <button className="btn btn-primary btn-large" onClick={() => setShowBooking(true)}>
            {t("Band qilish", "Забронировать", "Book")}
          </button>
        </div>

        {bookingConfirmation ? (
          <div className="guide-contact-revealed">
            <p className="success-message">{t("To'lov muvaffaqiyatli!", "Оплата успешна!", "Payment successful!")}</p>
            <div className="revealed-contacts">
              <p><strong>{t("Telefon", "Телефон", "Phone")}:</strong> <a href={`tel:${bookingConfirmation.guide_contact.phone}`}>{bookingConfirmation.guide_contact.phone}</a></p>
              {bookingConfirmation.guide_contact.email && (
                <p><strong>Email:</strong> <a href={`mailto:${bookingConfirmation.guide_contact.email}`}>{bookingConfirmation.guide_contact.email}</a></p>
              )}
            </div>
          </div>
        ) : (
          <p className="guide-notice">
            {t(
              "Gid kontaktlari to'lovdan keyin ko'rsatiladi",
              "Контакты гида будут показаны после оплаты",
              "Guide contacts will be shown after payment"
            )}
          </p>
        )}
      </div>

      {showBooking && (
        <BookingModal
          guide={guide}
          siteId={siteId}
          onClose={() => setShowBooking(false)}
          onSuccess={(confirmation) => {
            setBookingConfirmation(confirmation);
            setShowBooking(false);
          }}
        />
      )}
    </div>
  );
}
