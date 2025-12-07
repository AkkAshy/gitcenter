import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMap, HiUserGroup, HiCamera, HiCalendar } from 'react-icons/hi';
import './DemoPage.css';

// Wrappers для react-icons (совместимость с React 19)
const MapIcon = () => React.createElement(HiMap as React.ComponentType);
const GuidesIcon = () => React.createElement(HiUserGroup as React.ComponentType);
const CameraIcon = () => React.createElement(HiCamera as React.ComponentType);
const CalendarIcon = () => React.createElement(HiCalendar as React.ComponentType);

interface DemoContent {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  video: string | null;
  created_at: string;
}

const API_URL = 'https://akkanat.pythonanywhere.com';

const DemoPage: React.FC = () => {
  const [demoContent, setDemoContent] = useState<DemoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDemoContent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/demo/`);
        if (response.ok) {
          const data = await response.json();
          setDemoContent(data);
        } else {
          setError('Контент не найден');
        }
      } catch (err) {
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchDemoContent();
  }, []);

  return (
    <div className="demo-page">
      <header className="demo-header">
        <Link to="/" className="demo-logo">
          Khakaton
        </Link>
        <Link to="/" className="back-btn">
          На главную
        </Link>
      </header>

      <main className="demo-content">
        <section className="demo-hero">
          <h1>{demoContent?.title || 'Добро пожаловать в Khakaton'}</h1>
          <p className="demo-subtitle">
            {demoContent?.subtitle || 'Ваш путеводитель по удивительным местам Каракалпакстана'}
          </p>
        </section>

        <section className="demo-video-section">
          <h2>Посмотрите, как это работает</h2>
          <div className="video-container">
            {loading ? (
              <div className="video-placeholder">
                <p>Загрузка...</p>
              </div>
            ) : demoContent?.video ? (
              <video
                controls
                className="demo-video"
                poster=""
              >
                <source src={demoContent.video} type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
            ) : (
              <div className="video-placeholder">
                <p>{error || 'Видео скоро появится'}</p>
              </div>
            )}
          </div>
          {demoContent?.description && (
            <p className="demo-description">{demoContent.description}</p>
          )}
        </section>

        <section className="demo-features">
          <h2>Что мы предлагаем</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><MapIcon /></div>
              <h3>Интерактивная карта</h3>
              <p>
                Исследуйте достопримечательности Каракалпакстана на интерактивной карте.
                Находите интересные места рядом с вами.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><GuidesIcon /></div>
              <h3>Профессиональные гиды</h3>
              <p>
                Найдите опытных гидов, которые покажут вам самые красивые места
                и расскажут их историю.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><CameraIcon /></div>
              <h3>Поиск по фото</h3>
              <p>
                Загрузите фотографию места - и мы найдём его на карте
                и расскажем всё о нём.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><CalendarIcon /></div>
              <h3>Онлайн бронирование</h3>
              <p>
                Бронируйте экскурсии онлайн. Безопасная оплата
                и мгновенное подтверждение.
              </p>
            </div>
          </div>
        </section>

        <section className="demo-cta">
          <h2>Готовы начать путешествие?</h2>
          <Link to="/" className="cta-button">
            Перейти к карте
          </Link>
        </section>
      </main>

      <footer className="demo-footer">
        <p>&copy; 2025 Khakaton. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default DemoPage;
