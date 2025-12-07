import React, { useState } from 'react';
import Map from '../components/Map';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SiteCard from '../components/SiteCard';
import GuideCard from '../components/GuideCard';
import GuideRegistration from '../components/GuideRegistration';
import LandingOverlay from '../components/LandingOverlay';
import AIChat from '../components/AIChat';
import { Guide } from '../types';

const HomePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showGuideRegistration, setShowGuideRegistration] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const handleSiteSelect = (siteId: number) => {
    setSelectedSiteId(siteId);
    setSelectedGuide(null);
    setShowLanding(false);
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

  const handleEnterMap = () => {
    setShowLanding(false);
  };

  return (
    <div className="app">
      {!showLanding && (
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onSiteSelect={handleSiteSelect}
        />
      )}

      <div className="main-content" style={{ marginTop: showLanding ? 0 : undefined }}>
        {!showLanding && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSiteSelect={handleSiteSelect}
          />
        )}

        <div className="map-container">
          <Map
            onSiteSelect={handleSiteSelect}
            selectedSiteId={selectedSiteId}
            isLandingMode={showLanding}
          />
        </div>

        {/* Landing Overlay с матовым стеклом и поиском */}
        {showLanding && (
          <LandingOverlay
            onEnter={handleEnterMap}
            onSiteSelect={handleSiteSelect}
          />
        )}

        {!showLanding && selectedSiteId && !selectedGuide && (
          <SiteCard
            siteId={selectedSiteId}
            onClose={handleCloseSiteCard}
            onGuideSelect={handleGuideSelect}
          />
        )}

        {!showLanding && selectedGuide && (
          <GuideCard
            guide={selectedGuide}
            siteId={selectedSiteId ?? undefined}
            onClose={handleCloseGuideCard}
          />
        )}

        {/* Кнопка регистрации гида */}
        {!showLanding && (
          <button
            className="guide-register-btn"
            onClick={() => setShowGuideRegistration(true)}
          >
            Стать гидом
          </button>
        )}

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
              alert('Регистрация успешна! Ваш профиль будет активирован после проверки администратором.');
            }}
          />
        )}

        {/* AI Chat (показываем когда не landing) */}
        {!showLanding && <AIChat />}
      </div>
    </div>
  );
};

export default HomePage;
