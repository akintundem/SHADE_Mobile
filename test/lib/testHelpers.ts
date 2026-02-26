/**
 * Shared test helpers for E2E tests
 */

import { authService } from '../../core/auth/services/authService';
import { eventService } from '../../core/events/services/event';
import { EventType, EventAccessType, CreateEventRequest } from '../../core/events/types/event';
import { JitSignupRequest } from '../../core/auth/types/auth';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import { sleep } from './delay';

/**
 * Build a test event payload
 */
export function buildEventPayload(prefix: string = 'E2E Test Event'): CreateEventRequest {
  const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  return {
    name: `${prefix} ${Date.now()}`,
    description: 'Created by E2E integration tests',
    eventType: EventType.CONFERENCE,
    startDateTime: start.toISOString().slice(0, 19),
    endDateTime: end.toISOString().slice(0, 19),
    venueRequirements: 'Test venue',
    capacity: 50,
    isPublic: true,
    requiresApproval: false,
    eventWebsiteUrl: 'https://example.com',
    hashtag: '#E2ETest',
    // Use INVITE_ONLY to allow attendee invites in tests
    accessType: EventAccessType.INVITE_ONLY,
    venue: {
      address: '123 Test St',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      zipCode: '94102',
      latitude: 37.7749,
      longitude: -122.4194,
    },
  };
}

/**
 * Authenticate and handle onboarding
 */
export async function authenticateAndOnboard(
  email: string,
  password: string
): Promise<{ userId: string; user: SecureUserResponse; isOnboarded: boolean }> {
  // Add small delay to avoid rate limiting
  await sleep(500);
  
  // Sign in
  const signInResult = await authService.signIn({ email, password });
  let user = signInResult.user;
  let isOnboarded = !signInResult.onboardingRequired;

  // Complete onboarding if needed
  if (signInResult.onboardingRequired) {
    console.log('[Test Setup] User needs onboarding, completing now...');
    try {
      const signupRequest: JitSignupRequest = {
        email: user.email,
        name: user.name || 'Test User',
        username: user.username || `testuser_${Date.now()}`,
        phoneNumber: '+15555550123',
        acceptTerms: true,
        acceptPrivacy: true,
        marketingOptIn: false,
      };
      const session = await authService.completeSignup(signupRequest);
      user = session.user;
      isOnboarded = !session.onboardingRequired;
      console.log('[Test Setup] Onboarding completed successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Test Setup] Failed to complete onboarding:', errorMessage);
      // Continue anyway - user might already be onboarded
    }
  }

  return {
    userId: user.id,
    user,
    isOnboarded,
  };
}

/**
 * Get or create an event for testing
 */
export async function getOrCreateTestEvent(): Promise<string | null> {
  const existingEventId = process.env.TEST_EVENT_ID?.trim() || null;
  
  if (existingEventId) {
    console.log(`[Test Setup] Using existing event: ${existingEventId}`);
    return existingEventId;
  }

  console.log('[Test Setup] TEST_EVENT_ID not set, creating test event...');
  try {
    // Add small delay to avoid rate limiting
    await sleep(500);
    
    const eventPayload = buildEventPayload();
    const idempotencyKey = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const createdEvent = await eventService.createEvent(eventPayload, idempotencyKey);
    console.log(`[Test Setup] Created test event: ${createdEvent.id}`);
    return createdEvent.id;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Test Setup] Failed to create test event:', errorMessage);
    return null;
  }
}
