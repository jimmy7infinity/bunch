import axios from 'axios';

const TENOR_API_KEY = 'AIzaSyCAis3__EqKPLZ60xNv6SZJWMIZxtdfczo';
const TENOR_BASE_URL = 'https://tenor.googleapis.com/v2';

export interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    gif: {
      url: string;
      dims: [number, number];
      size: number;
    };
    tinygif: {
      url: string;
      dims: [number, number];
      size: number;
    };
  };
}

export const tenorService = {
  async searchGifs(query: string, limit = 20): Promise<TenorGif[]> {
    try {
      const response = await axios.get(`${TENOR_BASE_URL}/search`, {
        params: {
          q: query,
          key: TENOR_API_KEY,
          limit,
          media_filter: 'gif,tinygif',
        },
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to search GIFs:', error);
      return [];
    }
  },

  async getFeaturedGifs(limit = 20): Promise<TenorGif[]> {
    try {
      const response = await axios.get(`${TENOR_BASE_URL}/featured`, {
        params: {
          key: TENOR_API_KEY,
          limit,
          media_filter: 'gif,tinygif',
        },
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to get featured GIFs:', error);
      return [];
    }
  },

  async getTrendingSearchTerms(): Promise<string[]> {
    try {
      const response = await axios.get(`${TENOR_BASE_URL}/trending_terms`, {
        params: {
          key: TENOR_API_KEY,
        },
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to get trending terms:', error);
      return [];
    }
  },
};

