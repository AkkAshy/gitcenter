import React, { useState } from 'react';
import './App.css';
import { LanguageProvider } from './context/LanguageContext';
import Map from './components/Map';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SiteCard from './components/SiteCard';
import GuideCard from './components/GuideCard';
import GuideRegistration from './components/GuideRegistration';
import { Guide } from './types';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showGuideRegistration, setShowGuideRegistration] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSiteSelect = (siteId: number) => {
    setSelectedSiteId(siteId);
    setSelectedGuide(null);
  };

  const handleCloseSiteCard = () => {
    setSelectedSiteId(null);
  };

  const handleGuideSelect = (guide: Guide) => {
    setSelectedGuide(guide);
  };

  const handleCloseGuideCard = () => {
    setSelectedGuide(null);
  };

  return (
    <LanguageProvider>
      <div className="app">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onSiteSelect={handleSiteSelect}
        />

        <div className="main-content">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSiteSelect={handleSiteSelect}
          />

          <div className="map-container">
            <Map
              onSiteSelect={handleSiteSelect}
              selectedSiteId={selectedSiteId}
            />
          </div>

          {selectedSiteId && !selectedGuide && (
            <SiteCard
              siteId={selectedSiteId}
              onClose={handleCloseSiteCard}
              onGuideSelect={handleGuideSelect}
            />
          )}

          {selectedGuide && (
            <GuideCard
              guide={selectedGuide}
              onClose={handleCloseGuideCard}
            />
          )}

          {/* Кнопка регистрации гида */}
          <button
            className="guide-register-btn"
            onClick={() => setShowGuideRegistration(true)}
          >
            Стать гидом
          </button>

          {/* Модальное окно регистрации */}
          {showGuideRegistration && (
            <GuideRegistration
              onClose={() => {
                setShowGuideRegistration(false);
                setRegistrationSuccess(false);
              }}
              onSuccess={() => {
                setRegistrationSuccess(true);
                setShowGuideRegistration(false);
                // Показываем сообщение об успехе
                alert('Регистрация успешна! Ваш профиль будет активирован после проверки администратором.');
              }}
            />
          )}
        </div>
      </div>
    </LanguageProvider>
  );
}

export default App;
