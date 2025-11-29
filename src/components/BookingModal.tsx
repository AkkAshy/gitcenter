import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Guide, PaymentIntent, PaymentConfirmation } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { HiX, HiCreditCard, HiCheck, HiCalendar, HiClock, HiUser, HiMail, HiPhone } from 'react-icons/hi';

// Wrapper для react-icons для совместимости с React 19
const XIcon = () => React.createElement(HiX as React.ComponentType);
const CreditCardIcon = () => React.createElement(HiCreditCard as React.ComponentType);
const CheckIcon = () => React.createElement(HiCheck as React.ComponentType);
const CalendarIcon = () => React.createElement(HiCalendar as React.ComponentType);
const ClockIcon = () => React.createElement(HiClock as React.ComponentType);
const UserIcon = () => React.createElement(HiUser as React.ComponentType);
const MailIcon = () => React.createElement(HiMail as React.ComponentType);
const PhoneIcon = () => React.createElement(HiPhone as React.ComponentType);

// Stripe public key (получить на https://dashboard.stripe.com)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_your_key');

interface BookingModalProps {
  guide: Guide;
  siteId?: number;
  onClose: () => void;
  onSuccess: (confirmation: PaymentConfirmation) => void;
}

// Форма оплаты
function CheckoutForm({
  guide,
  siteId,
  formData,
  paymentIntent,
  onSuccess,
  onBack
}: {
  guide: Guide;
  siteId?: number;
  formData: {
    date: string;
    time: string;
    hours: number;
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  paymentIntent: PaymentIntent;
  onSuccess: (confirmation: PaymentConfirmation) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // Подтверждаем платёж в Stripe
      const { error: stripeError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.name,
              email: formData.email,
            },
          },
        }
      );

      // Если платёж уже был подтверждён ранее
      if (stripeError?.code === 'payment_intent_unexpected_state') {
        // Платёж уже прошёл, подтверждаем на сервере
        const confirmation = await api.confirmPayment({
          payment_intent_id: paymentIntent.payment_intent_id,
          guide_id: guide.id,
          site_id: siteId,
          date: formData.date,
          time: formData.time,
          hours: formData.hours,
          tourist_name: formData.name,
          tourist_email: formData.email,
          tourist_phone: formData.phone,
          notes: formData.notes,
        });

        if (confirmation.status === 'success') {
          onSuccess(confirmation);
        } else {
          setError(confirmation.error || 'Confirmation failed');
        }
        setLoading(false);
        return;
      }

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (confirmedIntent?.status === 'succeeded') {
        // Подтверждаем на нашем сервере
        const confirmation = await api.confirmPayment({
          payment_intent_id: paymentIntent.payment_intent_id,
          guide_id: guide.id,
          site_id: siteId,
          date: formData.date,
          time: formData.time,
          hours: formData.hours,
          tourist_name: formData.name,
          tourist_email: formData.email,
          tourist_phone: formData.phone,
          notes: formData.notes,
        });

        if (confirmation.status === 'success') {
          onSuccess(confirmation);
        } else {
          setError(confirmation.error || 'Confirmation failed');
        }
      }
    } catch (err) {
      setError('Payment processing error');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="payment-summary">
        <h4>{t("Итого к оплате", "Jami to'lov", "Total to pay")}</h4>
        <div className="payment-amount">{paymentIntent.amount_display}</div>
        <div className="payment-details">
          <small>{t("Комиссия платформы 2% включена", "Platforma komissiyasi 2% kiritilgan", "2% platform fee included")}</small>
        </div>
      </div>

      <div className="card-element-container">
        <label>{t("Данные карты", "Karta ma'lumotlari", "Card details")}</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#ef4444',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="payment-error">
          {error}
        </div>
      )}

      <div className="payment-actions">
        <button type="button" className="btn btn-secondary" onClick={onBack} disabled={loading}>
          {t("Назад", "Orqaga", "Back")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={!stripe || loading}>
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <CreditCardIcon /> {t("Оплатить", "To'lash", "Pay")} {paymentIntent.amount_display}
            </>
          )}
        </button>
      </div>

      <div className="payment-secure">
        <small>{t("Безопасная оплата через Stripe", "Stripe orqali xavfsiz to'lov", "Secure payment via Stripe")}</small>
      </div>
    </form>
  );
}

// Экран успеха
function SuccessScreen({ confirmation, onClose }: { confirmation: PaymentConfirmation; onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="booking-success">
      <div className="success-icon">
        <CheckIcon />
      </div>
      <h3>{t("Оплата прошла успешно!", "To'lov muvaffaqiyatli!", "Payment successful!")}</h3>
      <p>{t("Контакты вашего гида:", "Gid kontaktlari:", "Your guide contacts:")}</p>

      <div className="guide-contacts">
        <div className="contact-item">
          <UserIcon />
          <span>{confirmation.guide_contact.name}</span>
        </div>
        <div className="contact-item">
          <PhoneIcon />
          <a href={`tel:${confirmation.guide_contact.phone}`}>{confirmation.guide_contact.phone}</a>
        </div>
        {confirmation.guide_contact.email && (
          <div className="contact-item">
            <MailIcon />
            <a href={`mailto:${confirmation.guide_contact.email}`}>{confirmation.guide_contact.email}</a>
          </div>
        )}
      </div>

      <div className="booking-info">
        <h4>{t("Детали бронирования", "Buyurtma tafsilotlari", "Booking details")}</h4>
        <p><CalendarIcon /> {confirmation.booking_details.date}</p>
        <p><ClockIcon /> {confirmation.booking_details.time} ({confirmation.booking_details.duration} {t("часа", "soat", "hours")})</p>
        <p><strong>{t("Оплачено:", "To'langan:", "Paid:")} {confirmation.booking_details.total_paid}</strong></p>
      </div>

      <button className="btn btn-primary btn-large" onClick={onClose}>
        {t("Готово", "Tayyor", "Done")}
      </button>
    </div>
  );
}

// Главный компонент
export default function BookingModal({ guide, siteId, onClose, onSuccess }: BookingModalProps) {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [confirmation, setConfirmation] = useState<PaymentConfirmation | null>(null);
  const { t } = useLanguage();

  // Форма данных
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    hours: guide.average_tour_duration || 2,
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Установка минимальной даты (завтра)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  // Расчёт цены
  const priceUSD = (parseFloat(guide.price_per_hour) / 12500) * formData.hours;
  const displayPrice = `$${priceUSD.toFixed(2)}`;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Создаём PaymentIntent
      const intent = await api.createPaymentIntent({
        guide_id: guide.id,
        hours: formData.hours,
        email: formData.email,
        site_id: siteId,
      });

      if (intent.error) {
        setError(intent.error);
      } else {
        setPaymentIntent(intent);
        setStep('payment');
      }
    } catch (err) {
      setError(t('Ошибка создания платежа', "To'lov yaratishda xato", 'Payment creation error'));
    }

    setLoading(false);
  };

  const handlePaymentSuccess = (conf: PaymentConfirmation) => {
    setConfirmation(conf);
    setStep('success');
    onSuccess(conf);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours' ? parseInt(value) : value
    }));
  };

  return (
    <div className="booking-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XIcon /></button>

        {step === 'success' && confirmation ? (
          <SuccessScreen confirmation={confirmation} onClose={onClose} />
        ) : (
          <>
            <div className="booking-header">
              <h2>{t("Забронировать гида", "Gidni band qilish", "Book a guide")}</h2>
              <div className="guide-preview">
                <strong>{guide.full_name}</strong>
                <span>{displayPrice} ({formData.hours} {t("ч.", "soat", "h.")})</span>
              </div>
            </div>

            {step === 'form' && (
              <form onSubmit={handleFormSubmit} className="booking-form">
                <div className="form-section">
                  <h4>{t("Дата и время", "Sana va vaqt", "Date and time")}</h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label><CalendarIcon /> {t("Дата", "Sana", "Date")}</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label><ClockIcon /> {t("Время", "Vaqt", "Time")}</label>
                      <select name="time" value={formData.time} onChange={handleChange}>
                        <option value="08:00">08:00</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="12:00">12:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                        <option value="16:00">16:00</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t("Длительность", "Davomiyligi", "Duration")}</label>
                    <select name="hours" value={formData.hours} onChange={handleChange}>
                      <option value={1}>1 {t("час", "soat", "hour")}</option>
                      <option value={2}>2 {t("часа", "soat", "hours")}</option>
                      <option value={3}>3 {t("часа", "soat", "hours")}</option>
                      <option value={4}>4 {t("часа", "soat", "hours")}</option>
                      <option value={5}>5 {t("часов", "soat", "hours")}</option>
                      <option value={6}>6 {t("часов", "soat", "hours")}</option>
                      <option value={8}>8 {t("часов", "soat", "hours")}</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h4>{t("Ваши данные", "Sizning ma'lumotlaringiz", "Your details")}</h4>

                  <div className="form-group">
                    <label><UserIcon /> {t("Имя", "Ism", "Name")}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("Введите ваше имя", "Ismingizni kiriting", "Enter your name")}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><MailIcon /> Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><PhoneIcon /> {t("Телефон", "Telefon", "Phone")}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t("Пожелания (необязательно)", "Istaklar (ixtiyoriy)", "Notes (optional)")}</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      placeholder={t("Особые пожелания...", "Maxsus istaklar...", "Special requests...")}
                    />
                  </div>
                </div>

                {error && <div className="booking-error">{error}</div>}

                <div className="booking-summary">
                  <div className="summary-row">
                    <span>{guide.full_name}</span>
                    <span>{formData.hours} x ${(parseFloat(guide.price_per_hour) / 12500).toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>{t("Итого", "Jami", "Total")}</span>
                    <span>{displayPrice}</span>
                  </div>
                  <small className="fee-note">{t("Включает 2% комиссию платформы", "Platforma komissiyasi 2% kiritilgan", "Includes 2% platform fee")}</small>
                </div>

                <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                  {loading ? t("Загрузка...", "Yuklanmoqda...", "Loading...") : t("Перейти к оплате", "To'lovga o'tish", "Proceed to payment")}
                </button>
              </form>
            )}

            {step === 'payment' && paymentIntent && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  guide={guide}
                  siteId={siteId}
                  formData={formData}
                  paymentIntent={paymentIntent}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setStep('form')}
                />
              </Elements>
            )}
          </>
        )}
      </div>
    </div>
  );
}
