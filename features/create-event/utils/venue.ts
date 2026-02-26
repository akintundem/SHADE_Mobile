import type { CreateEventRequest } from '../../../core/events/types/event';
import type { CreateEventVenue } from '../types';

export function sanitizeVenue(venue: CreateEventVenue | null): CreateEventRequest['venue'] | undefined {
  if (!venue) return undefined;

  const venueFields: CreateEventRequest['venue'] = {
    address: venue.address,
    city: venue.city,
    state: venue.state,
    country: venue.country,
    zipCode: venue.zipCode,
    latitude: venue.latitude,
    longitude: venue.longitude,
    googlePlaceId: venue.googlePlaceId,
    googlePlaceData: venue.googlePlaceData,
  };

  const filtered = Object.fromEntries(
    Object.entries(venueFields).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

  return Object.keys(filtered).length > 0
    ? (filtered as CreateEventRequest['venue'])
    : undefined;
}

export function formatVenueLocation(venue: CreateEventVenue | null): string {
  if (!venue?.address) return 'Location not set';
  const parts = [];
  if (venue.address) parts.push(venue.address);
  if (venue.city) parts.push(venue.city);
  if (venue.state) parts.push(venue.state);
  return parts.join(', ');
}
