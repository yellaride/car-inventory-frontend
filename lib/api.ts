import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Car {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'SALVAGE' | 'JUNK';
  mileage?: number;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  coverImage?: string;
  vinData?: any;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy?: string;
  isArchived: boolean;
  media?: Media[];
  remarks?: Remark[];
  damages?: Damage[];
  _count?: {
    media: number;
    remarks: number;
    damages: number;
  };
}

export interface Media {
  id: string;
  carId: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  category?: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  resolution?: string;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  uploadedAt: string;
  uploadedBy: string;
}

export interface Remark {
  id: string;
  carId: string;
  text: string;
  type?: 'INSPECTION' | 'REPAIR' | 'NOTE' | 'CUSTOMER_COMPLAINT';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface Damage {
  id: string;
  carId: string;
  part: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'TOTAL_LOSS';
  description: string;
  estimatedCost?: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Functions
export const carsApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Car>> => {
    const { data } = await api.get('/cars', { params });
    return data;
  },

  getById: async (id: string): Promise<Car> => {
    const { data } = await api.get(`/cars/${id}`);
    return data;
  },

  getByVin: async (vin: string): Promise<Car> => {
    const { data } = await api.get(`/cars/vin/${vin}`);
    return data;
  },

  create: async (car: Partial<Car>): Promise<Car> => {
    const { data } = await api.post('/cars', car);
    return data;
  },

  update: async (id: string, car: Partial<Car>): Promise<Car> => {
    const { data } = await api.patch(`/cars/${id}`, car);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cars/${id}/permanent`);
  },

  decodeVin: async (vin: string): Promise<any> => {
    const { data } = await api.post('/cars/decode-vin', { vin });
    return data;
  },

  getStats: async (): Promise<any> => {
    const { data } = await api.get('/cars/stats');
    return data;
  },
};

export const searchApi = {
  search: async (params: any): Promise<PaginatedResponse<Car>> => {
    const { data } = await api.get('/search', { params });
    return data;
  },

  getFilterOptions: async (): Promise<any> => {
    const { data } = await api.get('/search/filter-options');
    return data;
  },
};

export const remarksApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Remark>> => {
    const { data } = await api.get('/remarks', { params });
    return data;
  },

  getByCarId: async (carId: string): Promise<Remark[]> => {
    const { data } = await api.get(`/remarks/car/${carId}`);
    return data;
  },

  create: async (remark: Partial<Remark>): Promise<Remark> => {
    const { data } = await api.post('/remarks', remark);
    return data;
  },

  update: async (id: string, remark: Partial<Remark>): Promise<Remark> => {
    const { data } = await api.patch(`/remarks/${id}`, remark);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/remarks/${id}`);
  },
};

export const mediaApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Media>> => {
    const { data } = await api.get('/media', { params });
    return data;
  },

  getByCarId: async (carId: string): Promise<Media[]> => {
    const { data } = await api.get(`/media/car/${carId}`);
    return data;
  },

  generateUploadUrl: async (payload: {
    carId: string;
    type: string;
    fileName: string;
    category?: string;
  }): Promise<{ mediaId: string; uploadUrl: string; fileUrl: string }> => {
    const { data } = await api.post('/media/upload-url', payload);
    return data;
  },

  upload: async (file: File, carId: string, type: string, category?: string): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('carId', carId);
    formData.append('type', type);
    if (category) formData.append('category', category);

    const { data } = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/media/${id}`);
  },
};
