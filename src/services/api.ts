const API_URL = 'https://akkanat.pythonanywhere.com/api';

export const api = {
  async getCategories() {
    const res = await fetch(`${API_URL}/categories/`);
    return res.json();
  },

  async getSites() {
    const res = await fetch(`${API_URL}/sites/`);
    return res.json();
  },

  async getSite(id: number) {
    const res = await fetch(`${API_URL}/sites/${id}/`);
    return res.json();
  },

  async getMapMarkers() {
    const res = await fetch(`${API_URL}/sites/map_markers/`);
    return res.json();
  },

  async searchSites(query: string, lang: string = 'ru') {
    const res = await fetch(`${API_URL}/sites/search/?q=${encodeURIComponent(query)}&lang=${lang}`);
    return res.json();
  },

  async getSiteGuides(siteId: number) {
    const res = await fetch(`${API_URL}/sites/${siteId}/guides/`);
    return res.json();
  },

  async getGuides() {
    const res = await fetch(`${API_URL}/guides/`);
    return res.json();
  },

  async getGuide(id: number) {
    const res = await fetch(`${API_URL}/guides/${id}/`);
    return res.json();
  },

  async getGuideReviews(guideId: number) {
    const res = await fetch(`${API_URL}/guides/${guideId}/reviews/`);
    return res.json();
  },

  async registerGuide(data: {
    username: string;
    email: string;
    password: string;
    phone: string;
    full_name: string;
    bio?: string;
    languages: string[];
    experience_years: number;
    price_per_hour: number;
    average_tour_duration: number;
    specialization_site_ids: number[];
  }) {
    const res = await fetch(`${API_URL}/guides/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
