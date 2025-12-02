/**
 * Vendor related types
 */

import { Location } from './events';

export type Vendor = {
  vendorId: string;
  name: string;
  description: string;
  category: string;
  location: Location;
  contactInfo: ContactInfo;
  rating: number;
  priceRange: string;
  availability: string[];
  services: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  website?: string;
  socialMedia?: Record<string, string>;
};
