import { API_URL, buildApiUrl, API_ROUTES } from "../config/api";

// Options par défaut pour fetch
const defaultOptions = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Pour gérer les cookies
};

// Service API
const apiService = {
  // Méthode générique pour les appels API
  async fetchApi(endpoint, options = {}) {
    try {
      const url = buildApiUrl(endpoint);
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Une erreur est survenue");
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur API:", error);
      throw error;
    }
  },

  // Méthodes pour l'authentification
  auth: {
    login: (credentials) =>
      apiService.fetchApi(API_ROUTES.AUTH.LOGIN, {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    logout: () =>
      apiService.fetchApi(API_ROUTES.AUTH.LOGOUT, {
        method: "POST",
      }),

    me: () => apiService.fetchApi(API_ROUTES.AUTH.ME),
  },

  // Méthodes pour les demandes
  demandes: {
    list: () => apiService.fetchApi(API_ROUTES.DEMANDES.LIST),

    create: (data) =>
      apiService.fetchApi(API_ROUTES.DEMANDES.CREATE, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    get: (id) => apiService.fetchApi(API_ROUTES.DEMANDES.GET(id)),

    addMessage: (id, message) =>
      apiService.fetchApi(API_ROUTES.DEMANDES.MESSAGE(id), {
        method: "POST",
        body: JSON.stringify(message),
      }),

    cloturer: (id, data) =>
      apiService.fetchApi(API_ROUTES.DEMANDES.CLOTURER(id), {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Méthodes pour l'administration
  admin: {
    getUsers: () => apiService.fetchApi(API_ROUTES.ADMIN.USERS),

    createUser: (userData) =>
      apiService.fetchApi(API_ROUTES.ADMIN.CREATE_USER, {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    toggleUser: (userId) =>
      apiService.fetchApi(API_ROUTES.ADMIN.TOGGLE_USER(userId), {
        method: "PUT",
      }),

    deleteUser: (userId) =>
      apiService.fetchApi(API_ROUTES.ADMIN.DELETE_USER(userId), {
        method: "DELETE",
      }),
  },

  // Méthodes pour les statistiques
  stats: {
    getParCommune: () => apiService.fetchApi(API_ROUTES.STATS.PAR_COMMUNE),
    getParTheme: () => apiService.fetchApi(API_ROUTES.STATS.PAR_THEME),
    getSatisfaction: () => apiService.fetchApi(API_ROUTES.STATS.SATISFACTION),
  },
};

export default apiService;
