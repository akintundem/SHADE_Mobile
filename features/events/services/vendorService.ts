import { http } from '../../../common/services/httpClient';
import { ApiResponse } from '../../auth/types/auth';
import { Vendor, Location, ContactInfo } from '../types/vendors';

export type CreateVendorRequest = {
  name: string;
  description: string;
  category: string;
  location: Location;
  contactInfo: ContactInfo;
  priceRange: string;
  availability: string[];
  services: string[];
  images: string[];
};

export type VendorSearchFilters = {
  category?: string;
  location?: string;
  priceRange?: { min: number; max: number };
  rating?: { min: number };
  availability?: string[];
  services?: string[];
};

export const vendorService = {
  // Vendor CRUD operations
  async createVendor(request: CreateVendorRequest) {
    const res = await http.post<ApiResponse<Vendor>>('/api/v1/vendors', request);
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to create vendor');
  },

  async getVendor(vendorId: string) {
    const res = await http.get<ApiResponse<Vendor>>(`/api/v1/vendors/${vendorId}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get vendor');
  },

  async updateVendor(vendorId: string, updates: Partial<CreateVendorRequest>) {
    const res = await http.put<ApiResponse<Vendor>>(`/api/v1/vendors/${vendorId}`, updates);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to update vendor');
  },

  async deleteVendor(vendorId: string) {
    const res = await http.delete<ApiResponse<null>>(`/api/v1/vendors/${vendorId}`);
    const body = res.data;
    if (body.status === 200) {
      return true;
    }
    throw new Error(body.message || 'Failed to delete vendor');
  },

  async getVendors(params?: {
    page?: number;
    size?: number;
    category?: string;
    location?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.location) queryParams.append('location', params.location);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/v1/vendors?${queryString}` : '/api/v1/vendors';
    
    const res = await http.get<ApiResponse<{ vendors: Vendor[]; total: number; page: number; size: number }>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get vendors');
  },

  // Search and filtering
  async searchVendors(query: string, filters?: VendorSearchFilters) {
    const searchParams = new URLSearchParams({ q: query });
    if (filters?.category) searchParams.append('category', filters.category);
    if (filters?.location) searchParams.append('location', filters.location);
    if (filters?.priceRange) {
      searchParams.append('minPrice', filters.priceRange.min.toString());
      searchParams.append('maxPrice', filters.priceRange.max.toString());
    }
    if (filters?.rating) {
      searchParams.append('minRating', filters.rating.min.toString());
    }
    if (filters?.availability) {
      filters.availability.forEach(avail => searchParams.append('availability', avail));
    }
    if (filters?.services) {
      filters.services.forEach(service => searchParams.append('services', service));
    }

    const res = await http.get<ApiResponse<{ vendors: Vendor[]; total: number }>>(`/api/v1/vendors/search?${searchParams.toString()}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to search vendors');
  },

  async getVendorsByCategory(category: string) {
    const res = await http.get<ApiResponse<Vendor[]>>(`/api/v1/vendors/category/${category}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get vendors by category');
  },

  async getVendorsByLocation(location: string) {
    const res = await http.get<ApiResponse<Vendor[]>>(`/api/v1/vendors/location/${location}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get vendors by location');
  },

  async getVendorsByPriceRange(minPrice: number, maxPrice: number) {
    const res = await http.get<ApiResponse<Vendor[]>>(`/api/v1/vendors/price-range?min=${minPrice}&max=${maxPrice}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get vendors by price range');
  },

  // Vendor ratings and reviews
  async getVendorRatings(vendorId: string) {
    const res = await http.get<ApiResponse<{
      averageRating: number;
      totalReviews: number;
      ratingBreakdown: Record<string, number>;
      reviews: Array<{
        reviewId: string;
        userId: string;
        rating: number;
        comment: string;
        createdAt: string;
      }>;
    }>>(`/api/v1/vendors/${vendorId}/ratings`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get vendor ratings');
  },

  async addVendorRating(vendorId: string, rating: number, comment?: string) {
    const res = await http.post<ApiResponse<{ reviewId: string }>>(`/api/v1/vendors/${vendorId}/ratings`, {
      rating,
      comment,
    });
    const body = res.data;
    if (body.status === 201 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to add vendor rating');
  },

  // Vendor availability
  async checkVendorAvailability(vendorId: string, dateRange: { start: string; end: string }) {
    const res = await http.post<ApiResponse<{ available: boolean; conflicts: string[] }>>(`/api/v1/vendors/${vendorId}/availability`, dateRange);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to check vendor availability');
  },

  // Vendor categories
  async getVendorCategories() {
    const res = await http.get<ApiResponse<string[]>>('/api/v1/vendors/categories');
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get vendor categories');
  },

  // Health check
  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/vendors/actuator/health');
    return res.data;
  },
};
