/**
 * Attendee related types
 */

export type Attendee = {
  attendeeId: string;
  eventId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  registrationDate: string;
  status: 'registered' | 'confirmed' | 'cancelled' | 'attended';
  dietaryRestrictions?: string[];
  emergencyContact?: EmergencyContact;
  ticketType?: string;
  notes?: string;
};

export type AttendeeDTO = {
  id: string;
  eventId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  registrationDate: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'ATTENDED';
  checkInTime?: string;
  dietaryRestrictions?: string;
  emergencyContact?: string;
  notes?: string;
};

export type EmergencyContact = {
  name: string;
  phone: string;
  relationship: string;
};
