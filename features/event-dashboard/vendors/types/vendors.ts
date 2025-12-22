export type Vendor = {
  vendorId: string;
  name: string;
  description?: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  rating?: number;
  priceRange?: string;
  availability?: string[];
  services?: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
};

