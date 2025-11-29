import React, { useState, useRef } from 'react';
import { HistoricalSite } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { MdCameraAlt } from 'react-icons/md';
import { HiArrowRight, HiX } from 'react-icons/hi';

// Wrapper для react-icons для совместимости с React 19
const CameraIcon = () => React.createElement(MdCameraAlt as React.ComponentType);
const ArrowRightIcon = () => React.createElement(HiArrowRight as React.ComponentType);
const XIcon = () => React.createElement(HiX as React.ComponentType);

interface ImageSearchProps {
  onSiteFound: (siteId: number) => void;
  onClose: () => void;
}

// Gemini API ключ из .env файла
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_TOKEN || '';

export default function ImageSearch({ onSiteFound, onClose }: ImageSearchProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [matchedSites, setMatchedSites] = useState<HistoricalSite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useLanguage();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
        setMatchedSites([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      // Извлекаем base64 данные из data URL
      const base64Data = image.split(',')[1];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `Analyze this image. If this is a historical site, monument, fortress, or landmark from Uzbekistan (especially Karakalpakstan/Khwarezm region), identify it.

Look for these specific sites:
- Ayaz-Kala (fortresses in desert)
- Toprak-Kala (ancient city ruins)
- Kyzyl-Kala (red fortress)
- Janbas-Kala
- Koy-Krylgan-Kala
- Chilpyk (Zoroastrian tower)
- Mizdakhan necropolis
- Gyaur-Kala
- Ancient Khorezm fortresses

Respond in this exact format:
SITE_NAME: [name of the site or "unknown"]
CONFIDENCE: [high/medium/low]
DESCRIPTION: [brief description of what you see]

If you cannot identify the location or it's not a historical site, respond with SITE_NAME: unknown`
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }]
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setResult(aiResponse);

      // Парсим ответ AI
      const siteNameMatch = aiResponse.match(/SITE_NAME:\s*(.+)/i);
      const siteName = siteNameMatch?.[1]?.trim().toLowerCase() || '';

      if (siteName && siteName !== 'unknown') {
        // Ищем совпадения в базе данных
        const sites = await api.getSites();
        const matched = sites.filter((site: HistoricalSite) => {
          const nameRu = site.name_ru?.toLowerCase() || '';
          const nameEn = site.name_en?.toLowerCase() || '';
          const nameUz = site.name_uz?.toLowerCase() || '';

          return nameRu.includes(siteName) ||
                 nameEn.includes(siteName) ||
                 nameUz.includes(siteName) ||
                 siteName.includes(nameRu.split(' ')[0]) ||
                 siteName.includes(nameEn.split(' ')[0]) ||
                 // Проверка ключевых слов
                 (siteName.includes('kyzyl') && (nameRu.includes('кызыл') || nameEn.includes('kyzyl'))) ||
                 (siteName.includes('ayaz') && (nameRu.includes('аяз') || nameEn.includes('ayaz'))) ||
                 (siteName.includes('toprak') && (nameRu.includes('топрак') || nameEn.includes('toprak'))) ||
                 (siteName.includes('chilpyk') && (nameRu.includes('чилпык') || nameEn.includes('chilpyk'))) ||
                 (siteName.includes('mizdakhan') && (nameRu.includes('миздахан') || nameEn.includes('mizdakhan')));
        });

        setMatchedSites(matched);
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(t(
        'Xatolik yuz berdi. API kalitini tekshiring.',
        'Ошибка анализа. Проверьте API ключ.',
        'Error analyzing image. Check API key.'
      ));
    } finally {
      setLoading(false);
    }
  };

  const getName = (site: HistoricalSite) => {
    switch (lang) {
      case 'uz': return site.name_uz;
      case 'en': return site.name_en;
      default: return site.name_ru;
    }
  };

  return (
    <div className="image-search-overlay" onClick={onClose}>
      <div className="image-search-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XIcon /></button>

        <h2>{t("Rasm bo'yicha qidirish", "Поиск по фото", "Search by Image")}</h2>
        <p className="image-search-hint">
          {t(
            "Tarixiy joy rasmini yuklang va AI uni aniqlaydi",
            "Загрузите фото достопримечательности и AI определит её",
            "Upload a photo of a landmark and AI will identify it"
          )}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {!image ? (
          <div
            className="image-upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon"><CameraIcon /></div>
            <p>{t("Rasm yuklash uchun bosing", "Нажмите чтобы загрузить фото", "Click to upload image")}</p>
            <small>{t("yoki sudrab tashlang", "или перетащите сюда", "or drag and drop")}</small>
          </div>
        ) : (
          <div className="image-preview-container">
            <img src={image} alt="Preview" className="image-preview" />
            <button
              className="change-image-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              {t("Boshqa rasm", "Другое фото", "Change image")}
            </button>
          </div>
        )}

        {image && !loading && !result && (
          <button className="btn btn-primary btn-large" onClick={analyzeImage}>
            {t("AI bilan aniqlash", "Определить с AI", "Identify with AI")}
          </button>
        )}

        {loading && (
          <div className="analyzing-status">
            <div className="spinner"></div>
            <p>{t("Tahlil qilinmoqda...", "Анализируем...", "Analyzing...")}</p>
          </div>
        )}

        {error && (
          <div className="image-search-error">
            {error}
          </div>
        )}

        {result && (
          <div className="ai-result">
            <h4>{t("AI natijasi", "Результат AI", "AI Result")}</h4>
            <pre>{result}</pre>
          </div>
        )}

        {matchedSites.length > 0 && (
          <div className="matched-sites">
            <h4>{t("Topilgan joylar", "Найденные места", "Found locations")}</h4>
            {matchedSites.map((site) => (
              <div
                key={site.id}
                className="matched-site-item"
                onClick={() => {
                  onSiteFound(site.id);
                  onClose();
                }}
              >
                <div
                  className="site-color-indicator"
                  style={{ background: site.category?.color || '#3B82F6' }}
                />
                <div className="matched-site-info">
                  <strong>{getName(site)}</strong>
                  <small>
                    {lang === 'uz' ? site.category?.name_uz :
                     lang === 'en' ? site.category?.name_en : site.category?.name_ru}
                  </small>
                </div>
                <span className="view-arrow"><ArrowRightIcon /></span>
              </div>
            ))}
          </div>
        )}

        {result && matchedSites.length === 0 && !error && (
          <div className="no-match-message">
            {t(
              "Afsuski, bu joy bazamizda topilmadi",
              "К сожалению, это место не найдено в нашей базе",
              "Unfortunately, this location was not found in our database"
            )}
          </div>
        )}
      </div>
    </div>
  );
}
