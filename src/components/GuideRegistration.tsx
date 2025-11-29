import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { HistoricalSite } from '../types';
import { HiX } from 'react-icons/hi';

// Wrapper для react-icons для совместимости с React 19
const XIcon = () => React.createElement(HiX as React.ComponentType);

interface GuideRegistrationProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function GuideRegistration({ onClose, onSuccess }: GuideRegistrationProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sites, setSites] = useState<HistoricalSite[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '+998 ',
    full_name: '',
    bio: '',
    languages: ['uz', 'ru'] as string[],
    experience_years: 0,
    price_per_hour: 50000,
    average_tour_duration: 2,
    specialization_site_ids: [] as number[],
  });

  useEffect(() => {
    api.getSites().then(setSites);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' || name === 'price_per_hour' || name === 'average_tour_duration'
        ? Number(value)
        : value
    }));
  };

  // Форматирование телефона: +998 XX XXX XX XX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Удаляем все кроме цифр
    const digits = value.replace(/\D/g, '');

    // Убираем 998 если пользователь его ввел (оно уже есть в префиксе)
    let phoneDigits = digits;
    if (digits.startsWith('998')) {
      phoneDigits = digits.slice(3);
    }

    // Ограничиваем 9 цифрами (XX XXX XX XX)
    phoneDigits = phoneDigits.slice(0, 9);

    // Форматируем: XX XXX XX XX
    let formatted = '';
    if (phoneDigits.length > 0) {
      formatted = phoneDigits.slice(0, 2);
    }
    if (phoneDigits.length > 2) {
      formatted += ' ' + phoneDigits.slice(2, 5);
    }
    if (phoneDigits.length > 5) {
      formatted += ' ' + phoneDigits.slice(5, 7);
    }
    if (phoneDigits.length > 7) {
      formatted += ' ' + phoneDigits.slice(7, 9);
    }

    setFormData(prev => ({
      ...prev,
      phone: '+998 ' + formatted
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleSiteToggle = (siteId: number) => {
    setFormData(prev => ({
      ...prev,
      specialization_site_ids: prev.specialization_site_ids.includes(siteId)
        ? prev.specialization_site_ids.filter(id => id !== siteId)
        : [...prev.specialization_site_ids, siteId]
    }));
  };

  const validateStep1 = () => {
    if (!formData.username || formData.username.length < 3) {
      setError(t("Ism kamida 3 ta belgidan iborat bo'lishi kerak", 'Имя должно содержать минимум 3 символа', 'Username must be at least 3 characters'));
      return false;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError(t("To'g'ri email kiriting", 'Введите корректный email', 'Enter a valid email'));
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError(t("Parol kamida 6 ta belgidan iborat bo'lishi kerak", 'Пароль должен содержать минимум 6 символов', 'Password must be at least 6 characters'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('Parollar mos kelmaydi', 'Пароли не совпадают', 'Passwords do not match'));
      return false;
    }
    // Проверяем что введено 9 цифр после +998
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 12) { // 998 + 9 цифр = 12
      setError(t("To'liq telefon raqamini kiriting", 'Введите полный номер телефона', 'Enter complete phone number'));
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.full_name || formData.full_name.length < 3) {
      setError(t("To'liq ismni kiriting", 'Введите полное имя', 'Enter full name'));
      return false;
    }
    if (formData.languages.length === 0) {
      setError(t('Kamida bitta tilni tanlang', 'Выберите хотя бы один язык', 'Select at least one language'));
      return false;
    }
    if (formData.price_per_hour < 10000) {
      setError(t("Narx juda past", 'Цена слишком низкая', 'Price is too low'));
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api.registerGuide({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        full_name: formData.full_name,
        bio: formData.bio,
        languages: formData.languages,
        experience_years: formData.experience_years,
        price_per_hour: formData.price_per_hour,
        average_tour_duration: formData.average_tour_duration,
        specialization_site_ids: formData.specialization_site_ids,
      });

      if (result.status === 'success') {
        onSuccess();
      } else {
        // Handle validation errors
        const errorMessages = Object.values(result).flat().join(', ');
        setError(errorMessages || t('Xatolik yuz berdi', 'Произошла ошибка', 'An error occurred'));
      }
    } catch (err) {
      setError(t('Server bilan aloqa yo\'q', 'Ошибка связи с сервером', 'Server connection error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guide-registration-overlay">
      <div className="guide-registration-modal">
        <button className="modal-close" onClick={onClose}><XIcon /></button>

        <h2>{t("Gid sifatida ro'yxatdan o'tish", 'Регистрация гида', 'Guide Registration')}</h2>

        {/* Progress Steps */}
        <div className="registration-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">{t('Akkaunt', 'Аккаунт', 'Account')}</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">{t("Ma'lumotlar", 'Данные', 'Info')}</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">{t('Joylar', 'Места', 'Sites')}</span>
          </div>
        </div>

        {error && <div className="registration-error">{error}</div>}

        {/* Step 1: Account Info */}
        {step === 1 && (
          <div className="registration-form">
            <div className="form-group">
              <label>{t('Foydalanuvchi nomi', 'Имя пользователя', 'Username')}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('Masalan: guide_aziz', 'Например: guide_aziz', 'e.g. guide_aziz')}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label>{t('Telefon raqami', 'Номер телефона', 'Phone number')}</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+998 XX XXX XX XX"
              />
            </div>

            <div className="form-group">
              <label>{t('Parol', 'Пароль', 'Password')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('Kamida 6 ta belgi', 'Минимум 6 символов', 'At least 6 characters')}
              />
            </div>

            <div className="form-group">
              <label>{t('Parolni tasdiqlang', 'Подтвердите пароль', 'Confirm password')}</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button className="btn btn-primary btn-block" onClick={handleNextStep}>
              {t('Keyingisi', 'Далее', 'Next')}
            </button>
          </div>
        )}

        {/* Step 2: Profile Info */}
        {step === 2 && (
          <div className="registration-form">
            <div className="form-group">
              <label>{t("To'liq ism", 'Полное имя', 'Full name')}</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder={t('Aziz Karimov', 'Азиз Каримов', 'Aziz Karimov')}
              />
            </div>

            <div className="form-group">
              <label>{t("O'zingiz haqingizda", 'О себе', 'About yourself')}</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder={t("Tajribangiz, qiziqishlaringiz...", 'Ваш опыт, интересы...', 'Your experience, interests...')}
              />
            </div>

            <div className="form-group">
              <label>{t('Tillar', 'Языки', 'Languages')}</label>
              <div className="language-toggles">
                {[
                  { code: 'uz', label: "O'zbek" },
                  { code: 'ru', label: 'Русский' },
                  { code: 'en', label: 'English' },
                  { code: 'kk', label: 'Қарақалпақша' },
                ].map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    className={`language-toggle ${formData.languages.includes(lang.code) ? 'active' : ''}`}
                    onClick={() => handleLanguageToggle(lang.code)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('Tajriba (yil)', 'Опыт (лет)', 'Experience (years)')}</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  min={0}
                  max={50}
                />
              </div>

              <div className="form-group">
                <label>{t("Soatlik narx (so'm)", 'Цена за час (сум)', 'Price per hour (sum)')}</label>
                <input
                  type="number"
                  name="price_per_hour"
                  value={formData.price_per_hour}
                  onChange={handleChange}
                  min={10000}
                  step={5000}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t("O'rtacha ekskursiya davomiyligi (soat)", 'Средняя продолжительность тура (часов)', 'Average tour duration (hours)')}</label>
              <input
                type="number"
                name="average_tour_duration"
                value={formData.average_tour_duration}
                onChange={handleChange}
                min={1}
                max={12}
              />
            </div>

            <div className="form-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                {t('Orqaga', 'Назад', 'Back')}
              </button>
              <button className="btn btn-primary" onClick={handleNextStep}>
                {t('Keyingisi', 'Далее', 'Next')}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Sites */}
        {step === 3 && (
          <div className="registration-form">
            <p className="form-description">
              {t(
                "Qaysi joylarda ekskursiya o'tkazishni xohlaysiz? (ixtiyoriy)",
                'Выберите места, где вы проводите экскурсии (необязательно)',
                'Select sites where you conduct tours (optional)'
              )}
            </p>

            <div className="sites-grid">
              {sites.slice(0, 20).map(site => (
                <button
                  key={site.id}
                  type="button"
                  className={`site-toggle ${formData.specialization_site_ids.includes(site.id) ? 'active' : ''}`}
                  onClick={() => handleSiteToggle(site.id)}
                >
                  {site.name_ru}
                </button>
              ))}
            </div>

            <p className="selected-count">
              {t('Tanlandi', 'Выбрано', 'Selected')}: {formData.specialization_site_ids.length}
            </p>

            <div className="form-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                {t('Orqaga', 'Назад', 'Back')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? t('Yuborilmoqda...', 'Отправка...', 'Submitting...')
                  : t("Ro'yxatdan o'tish", 'Зарегистрироваться', 'Register')
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
