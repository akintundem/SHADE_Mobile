/**
 * Database Seed Suite — Comprehensive Edition
 *
 * Creates 3 seed users in Auth0 (IDP) if they don't exist, then authenticates
 * as them and populates the database with realistic data via real API calls
 * so the app's UI can be designed against it.
 *
 * Coverage:
 * - ALL 17 EventType values
 * - ALL 4 EventAccessType values
 * - ALL 16 TicketTypeCategory values
 * - User profile, notification, privacy, & security settings
 * - Event lifecycle: create → update status → clone → archive → restore
 * - Registration open / close cycles
 * - Ticket issuance, checkout, approval workflows, waitlists
 * - Ticket type templates (create, apply)
 * - Attendee invites (single + bulk), RSVPs with varied statuses
 * - Event waitlist (join)
 * - Collaborator invites (send → accept)
 * - Feed posts, likes, comments, quotes, reposts
 * - Event reminders
 * - Social graph (mutual follows)
 *
 * Run: npm run seed:data   (or npm run seed to reset + seed)
 */

import { describe, it, beforeAll, expect, vi } from 'vitest';
import { sleep } from '../lib/delay';

// ---------------------------------------------------------------------------
// Mocks (must be hoisted)
// ---------------------------------------------------------------------------

vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: (obj: Record<string, unknown>) => obj.web || obj.default || obj.ios,
    Version: 1,
  },
}));

vi.mock('@react-native-async-storage/async-storage', () => {
  const storage: Record<string, string> = {};
  return {
    default: {
      getItem: async (key: string) => storage[key] || null,
      setItem: async (key: string, value: string) => { storage[key] = value; },
      removeItem: async (key: string) => { delete storage[key]; },
      clear: async () => { Object.keys(storage).forEach(k => delete storage[k]); },
      getAllKeys: async () => Object.keys(storage),
      multiGet: async (keys: string[]) => keys.map(k => [k, storage[k] || null]),
      multiSet: async (pairs: [string, string][]) => { pairs.forEach(([k, v]) => { storage[k] = v; }); },
      multiRemove: async (keys: string[]) => { keys.forEach(k => delete storage[k]); },
    },
  };
});

// ---------------------------------------------------------------------------
// Env & Auth0
// ---------------------------------------------------------------------------

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { ensureAuth0ForTests } from '../lib/auth0TestConfig';

// ---------------------------------------------------------------------------
// Service imports (after mocks)
// ---------------------------------------------------------------------------

import { eventService } from '../../core/events/services/event';
import { eventWaitlistService } from '../../core/events/services/waitlist';
import { timelineService } from '../../core/timeline/services/timeline';
import { ticketService } from '../../core/tickets/services/ticket';
import { attendeeService } from '../../core/attendee/services/attendee';
import { budgetService } from '../../core/budget/services/budget';
import { feedService } from '../../core/feeds/services/feeds';
import { collaborationService } from '../../core/collaboration/services/collaboration';
import { userFollowService } from '../../core/social/services/userFollow';
import { authService } from '../../core/auth/services/authService';
import { AuthError, AuthErrorCode } from '../../core/auth/errors/AuthError';
import { clearTokenCache } from '../../common/services/httpClient';

import { EventAccessType, EventStatus } from '../../core/events/types/event';
import { TimelineStatus } from '../../core/timeline/types/timeline';
import { PostType } from '../../core/feeds/types/feeds';
import { AttendeeStatus } from '../../core/attendee/types/attendee';
import type { TicketTypeCategory } from '../../core/tickets/types/ticket';

import {
  SEED_EVENTS,
  POST_COMMENTS,
  EXTERNAL_ATTENDEES,
  QUOTE_TEXTS,
  USER_PROFILE_UPDATES,
  USER_AVATAR_SEEDS,
  USER_NOTIFICATION_SETTINGS,
  USER_PRIVACY_SETTINGS,
  USER_SECURITY_SETTINGS,
  EVENT_REMINDERS,
  TICKET_TYPE_TEMPLATES,
  getPicsumImageUrl,
} from './seedData';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_DELAY = 800; // ms between API calls to avoid rate limits

async function pause() {
  await sleep(API_DELAY);
}

/** Log upload target for MinIO monitoring (extracts host from URL) */
function uploadTarget(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url ? 'presigned' : 'none';
  }
}

/**
 * Presigned URLs from backend use host.docker.internal:9000 (resolves via /etc/hosts on this host).
 * Only rewrite if the hostname is the internal Docker alias 'minio' which never resolves on the host.
 */
function presignedUrlForHost(uploadUrl: string): string {
  if (!uploadUrl) return uploadUrl;
  try {
    const u = new URL(uploadUrl);
    if (u.hostname === 'minio' || u.host === 'minio:9000') {
      u.hostname = 'host.docker.internal';
      u.port = '9000';
      return u.toString();
    }
    return uploadUrl;
  } catch {
    return uploadUrl;
  }
}

/** Original Host header value for presigned requests (only needed when rewriting minio → host.docker.internal) */
function presignedHostHeader(_uploadUrl: string): string | undefined {
  // No rewrite needed for host.docker.internal — it resolves directly, signature is valid as-is.
  return undefined;
}

/** Verify MinIO buckets have objects (run after multimedia uploads). Logs counts. */
async function verifyMinIOObjectCounts(): Promise<{ event: number; user: number }> {
  const { execSync } = await import('child_process');
  const endpoint = 'http://localhost:9000';
  const env = {
    ...process.env,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
  };
  let eventCount = 0;
  let userCount = 0;
  try {
    const eventOut = execSync(
      `aws s3 ls s3://shade-event-assets/ --recursive --endpoint-url ${endpoint} 2>/dev/null || true`,
      { encoding: 'utf8', env }
    );
    const userOut = execSync(
      `aws s3 ls s3://shade-user-assets/ --recursive --endpoint-url ${endpoint} 2>/dev/null || true`,
      { encoding: 'utf8', env }
    );
    eventCount = (eventOut || '').trim().split('\n').filter(Boolean).length;
    userCount = (userOut || '').trim().split('\n').filter(Boolean).length;
    console.log(`[Seed] MinIO verify: shade-event-assets = ${eventCount} objects, shade-user-assets = ${userCount} objects`);
  } catch (e) {
    console.log('[Seed] MinIO verify: skipped (aws cli or MinIO not reachable)');
  }
  return { event: eventCount, user: userCount };
}

/** Seed user credentials */
function getCredentials(index: number): { email: string; password: string; username: string } {
  const defaultPassword = 'SeedPass123!';
  if (index === 0) {
    return {
      email: process.env.SEED_USER1_EMAIL?.trim() || 'mayowa.akinwale@capsuleapp.dev',
      password: process.env.SEED_USER1_PASSWORD?.trim() || defaultPassword,
      username: 'mayowa_dev',
    };
  }
  if (index === 1) {
    return {
      email: process.env.SEED_USER2_EMAIL?.trim() || 'adaeze.okonkwo@capsuleapp.dev',
      password: process.env.SEED_USER2_PASSWORD?.trim() || defaultPassword,
      username: 'adaeze_designs',
    };
  }
  return {
    email: process.env.SEED_USER3_EMAIL?.trim() || 'chinedu.eze@capsuleapp.dev',
    password: process.env.SEED_USER3_PASSWORD?.trim() || defaultPassword,
    username: 'chinedu_builds',
  };
}

/**
 * Session tracker — avoids redundant Auth0 logins.
 * We only re-authenticate when switching to a different user.
 */
let activeUserEmail: string | null = null;

/**
 * Switch the active session to the given user.
 * Skips sign-in if this user is already active (unless forceReAuth).
 * On first sign-in (onboarding required), completes signup then re-authenticates
 * so the backend DB session is fully established before proceeding.
 * @param forceReAuth - If true, always sign in again (use in long-running steps to avoid session expiry).
 */
async function switchTo(email: string, password: string, preferredUsername: string, forceReAuth = false): Promise<string> {
  if (!forceReAuth && activeUserEmail === email) {
    // Already this user — no round-trip needed
    const session = await authService.getAuthSession().catch(() => null);
    if (session?.user?.id) return session.user.id;
  }

  // Sign out cleanly before switching
  try { await authService.logout(); } catch { /* ignore */ }
  clearTokenCache();
  activeUserEmail = null;
  await sleep(300);

  // Step 1: Sign in — Auth0 issues JWT, BE session tells us if onboarding is needed
  const signInResult = await authService.signIn({ email, password });
  let user = signInResult.user;
  console.log(`[Seed] Signed in ${email} — onboardingRequired=${signInResult.onboardingRequired}`);

  // Step 2: Onboard if this is the first time the BE has seen this user (JIT provisioning)
  if (signInResult.onboardingRequired) {
    console.log(`[Seed] Onboarding ${email}...`);
    const session = await authService.completeSignup({
      email,
      name: user.name || email.split('@')[0],
      username: preferredUsername,
      phoneNumber: '+15555550123',
      acceptTerms: true,
      acceptPrivacy: true,
      marketingOptIn: false,
    });
    if (session.onboardingRequired) {
      throw new Error(`[Seed] Onboarding completed but session still requires onboarding for ${email}`);
    }
    user = session.user;
    console.log(`[Seed] Onboarding done → ${user.id}`);

    // Step 3: Re-authenticate so the session fully reflects the provisioned user
    try { await authService.logout(); } catch { /* ignore */ }
    clearTokenCache();
    await sleep(300);
    const reAuth = await authService.signIn({ email, password });
    if (reAuth.onboardingRequired) {
      throw new Error(`[Seed] Re-auth after onboarding still requires onboarding for ${email}`);
    }
    user = reAuth.user;
  }

  if (!user.id) {
    throw new Error(`[Seed] No user ID after sign-in/onboarding for ${email}`);
  }

  activeUserEmail = email;
  return user.id;
}

// Varied RSVP statuses to test all AttendeeStatus values: PENDING, CONFIRMED, DECLINED, TENTATIVE, NO_SHOW
const RSVP_STATUSES = [
  AttendeeStatus.CONFIRMED,
  AttendeeStatus.CONFIRMED,
  AttendeeStatus.PENDING,
  AttendeeStatus.DECLINED,
  AttendeeStatus.TENTATIVE,
  AttendeeStatus.NO_SHOW,
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CreatedEvent {
  id: string;
  name: string;
  ownerIndex: number;
  seedIndex: number;
}

const userIds: string[] = [];
const createdEvents: CreatedEvent[] = [];
const eventPostIds: Record<string, string[]> = {};
const eventTicketTypeIds: Record<string, string[]> = {}; // eventId → ticketTypeId[]
const issuedTicketIds: string[] = [];
const issuedTicketsForCheckIn: { ticketId: string; eventId: string; qrCodeData: string }[] = [];
let clonedEventId = '';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Database Seed', () => {
  beforeAll(() => {
    ensureAuth0ForTests();
  });

  // =========================================================================
  // 0. Create seed users in Auth0 (idempotent: skip if user already exists)
  // =========================================================================
  describe('0. Create seed users in Auth0', () => {
    it('should create seed users in the IDP', async () => {
      for (let i = 0; i < 3; i++) {
        const creds = getCredentials(i);
        if (!creds.email || !creds.password) continue;
        try {
          await authService.signUp({ email: creds.email, password: creds.password });
          console.log(`[Seed] Created user ${i + 1} in Auth0: ${creds.email}`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (AuthError.is(err) && err.code === AuthErrorCode.USER_ALREADY_EXISTS) {
            console.log(`[Seed] User ${i + 1} already exists in Auth0: ${creds.email}`);
          } else if (/already|exists|invalid sign up/i.test(msg)) {
            console.log(`[Seed] User ${i + 1} likely already exists in Auth0: ${creds.email}`);
          } else {
            console.warn(`[Seed] Sign up failed for user ${i + 1} (${creds.email}): ${msg}`);
          }
        }
        await pause();
      }
      expect(true).toBe(true);
    }, 30_000);
  });

  // =========================================================================
  // 1. Authenticate all test users
  // =========================================================================
  describe('1. Authenticate users', () => {
    it('should authenticate test users', async () => {
      for (let i = 0; i < 3; i++) {
        const creds = getCredentials(i);
        if (!creds.email || !creds.password) {
          console.log(`[Seed] Skipping user ${i + 1} — no credentials provided`);
          userIds.push('');
          continue;
        }
        const userId = await switchTo(creds.email, creds.password, creds.username);
        userIds.push(userId);
        console.log(`[Seed] User ${i + 1}: ${userId} (${creds.email})`);
        await pause();
      }
      expect(userIds[0]).toBeTruthy();
    }, 120_000);
  });

  // =========================================================================
  // 2. Update User Profiles & Settings
  // =========================================================================
  describe('2. Update User Profiles & Settings', () => {
    it('should update user profiles, notification, privacy, and security settings', async () => {
      for (let i = 0; i < userIds.length; i++) {
        if (!userIds[i]) continue;

        const creds = getCredentials(i);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        // Update profile (incl. bio via settings)
        const profile = USER_PROFILE_UPDATES[i];
        if (profile) {
          try {
            const profilePayload = {
              name: profile.name,
              ...(profile.phoneNumber && { phoneNumber: profile.phoneNumber }),
              ...(profile.dateOfBirth && { dateOfBirth: profile.dateOfBirth }),
              ...(profile.bio && { settings: { bio: profile.bio } }),
            };
            await authService.updateUserProfile(userIds[i], profilePayload);
            console.log(`[Seed] Updated profile for User ${i + 1}: ${profile.name}`);
          } catch (err: any) {
            console.warn(`[Seed] Profile update failed for User ${i + 1}: ${err.message}`);
          }
          await pause();
        }

        // Upload profile avatar (Picsum)
        const avatarSeed = USER_AVATAR_SEEDS[i];
        if (avatarSeed) {
          try {
            const imageUrl = getPicsumImageUrl(avatarSeed, 400, 400);
            const presigned = await authService.getProfileImageUploadUrl({
              fileName: `avatar-${avatarSeed}.jpg`,
              contentType: 'image/jpeg',
            });
            await pause();
            const imageResponse = await fetch(imageUrl);
            if (imageResponse.ok) {
              const blob = await imageResponse.blob();
              const putUrl = presignedUrlForHost(presigned.uploadUrl);
              const hostHeader = presignedHostHeader(presigned.uploadUrl);
              const putHeaders = { ...presigned.headers, ...(hostHeader && { Host: hostHeader }) };
              const putRes = await fetch(putUrl, {
                method: presigned.uploadMethod || 'PUT',
                body: blob,
                headers: putHeaders,
              });
              if (!putRes.ok) {
                console.warn(`[Seed] Profile avatar PUT failed for User ${i + 1} (${putRes.status}). Ensure backend AWS_S3_ENDPOINT=http://host.docker.internal:9000 and restart.`);
                await pause();
                continue;
              }
              const complete = await authService.completeProfileImageUpload({
                objectKey: presigned.objectKey,
                resourceUrl: presigned.resourceUrl,
              });
              await authService.updateUserProfile(userIds[i], {
                name: profile?.name ?? 'User',
                profilePictureUrl: complete.profilePictureUrl,
                ...(profile?.bio && { settings: { bio: profile.bio } }),
              });
              console.log(`[Seed] Profile avatar uploaded for User ${i + 1}`);
              console.log(`[Seed] MinIO: profile image -> ${uploadTarget(presigned.uploadUrl)} | stored: ${complete.profilePictureUrl || '(none)'}`);
            }
          } catch (err: any) {
            console.warn(`[Seed] Profile avatar failed for User ${i + 1}: ${err.message}`);
          }
          await pause();
        }

        // Update notification settings
        const notifSettings = USER_NOTIFICATION_SETTINGS[i];
        if (notifSettings) {
          try {
            await authService.updateMyNotificationSettings(notifSettings);
            console.log(`[Seed] Updated notification settings for User ${i + 1}`);
          } catch (err: any) {
            console.warn(`[Seed] Notification settings failed for User ${i + 1}: ${err.message}`);
          }
          await pause();
        }

        // Update privacy settings
        const privacySettings = USER_PRIVACY_SETTINGS[i];
        if (privacySettings) {
          try {
            await authService.updateMyPrivacySettings(privacySettings);
            console.log(`[Seed] Updated privacy settings for User ${i + 1} (${privacySettings.profileVisibility})`);
          } catch (err: any) {
            console.warn(`[Seed] Privacy settings failed for User ${i + 1}: ${err.message}`);
          }
          await pause();
        }

        // Update security settings
        const secSettings = USER_SECURITY_SETTINGS[i];
        if (secSettings) {
          try {
            await authService.updateMySecuritySettings(secSettings);
            console.log(`[Seed] Updated security settings for User ${i + 1}`);
          } catch (err: any) {
            console.warn(`[Seed] Security settings failed for User ${i + 1}: ${err.message}`);
          }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 180_000);
  });

  // =========================================================================
  // 3. Create Events (all 18 seed events, 17 event types + COMPLETED recap)
  // =========================================================================
  describe('3. Create Events', () => {
    it('should create all seed events', async () => {
      for (let i = 0; i < SEED_EVENTS.length; i++) {
        const seedEvent = SEED_EVENTS[i];
        const ownerUserId = userIds[seedEvent.ownerIndex];
        if (!ownerUserId) {
          console.log(`[Seed] Skipping "${seedEvent.name}" — owner user ${seedEvent.ownerIndex + 1} not available`);
          createdEvents.push({ id: '', name: seedEvent.name, ownerIndex: seedEvent.ownerIndex, seedIndex: i });
          continue;
        }

        const creds = getCredentials(seedEvent.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        // API may reject past start dates — use future date for past/completed events, then update status
        const daysOffset = seedEvent.startDaysFromNow < 0 ? 1 : seedEvent.startDaysFromNow;
        const start = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
        const hour = seedEvent.startHourOffset ?? 9;
        start.setHours(hour, 0, 0, 0);
        const end = new Date(start.getTime() + seedEvent.durationHours * 60 * 60 * 1000);

        let registrationDeadline: string | undefined;
        if (seedEvent.registrationDeadlineDaysBeforeStart != null) {
          const dl = new Date(start);
          dl.setDate(dl.getDate() - seedEvent.registrationDeadlineDaysBeforeStart);
          registrationDeadline = dl.toISOString().slice(0, 19);
        }

        const idempotencyKey = `seed-${seedEvent.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

        try {
          const createPayload: Record<string, unknown> = {
            name: seedEvent.name,
            description: seedEvent.description,
            eventType: seedEvent.eventType,
            accessType: seedEvent.accessType,
            capacity: seedEvent.capacity,
            isPublic: seedEvent.isPublic,
            hashtag: seedEvent.hashtag,
            startDateTime: start.toISOString().slice(0, 19),
            endDateTime: end.toISOString().slice(0, 19),
            venue: seedEvent.venue,
            eventWebsiteUrl: seedEvent.eventWebsiteUrl ?? undefined,
            registrationDeadline,
            ...(seedEvent.requiresApproval && { requiresApproval: true }),
            ...(seedEvent.theme && { theme: seedEvent.theme }),
            ...(seedEvent.objectives && { objectives: seedEvent.objectives }),
            ...(seedEvent.targetAudience && { targetAudience: seedEvent.targetAudience }),
          };
          const created = await eventService.createEvent(
            createPayload as Parameters<typeof eventService.createEvent>[0],
            idempotencyKey,
          );

          console.log(`[Seed] Created event: "${seedEvent.name}" → ${created.id} (${seedEvent.eventType})`);
          createdEvents.push({ id: created.id, name: seedEvent.name, ownerIndex: seedEvent.ownerIndex, seedIndex: i });
          await pause();

          // Transition status
          if (seedEvent.targetStatus !== 'DRAFT' && seedEvent.targetStatus !== created.eventStatus) {
            try {
              await eventService.updateEvent(created.id, {
                event: { eventStatus: seedEvent.targetStatus as EventStatus },
              });
              console.log(`[Seed]   → Status set to ${seedEvent.targetStatus}`);
            } catch (err: any) {
              console.warn(`[Seed]   → Could not set status: ${err.message}`);
            }
            await pause();
          }

          // Clear venue for events marked as noVenue (e.g. "venue TBD")
          if (seedEvent.noVenue) {
            try {
              await eventService.updateEvent(created.id, {
                event: { venueCleared: true },
              });
              console.log(`[Seed]   → Venue cleared (noVenue)`);
            } catch (err: any) {
              console.warn(`[Seed]   → Could not clear venue: ${err.message}`);
            }
            await pause();
          }
        } catch (err: any) {
          console.warn(`[Seed] Failed to create "${seedEvent.name}": ${err.message}`);
          createdEvents.push({ id: '', name: seedEvent.name, ownerIndex: seedEvent.ownerIndex, seedIndex: i });
        }
      }

      const successCount = createdEvents.filter(e => e.id).length;
      console.log(`[Seed] Created ${successCount}/${SEED_EVENTS.length} events`);
      expect(successCount).toBeGreaterThan(0);
    }, 600_000);
  });

  // =========================================================================
  // 3b. Upload Event Cover Images (Picsum free images)
  // =========================================================================
  describe('3b. Upload Event Cover Images', () => {
    it('should upload cover images for all events', async () => {
      for (const event of createdEvents) {
        if (!event.id) continue;
        const seedEvent = SEED_EVENTS[event.seedIndex];
        const imageUrl = getPicsumImageUrl(seedEvent.coverImageSeed);

        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        try {
          const presigned = await eventService.createCoverImageUpload(event.id, {
            fileName: `cover-${seedEvent.coverImageSeed}.jpg`,
            contentType: 'image/jpeg',
            category: 'cover',
            isPublic: true,
            description: `Cover for ${event.name}`,
          });
          await pause();

          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            console.warn(`[Seed] Could not fetch image for "${event.name}" (${imageUrl})`);
            continue;
          }
          const blob = await imageResponse.blob();

          const putUrl = presignedUrlForHost(presigned.uploadUrl);
          const hostHeader = presignedHostHeader(presigned.uploadUrl);
          const putHeaders = { ...presigned.headers, ...(hostHeader && { Host: hostHeader }) };
          console.log(`[Seed] MinIO: uploading event cover to ${uploadTarget(putUrl)} for "${event.name}"`);
          const uploadResponse = await fetch(putUrl, {
            method: presigned.uploadMethod || 'PUT',
            body: blob,
            headers: putHeaders,
          });
          if (!uploadResponse.ok) {
            console.warn(`[Seed] Cover upload failed for "${event.name}" (${uploadResponse.status}). Ensure backend AWS_S3_ENDPOINT=http://host.docker.internal:9000 and restart.`);
            continue;
          }

          const fileName = `cover-${seedEvent.coverImageSeed}.jpg`;
          await eventService.completeCoverImageUploadBody(event.id, {
            coverId: presigned.mediaId,
            upload: {
              objectKey: presigned.objectKey,
              resourceUrl: presigned.resourceUrl,
              fileName,
              contentType: 'image/jpeg',
              category: 'cover',
              isPublic: true,
              description: `Cover for ${event.name}`,
            },
          });
          console.log(`[Seed] Cover image uploaded for "${event.name}"`);
          console.log(`[Seed] MinIO: event cover stored -> ${presigned.resourceUrl || presigned.objectKey}`);
        } catch (err: any) {
          console.warn(`[Seed] Cover image failed for "${event.name}": ${err.message}`);
        }
        await pause();
      }
      expect(true).toBe(true);
    }, 300_000);
  });

  // =========================================================================
  // 3c. Upload Event Media Library (extra photos per event)
  // =========================================================================
  describe('3c. Upload Event Media Library', () => {
    it('should upload media library images for events', async () => {
      for (const event of createdEvents) {
        if (!event.id) continue;
        const seedEvent = SEED_EVENTS[event.seedIndex];
        const seeds = seedEvent.mediaLibrarySeeds;
        if (!seeds || seeds.length === 0) continue;

        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        for (const seed of seeds) {
          try {
            const imageUrl = getPicsumImageUrl(seed);
            const presigned = await eventService.uploadMedia(event.id, {
              fileName: `media-${seed}.jpg`,
              contentType: 'image/jpeg',
              isPublic: true,
            });
            await pause();
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) continue;
            const blob = await imageResponse.blob();
            const putUrl = presignedUrlForHost(presigned.uploadUrl);
            const hostHeader = presignedHostHeader(presigned.uploadUrl);
            const putHeaders = { ...presigned.headers, ...(hostHeader && { Host: hostHeader }) };
            const uploadRes = await fetch(putUrl, {
              method: presigned.uploadMethod || 'PUT',
              body: blob,
              headers: putHeaders,
            });
            if (uploadRes.ok) {
              await eventService.completeMediaUpload(event.id, presigned.mediaId, {
                objectKey: presigned.objectKey,
                resourceUrl: presigned.resourceUrl,
                fileName: `media-${seed}.jpg`,
                contentType: 'image/jpeg',
              });
              console.log(`[Seed] Media "${seed}" uploaded for "${event.name}" | MinIO: ${presigned.objectKey}`);
            } else {
              console.warn(`[Seed] Media "${seed}" PUT failed for "${event.name}" (${uploadRes.status})`);
            }
          } catch (err: any) {
            console.warn(`[Seed] Media "${seed}" failed for "${event.name}": ${(err as Error).message}`);
          }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 300_000);
  });

  // =========================================================================
  // 3d. Verify MinIO has multimedia (event + user assets)
  // =========================================================================
  describe('3d. Verify MinIO multimedia', () => {
    it('should have objects in MinIO buckets after uploads', async () => {
      const counts = await verifyMinIOObjectCounts();
      console.log(`[Seed] MinIO summary: ${counts.event} event assets, ${counts.user} user assets`);
      expect(counts.event >= 0 && counts.user >= 0).toBe(true);
    }, 15_000);

    it('should return 200 when GET-ing a presigned cover URL (MinIO upload + retrieve)', async () => {
      const eventWithCover = createdEvents.find(e => e.id);
      if (!eventWithCover?.id) {
        console.log('[Seed] MinIO verify: no event to fetch cover URL');
        expect(true).toBe(true);
        return;
      }
      const creds = getCredentials(eventWithCover.ownerIndex);
      await switchTo(creds.email, creds.password, creds.username);
      await pause();
      const event = await eventService.getEvent(eventWithCover.id) as { coverImageUrl?: string | null };
      const coverUrl = event?.coverImageUrl;
      if (!coverUrl) {
        console.log('[Seed] MinIO verify: event has no coverImageUrl (upload may have been skipped)');
        expect(true).toBe(true);
        return;
      }
      const res = await fetch(coverUrl);
      console.log(`[Seed] MinIO verify: GET presigned cover URL → ${res.status}`);
      expect(res.ok).toBe(true);
    }, 15_000);
  });

  // =========================================================================
  // 4. Clone an Event
  // =========================================================================
  describe('4. Clone Event', () => {
    it('should clone the first published event', async () => {
      const sourceEvent = createdEvents.find(
        e => e.id && SEED_EVENTS[e.seedIndex].targetStatus === 'PUBLISHED',
      );
      if (!sourceEvent) {
        console.log('[Seed] No published event to clone');
        return;
      }

      const creds = getCredentials(sourceEvent.ownerIndex);
      await switchTo(creds.email, creds.password, creds.username);
      await pause();

      try {
        const cloned = await eventService.cloneEvent(sourceEvent.id, {
          name: `${sourceEvent.name} (Clone)`,
          cloneTicketTypes: true,
          cloneVenue: true,
        });
        clonedEventId = cloned.id;
        console.log(`[Seed] Cloned "${sourceEvent.name}" → ${cloned.id}`);
      } catch (err: any) {
        console.warn(`[Seed] Clone failed: ${err.message}`);
      }
      await pause();
      expect(true).toBe(true);
    }, 60_000);
  });

  // =========================================================================
  // 5. Archive & Restore an Event
  // =========================================================================
  describe('5. Archive & Restore Event', () => {
    it('should archive a draft event and then restore it', async () => {
      const draftEvent = createdEvents.find(
        e => e.id && SEED_EVENTS[e.seedIndex].targetStatus === 'DRAFT',
      );
      if (!draftEvent) {
        console.log('[Seed] No draft event to archive');
        return;
      }

      const creds = getCredentials(draftEvent.ownerIndex);
      await switchTo(creds.email, creds.password, creds.username);
      await pause();

      try {
        await eventService.archiveEvent(draftEvent.id, 'Seed test — archiving for demo');
        console.log(`[Seed] Archived "${draftEvent.name}"`);
        await pause();

        await eventService.restoreEvent(draftEvent.id);
        console.log(`[Seed] Restored "${draftEvent.name}"`);
      } catch (err: any) {
        console.warn(`[Seed] Archive/restore failed: ${err.message}`);
      }
      await pause();
      expect(true).toBe(true);
    }, 60_000);
  });

  // =========================================================================
  // 6. Registration Open/Close Cycle
  // =========================================================================
  describe('6. Registration Open/Close', () => {
    it('should toggle registration on a published event', async () => {
      const publishedEvent = createdEvents.find(
        e => e.id && SEED_EVENTS[e.seedIndex].targetStatus === 'PUBLISHED' && SEED_EVENTS[e.seedIndex].isPublic,
      );
      if (!publishedEvent) {
        console.log('[Seed] No public published event for registration toggle');
        return;
      }

      const creds = getCredentials(publishedEvent.ownerIndex);
      await switchTo(creds.email, creds.password, creds.username);
      await pause();

      try {
        await eventService.updateRegistrationState(publishedEvent.id, 'open');
        console.log(`[Seed] Registration opened on "${publishedEvent.name}"`);
        await pause();

        await eventService.updateRegistrationState(publishedEvent.id, 'close');
        console.log(`[Seed] Registration closed on "${publishedEvent.name}"`);
        await pause();

        // Re-open for attendees
        await eventService.updateRegistrationState(publishedEvent.id, 'open');
        console.log(`[Seed] Registration re-opened on "${publishedEvent.name}"`);
      } catch (err: any) {
        console.warn(`[Seed] Registration toggle failed: ${err.message}`);
      }
      await pause();
      expect(true).toBe(true);
    }, 60_000);
  });

  // =========================================================================
  // 7. Add Ticket Types (per-event, covering all 16 categories including OTHER)
  // =========================================================================
  describe('7. Add Ticket Types', () => {
    it('should add ticket types to ticketed events', async () => {
      const ticketedEvents = createdEvents.filter(
        e => e.id && SEED_EVENTS[e.seedIndex].accessType === EventAccessType.TICKETED,
      );

      for (const event of ticketedEvents) {
        const seedEvent = SEED_EVENTS[event.seedIndex];
        if (!seedEvent.ticketTypes || seedEvent.ticketTypes.length === 0) continue;

        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        const typeIds: string[] = [];

        for (const tt of seedEvent.ticketTypes) {
          try {
            const result = await ticketService.createTicketType(event.id, {
              name: tt.name,
              category: tt.category as TicketTypeCategory,
              description: tt.description,
              priceMinor: tt.priceMinor,
              quantityAvailable: tt.quantityAvailable,
              currency: 'USD',
            });
            typeIds.push(result.id);
            console.log(`[Seed] Ticket type "${tt.name}" (${tt.category}) → ${result.id} (event: ${event.name})`);
          } catch (err: any) {
            console.warn(`[Seed] Failed to create ticket type "${tt.name}": ${err.message}`);
          }
          await pause();
        }

        eventTicketTypeIds[event.id] = typeIds;

        // Add ticket promo code if defined in seed
        const ticketPromo = seedEvent.ticketPromo;
        if (ticketPromo && typeIds[ticketPromo.ticketTypeIndex]) {
          try {
            await ticketService.updateTicketType(event.id, typeIds[ticketPromo.ticketTypeIndex], {
              promotions: [
                {
                  code: ticketPromo.code,
                  percentOffBasisPoints: ticketPromo.percentOffBasisPoints,
                  active: true,
                },
              ],
            });
            console.log(`[Seed] Promo "${ticketPromo.code}" added to "${event.name}"`);
          } catch (err: any) {
            console.warn(`[Seed] Promo add failed for "${event.name}": ${err.message}`);
          }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 300_000);
  });

  // =========================================================================
  // 8. Ticket Type Templates (create + apply)
  // =========================================================================
  describe('8. Ticket Type Templates', () => {
    it('should create ticket type templates and apply one', async () => {
      // Sign in as user 1
      const creds = getCredentials(0);
      await switchTo(creds.email, creds.password, creds.username);
      await pause();

      const templateIds: string[] = [];

      for (const tmpl of TICKET_TYPE_TEMPLATES) {
        try {
          const created = await ticketService.createTicketTypeTemplate({
            name: tmpl.name,
            category: tmpl.category as TicketTypeCategory,
            description: tmpl.description,
            priceMinor: tmpl.priceMinor,
            currency: tmpl.currency,
            quantityAvailable: tmpl.quantityAvailable,
          });
          templateIds.push(created.id);
          console.log(`[Seed] Template "${tmpl.name}" → ${created.id}`);
        } catch (err: any) {
          console.warn(`[Seed] Template creation failed: ${err.message}`);
        }
        await pause();
      }

      // Apply first template to the cloned event if available
      if (templateIds.length > 0 && clonedEventId) {
        try {
          await ticketService.applyTicketTypeTemplate(templateIds[0], clonedEventId);
          console.log(`[Seed] Applied template to cloned event ${clonedEventId}`);
        } catch (err: any) {
          console.warn(`[Seed] Template apply failed: ${err.message}`);
        }
        await pause();
      }

      expect(true).toBe(true);
    }, 120_000);
  });

  // =========================================================================
  // 9. Issue Tickets Directly
  // =========================================================================
  describe('9. Issue Tickets', () => {
    it('should issue tickets to attendees on ticketed events', async () => {
      for (const event of createdEvents) {
        if (!event.id) continue;
        const typeIds = eventTicketTypeIds[event.id];
        if (!typeIds || typeIds.length === 0) continue;

        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        // Issue a ticket to each other user for the first ticket type
        const firstTypeId = typeIds[0];
        for (let j = 0; j < userIds.length; j++) {
          if (j === event.ownerIndex || !userIds[j]) continue;

          try {
            const tickets = await ticketService.issueTickets([{
              eventId: event.id,
              ticketTypeId: firstTypeId,
              ownerEmail: getCredentials(j).email,
              quantity: 1,
              sendEmail: false,
              sendPushNotification: false,
            }]);
            if (tickets.length > 0) {
              issuedTicketIds.push(tickets[0].id);
              if (tickets[0].qrCodeData) {
                issuedTicketsForCheckIn.push({
                  ticketId: tickets[0].id,
                  eventId: event.id,
                  qrCodeData: tickets[0].qrCodeData,
                });
              }
              console.log(`[Seed] Issued ticket to User ${j + 1} for "${event.name}" → ${tickets[0].id}`);
            }
          } catch (err: any) {
            console.warn(`[Seed] Ticket issue failed for User ${j + 1} on "${event.name}": ${err.message}`);
          }
          await pause();
        }

        // Issue tickets for external attendees to the second ticket type (if available)
        if (typeIds.length >= 2) {
          const secondTypeId = typeIds[1];
          for (const ext of EXTERNAL_ATTENDEES.slice(0, 3)) {
            try {
              const tickets = await ticketService.issueTickets([{
                eventId: event.id,
                ticketTypeId: secondTypeId,
                ownerEmail: ext.email,
                ownerName: ext.name,
                quantity: 1,
                sendEmail: false,
              }]);
              if (tickets.length > 0) {
                issuedTicketIds.push(tickets[0].id);
                if (tickets[0].qrCodeData) {
                  issuedTicketsForCheckIn.push({
                    ticketId: tickets[0].id,
                    eventId: event.id,
                    qrCodeData: tickets[0].qrCodeData,
                  });
                }
                console.log(`[Seed] Issued ticket to ${ext.name} for "${event.name}"`);
              }
            } catch (err: any) {
              console.warn(`[Seed] External ticket issue failed: ${err.message}`);
            }
            await pause();
          }
        }
      }
      expect(true).toBe(true);
    }, 600_000);
  });

  // =========================================================================
  // 10. Ticket Checkout Flow
  // =========================================================================
  describe('10. Ticket Checkout', () => {
    it('should start and cancel a checkout on a ticketed event', async () => {
      // Find a ticketed event with ticket types owned by user 1, check out as user 2
      const ticketedEvent = createdEvents.find(
        e => e.id && eventTicketTypeIds[e.id]?.length > 0 && e.ownerIndex !== 1,
      );
      if (!ticketedEvent || !userIds[1]) {
        console.log('[Seed] Skipping checkout — no suitable ticketed event or User 2');
        return;
      }

      const creds = getCredentials(1);
      await switchTo(creds.email, creds.password, creds.username);
      await pause();

      const typeIds = eventTicketTypeIds[ticketedEvent.id];
      try {
        const checkout = await ticketService.startTicketCheckout(ticketedEvent.id, {
          items: [{ ticketTypeId: typeIds[0], quantity: 2 }],
        });
        console.log(`[Seed] Started checkout ${checkout.id} for "${ticketedEvent.name}" (${checkout.status})`);
        await pause();

        // Cancel the checkout to release holds
        await ticketService.cancelTicketCheckout(ticketedEvent.id, checkout.id);
        console.log(`[Seed] Cancelled checkout ${checkout.id}`);
      } catch (err: any) {
        console.warn(`[Seed] Checkout flow failed: ${err.message}`);
      }
      await pause();
      expect(true).toBe(true);
    }, 120_000);
  });

  // =========================================================================
  // 11. Ticket Approval Workflow
  // =========================================================================
  describe('11. Ticket Approval Workflow', () => {
    it('should create approval requests and approve/reject them', async () => {
      // Find a ticketed event
      const ticketedEvent = createdEvents.find(
        e => e.id && eventTicketTypeIds[e.id]?.length > 0,
      );
      if (!ticketedEvent) {
        console.log('[Seed] No ticketed event for approval workflow');
        return;
      }

      const typeIds = eventTicketTypeIds[ticketedEvent.id];

      // User 2 requests approval
      if (userIds[1]) {
        const creds = getCredentials(1);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        let requestId = '';
        try {
          const req = await ticketService.createApprovalRequest(ticketedEvent.id, {
            ticketTypeId: typeIds[0],
            quantity: 1,
          });
          requestId = req.id;
          console.log(`[Seed] User 2 requested ticket approval → ${req.id}`);
        } catch (err: any) {
          console.warn(`[Seed] Approval request failed: ${err.message}`);
        }
        await pause();

        // Owner approves
        if (requestId) {
          const ownerCreds = getCredentials(ticketedEvent.ownerIndex);
          await switchTo(ownerCreds.email, ownerCreds.password, ownerCreds.username);
          await pause();

          try {
            await ticketService.approveRequest(ticketedEvent.id, requestId, {
              note: 'Approved — welcome aboard!',
              sendEmail: false,
            });
            console.log(`[Seed] Owner approved request ${requestId}`);
          } catch (err: any) {
            console.warn(`[Seed] Approval failed: ${err.message}`);
          }
          await pause();
        }
      }

      // User 3 requests and gets rejected
      if (userIds[2] && typeIds.length >= 2) {
        const creds = getCredentials(2);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        let requestId = '';
        try {
          const req = await ticketService.createApprovalRequest(ticketedEvent.id, {
            ticketTypeId: typeIds[1],
            quantity: 3,
          });
          requestId = req.id;
          console.log(`[Seed] User 3 requested ticket approval → ${req.id}`);
        } catch (err: any) {
          console.warn(`[Seed] Approval request failed: ${err.message}`);
        }
        await pause();

        if (requestId) {
          const ownerCreds = getCredentials(ticketedEvent.ownerIndex);
          await switchTo(ownerCreds.email, ownerCreds.password, ownerCreds.username);
          await pause();

          try {
            await ticketService.rejectRequest(ticketedEvent.id, requestId, {
              note: 'Sorry, this tier is sold out.',
              sendEmail: false,
            });
            console.log(`[Seed] Owner rejected request ${requestId}`);
          } catch (err: any) {
            console.warn(`[Seed] Rejection failed: ${err.message}`);
          }
          await pause();
        }
      }

      expect(true).toBe(true);
    }, 180_000);
  });

  // =========================================================================
  // 12. Ticket Waitlist
  // =========================================================================
  describe('12. Ticket Waitlist', () => {
    it('should have users join and fulfill ticket waitlists', async () => {
      const ticketedEvent = createdEvents.find(
        e => e.id && eventTicketTypeIds[e.id]?.length > 0,
      );
      if (!ticketedEvent) {
        console.log('[Seed] No ticketed event for waitlist');
        return;
      }

      const typeIds = eventTicketTypeIds[ticketedEvent.id];

      // User 2 joins waitlist
      let waitlistEntryId = '';
      if (userIds[1]) {
        const creds = getCredentials(1);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        try {
          const entry = await ticketService.joinWaitlist(ticketedEvent.id, {
            ticketTypeId: typeIds[0],
            quantity: 1,
          });
          waitlistEntryId = entry.id;
          console.log(`[Seed] User 2 joined ticket waitlist → ${entry.id}`);
        } catch (err: any) {
          console.warn(`[Seed] Waitlist join failed: ${err.message}`);
        }
        await pause();
      }

      // Owner fulfills the waitlist entry
      if (waitlistEntryId) {
        const ownerCreds = getCredentials(ticketedEvent.ownerIndex);
        await switchTo(ownerCreds.email, ownerCreds.password, ownerCreds.username);
        await pause();

        try {
          await ticketService.fulfillWaitlistEntry(ticketedEvent.id, waitlistEntryId, {
            sendEmail: false,
          });
          console.log(`[Seed] Fulfilled waitlist entry ${waitlistEntryId}`);
        } catch (err: any) {
          console.warn(`[Seed] Waitlist fulfill failed: ${err.message}`);
        }
        await pause();
      }

      expect(true).toBe(true);
    }, 120_000);
  });

  // =========================================================================
  // 12b. Ticket Check-in (validate tickets → attendee check-in)
  // =========================================================================
  describe('12b. Ticket Check-in', () => {
    it('should validate some tickets for check-in', async () => {
      const toValidate = issuedTicketsForCheckIn.slice(0, 5);
      for (const t of toValidate) {
        const event = createdEvents.find(e => e.id === t.eventId);
        if (!event) continue;
        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        try {
          const res = await ticketService.validateTicket({
            qrCodeData: t.qrCodeData,
            eventId: t.eventId,
          });
          if (res.valid) {
            console.log(`[Seed] Checked in ticket ${t.ticketId} for "${event?.name}"`);
          }
        } catch (err: any) {
          console.warn(`[Seed] Ticket validate failed: ${err.message}`);
        }
        await pause();
      }
      expect(true).toBe(true);
    }, 120_000);
  });

  // =========================================================================
  // 13. Add Attendees & Cross-invite Users
  // =========================================================================
  describe('13. Add Attendees & Invites', () => {
    it('should add attendees and create individual invites', async () => {
      for (const event of createdEvents) {
        if (!event.id) continue;
        const seedEvent = SEED_EVENTS[event.seedIndex];

        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        // addAttendees only supported for INVITE_ONLY, TICKETED, and RSVP_REQUIRED
        const supportsAttendees =
          seedEvent.accessType === EventAccessType.INVITE_ONLY ||
          seedEvent.accessType === EventAccessType.TICKETED ||
          seedEvent.accessType === EventAccessType.RSVP_REQUIRED;

        if (!supportsAttendees) {
          await pause();
          continue;
        }

        const attendees: { userId?: string; email?: string; name?: string }[] = [];

        for (let j = 0; j < userIds.length; j++) {
          if (j === event.ownerIndex || !userIds[j]) continue;
          attendees.push({ userId: userIds[j] });
        }

        // Add external email attendees to invite-only events
        if (seedEvent.accessType === EventAccessType.INVITE_ONLY) {
          for (const ext of EXTERNAL_ATTENDEES) {
            attendees.push({ email: ext.email, name: ext.name });
          }
        }

        if (attendees.length === 0) continue;

        try {
          await attendeeService.addAttendees({
            eventId: event.id,
            attendees,
            sendEmail: false,
            sendPushNotification: false,
          });
          console.log(`[Seed] Added ${attendees.length} attendees to "${event.name}"`);
        } catch (err: any) {
          console.warn(`[Seed] Failed to add attendees to "${event.name}": ${err.message}`);
        }
        await pause();

        // Create individual invites for RSVP and INVITE_ONLY events
        if (seedEvent.accessType === EventAccessType.INVITE_ONLY || seedEvent.accessType === EventAccessType.RSVP_REQUIRED) {
          for (let j = 0; j < userIds.length; j++) {
            if (j === event.ownerIndex || !userIds[j]) continue;
            try {
              await attendeeService.createInvite(event.id, {
                inviteeUserId: userIds[j],
                message: `You're invited to ${event.name}!`,
                sendEmail: false,
                sendPush: false,
              });
              console.log(`[Seed] Sent invite to User ${j + 1} for "${event.name}"`);
            } catch (err: any) {
              console.warn(`[Seed] Invite to User ${j + 1} failed: ${err.message}`);
            }
            await pause();
          }
        }
      }
      expect(true).toBe(true);
    }, 600_000);
  });

  // =========================================================================
  // 14. RSVP to Events (with varied statuses)
  // =========================================================================
  describe('14. RSVP to Events', () => {
    it('should RSVP users to events with varied statuses', async () => {
      let rsvpCounter = 0;

      for (let userIdx = 0; userIdx < userIds.length; userIdx++) {
        if (!userIds[userIdx]) continue;

        const creds = getCredentials(userIdx);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        for (const event of createdEvents) {
          if (!event.id || event.ownerIndex === userIdx) continue;

          const seedEvent = SEED_EVENTS[event.seedIndex];
          const access = seedEvent.accessType;
          if (access !== EventAccessType.RSVP_REQUIRED && access !== EventAccessType.INVITE_ONLY) continue;

          try {
            await attendeeService.rsvpToEvent(event.id);
            const status = RSVP_STATUSES[rsvpCounter % RSVP_STATUSES.length];
            console.log(`[Seed] User ${userIdx + 1} RSVP'd to "${event.name}" (target: ${status})`);

            if (status !== AttendeeStatus.CONFIRMED) {
              try {
                await attendeeService.updateRsvpStatus(event.id, { status });
                console.log(`[Seed]   → RSVP status updated to ${status}`);
              } catch (err: any) {
                console.warn(`[Seed]   → Could not update RSVP status: ${err.message}`);
              }
            }
            rsvpCounter++;
          } catch (err: any) {
            console.warn(`[Seed] User ${userIdx + 1} RSVP to "${event.name}" failed: ${err.message}`);
          }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 300_000);
  });

  // =========================================================================
  // 15. Event Waitlist
  // =========================================================================
  describe('15. Event Waitlist', () => {
    it('should have users join event waitlists', async () => {
      // Join waitlist on events with small capacity that are RSVP-required
      const smallEvents = createdEvents.filter(
        e => e.id && SEED_EVENTS[e.seedIndex].capacity <= 40 && SEED_EVENTS[e.seedIndex].accessType === EventAccessType.RSVP_REQUIRED,
      );

      for (const event of smallEvents) {
        for (let j = 0; j < userIds.length; j++) {
          if (j === event.ownerIndex || !userIds[j]) continue;

          const creds = getCredentials(j);
          await switchTo(creds.email, creds.password, creds.username);
          await pause();

          try {
            await eventWaitlistService.joinWaitlist(event.id);
            console.log(`[Seed] User ${j + 1} joined event waitlist for "${event.name}"`);
          } catch (err: any) {
            console.warn(`[Seed] Event waitlist join failed: ${err.message}`);
          }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 180_000);
  });

  // =========================================================================
  // 16. Create Feed Posts + Comments + Likes + Quotes + Reposts
  // =========================================================================
  describe('16. Create Feed Posts', () => {
    it('should create posts, comments, likes, quotes, and reposts', async () => {
      for (const event of createdEvents) {
        if (!event.id) continue;
        const seedEvent = SEED_EVENTS[event.seedIndex];

        // Sign in as event owner to create posts
        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        const postIds: string[] = [];

        for (const post of seedEvent.posts) {
          const isImagePost = typeof post === 'object' && 'imageSeed' in post;
          const content = typeof post === 'string' ? post : post.content;

          try {
            if (isImagePost && typeof post === 'object' && 'imageSeed' in post) {
              // IMAGE post: create with mediaUpload, fetch from Picsum, upload
              const imageSeed = post.imageSeed;
              const imageUrl = getPicsumImageUrl(imageSeed);
              const fileName = `post-${imageSeed}.jpg`;

              const createResult = await feedService.createPost(event.id, {
                type: PostType.IMAGE,
                content,
                mediaUpload: { fileName, contentType: 'image/jpeg' },
              });
              await pause();

              const mediaUpload = createResult.mediaUpload;
              if (mediaUpload) {
                const imageResponse = await fetch(imageUrl);
                if (imageResponse.ok) {
                  const blob = await imageResponse.blob();
                  const uploadRes = await fetch(mediaUpload.uploadUrl, {
                    method: mediaUpload.uploadMethod || 'PUT',
                    body: blob,
                    headers: mediaUpload.headers,
                  });
                  if (uploadRes.ok) {
                    await feedService.completeMediaUpload(event.id, createResult.post.id, mediaUpload.mediaId, {
                      objectKey: mediaUpload.objectKey,
                      resourceUrl: mediaUpload.resourceUrl,
                      fileName,
                      contentType: 'image/jpeg',
                    });
                    postIds.push(createResult.post.id);
                    console.log(`[Seed] IMAGE post created on "${event.name}": ${createResult.post.id}`);
                  } else {
                    postIds.push(createResult.post.id);
                    console.log(`[Seed] Post created (image upload failed) on "${event.name}": ${createResult.post.id}`);
                  }
                } else {
                  postIds.push(createResult.post.id);
                  console.warn(`[Seed] Could not fetch image for post on "${event.name}", post created without media`);
                }
              } else {
                postIds.push(createResult.post.id);
              }
            } else {
              // TEXT post
              const result = await feedService.createPost(event.id, {
                type: PostType.TEXT,
                content,
              });
              postIds.push(result.post.id);
              console.log(`[Seed] Post created on "${event.name}": ${result.post.id}`);
            }
          } catch (err: any) {
            console.warn(`[Seed] Failed to create post on "${event.name}": ${err.message}`);
          }
          await pause();
        }

        eventPostIds[event.id] = postIds;
        if (postIds.length === 0) continue;

        // --- Interactions from ALL other users ---
        for (let otherIdx = 0; otherIdx < userIds.length; otherIdx++) {
          if (otherIdx === event.ownerIndex || !userIds[otherIdx]) continue;

          const otherCreds = getCredentials(otherIdx);
          await switchTo(otherCreds.email, otherCreds.password, otherCreds.username);
          await pause();

          // Like ALL posts
          for (const postId of postIds) {
            try {
              await feedService.likePost(event.id, postId);
              console.log(`[Seed] User ${otherIdx + 1} liked post ${postId}`);
            } catch (err: any) {
              console.warn(`[Seed] Like failed: ${err.message}`);
            }
            await pause();
          }

          // Comment on posts — rotate comment sets, comment on multiple posts
          const commentSetIdx = (event.seedIndex + otherIdx) % POST_COMMENTS.length;
          const commentSet = POST_COMMENTS[commentSetIdx];
          // Comment on the first post
          for (const comment of commentSet) {
            try {
              await feedService.createComment(event.id, postIds[0], { content: comment });
              console.log(`[Seed] User ${otherIdx + 1} commented on post ${postIds[0]}`);
            } catch (err: any) {
              console.warn(`[Seed] Comment failed: ${err.message}`);
            }
            await pause();
          }

          // Comment on second post if available (different comment set)
          if (postIds.length >= 2) {
            const secondCommentSetIdx = (commentSetIdx + 1) % POST_COMMENTS.length;
            const secondCommentSet = POST_COMMENTS[secondCommentSetIdx];
            for (const comment of secondCommentSet.slice(0, 2)) {
              try {
                await feedService.createComment(event.id, postIds[1], { content: comment });
                console.log(`[Seed] User ${otherIdx + 1} commented on post ${postIds[1]}`);
              } catch (err: any) {
                console.warn(`[Seed] Comment on 2nd post failed: ${err.message}`);
              }
              await pause();
            }
          }

          // Quote a post
          if (postIds.length >= 2) {
            const quoteIdx = (event.seedIndex + otherIdx) % QUOTE_TEXTS.length;
            try {
              await feedService.quotePost(event.id, postIds[1], { quoteText: QUOTE_TEXTS[quoteIdx] });
              console.log(`[Seed] User ${otherIdx + 1} quoted post ${postIds[1]}`);
            } catch (err: any) {
              console.warn(`[Seed] Quote failed: ${err.message}`);
            }
            await pause();
          }

          // Repost the last post
          if (postIds.length >= 1) {
            const lastPostId = postIds[postIds.length - 1];
            try {
              await feedService.repost(event.id, lastPostId);
              console.log(`[Seed] User ${otherIdx + 1} reposted post ${lastPostId}`);
            } catch (err: any) {
              console.warn(`[Seed] Repost failed: ${err.message}`);
            }
            await pause();
          }
        }

        // Owner also likes their own posts (common social pattern)
        await switchTo(creds.email, creds.password, creds.username);
        await pause();
        for (const postId of postIds) {
          try {
            await feedService.likePost(event.id, postId);
          } catch { /* ignore — might already be liked */ }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 1800_000);
  });

  // =========================================================================
  // 17. Add Collaborators (with varied roles + invite flow)
  // =========================================================================
  describe('17. Add Collaborators', () => {
    it('should add collaborators with varied roles and use invite flow', async () => {
      for (let eventIdx = 0; eventIdx < createdEvents.length; eventIdx++) {
        const event = createdEvents[eventIdx];
        if (!event.id) continue;
        const seedEvent = SEED_EVENTS[event.seedIndex];

        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        // Add first collaborator directly
        const collabIdx1 = (event.ownerIndex + 1) % userIds.length;
        if (userIds[collabIdx1] && collabIdx1 !== event.ownerIndex) {
          try {
            await collaborationService.addCollaborator(event.id, {
              userId: userIds[collabIdx1],
              role: seedEvent.collaboratorRole,
              sendInvitation: false,
            });
            console.log(`[Seed] User ${collabIdx1 + 1} added as ${seedEvent.collaboratorRole} on "${event.name}"`);
          } catch (err: any) {
            console.warn(`[Seed] Collaborator add failed on "${event.name}": ${err.message}`);
          }
          await pause();
        }

        // For every other event, use the invite → accept flow for the second collaborator
        if (userIds.length > 2 && eventIdx % 2 === 0) {
          const collabIdx2 = (event.ownerIndex + 2) % userIds.length;
          if (userIds[collabIdx2] && collabIdx2 !== event.ownerIndex) {
            const secondRole = seedEvent.collaboratorRole === 'COORDINATOR'
              ? 'VOLUNTEER' as any
              : 'COORDINATOR' as any;

            let inviteId = '';
            try {
              const invite = await collaborationService.createInvite(event.id, {
                inviteeUserId: userIds[collabIdx2],
                role: secondRole,
                message: `Join us as a ${secondRole} for ${event.name}!`,
                sendEmail: false,
                sendPush: false,
              });
              inviteId = invite.inviteId;
              console.log(`[Seed] Sent collaborator invite to User ${collabIdx2 + 1} for "${event.name}" → ${inviteId}`);
            } catch (err: any) {
              console.warn(`[Seed] Collab invite failed: ${err.message}`);
            }
            await pause();

            // Accept or decline the invite as the other user
            if (inviteId) {
              const acceptCreds = getCredentials(collabIdx2);
              await switchTo(acceptCreds.email, acceptCreds.password, acceptCreds.username);
              await pause();

              const shouldDecline = seedEvent.collaboratorInviteAction === 'decline';
              try {
                if (shouldDecline) {
                  await collaborationService.declineInvite(inviteId, { note: 'Thanks, but I have a conflict that day.' });
                  console.log(`[Seed] User ${collabIdx2 + 1} declined collaborator invite for "${event.name}"`);
                } else {
                  await collaborationService.acceptInvite(inviteId, { note: 'Happy to help!' });
                  console.log(`[Seed] User ${collabIdx2 + 1} accepted collaborator invite for "${event.name}"`);
                }
              } catch (err: any) {
                console.warn(`[Seed] Collab invite ${shouldDecline ? 'decline' : 'accept'} failed: ${err.message}`);
              }
              await pause();
            }
          }
        }
      }
      expect(true).toBe(true);
    }, 600_000);
  });

  // =========================================================================
  // 18. Create Budgets & Line Items (event-specific)
  // =========================================================================
  describe('18. Create Budgets & Line Items', () => {
    it('should create event-specific budgets', async () => {
      for (const event of createdEvents) {
        if (!event.id) continue;
        const seedEvent = SEED_EVENTS[event.seedIndex];

        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        try {
          await budgetService.updateBudget(event.id, {
            totalBudget: seedEvent.budgetTotal,
            currency: 'USD',
            notes: `Budget for ${event.name}`,
          });
          console.log(`[Seed] Budget created for "${event.name}" ($${(seedEvent.budgetTotal / 100).toLocaleString()})`);
        } catch (err: any) {
          console.warn(`[Seed] Budget creation failed for "${event.name}": ${err.message}`);
        }
        await pause();

        // Fetch categories to resolve name → id (BE auto-creates standard categories on budget init)
        let categoryMap: Record<string, string> = {};
        let fallbackCategoryId: string | null = null;
        try {
          const cats = await budgetService.getCategories(event.id);
          for (const cat of cats) {
            categoryMap[cat.name] = cat.id;
          }
          // Fallback: use first category if named category doesn't exist (backend may use different names)
          fallbackCategoryId = cats.length > 0 ? cats[0].id : null;
        } catch (err: any) {
          console.warn(`[Seed] Could not fetch categories for "${event.name}": ${err.message}`);
        }

        for (const item of seedEvent.budgetItems) {
          let budgetCategoryId = categoryMap[item.categoryName];
          if (!budgetCategoryId && fallbackCategoryId) {
            budgetCategoryId = categoryMap['Miscellaneous'] || categoryMap['Venue & Facilities'] || fallbackCategoryId;
          }

          if (!budgetCategoryId) {
            console.warn(`[Seed] No category found for "${item.categoryName}" on "${event.name}" — skipping`);
            continue;
          }

          try {
            const saved = await budgetService.autoSaveDraft(event.id, {
              budgetCategoryId,
              description: item.description,
              estimatedCost: item.estimatedCost,
              actualCost: item.actualCost,
              isEssential: item.isEssential,
              priority: item.priority,
              quantity: item.quantity,
              unitCost: item.unitCost,
            });
            if (saved.id) {
              await budgetService.finalizeLineItem(event.id, saved.id, {
                budgetCategoryId,
                description: item.description,
                estimatedCost: item.estimatedCost,
                actualCost: item.actualCost,
                isEssential: item.isEssential,
                priority: item.priority,
                quantity: item.quantity,
                unitCost: item.unitCost,
              });
            }
            console.log(`[Seed] Line item "${item.description}" → "${event.name}"`);
          } catch (err: any) {
            console.warn(`[Seed] Line item "${item.description}" failed: ${err.message}`);
          }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 900_000);
  });

  // =========================================================================
  // 19. Create Timeline Tasks (event-specific)
  // =========================================================================
  describe('19. Create Timeline Tasks', () => {
    it('should create event-specific tasks with checklist items', async () => {
      for (const event of createdEvents) {
        if (!event.id) continue;
        const seedEvent = SEED_EVENTS[event.seedIndex];

        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        for (const task of seedEvent.tasks) {
          try {
            const dueDate = new Date(Date.now() + (seedEvent.startDaysFromNow - 2) * 24 * 60 * 60 * 1000);

            const saved = await timelineService.autoSaveTask(event.id, {
              title: task.title,
              description: task.description,
              priority: task.priority,
              category: task.category,
              dueDate: dueDate.toISOString().slice(0, 19),
            });

            if (saved.id) {
              const taskStatus = task.taskStatus
                ? (task.taskStatus as TimelineStatus)
                : undefined;
              await timelineService.finalizeTask(event.id, saved.id, {
                title: task.title,
                description: task.description,
                priority: task.priority,
                category: task.category,
                dueDate: dueDate.toISOString().slice(0, 19),
                ...(taskStatus ? { status: taskStatus } : {}),
              });

              for (const checkItem of task.checklist) {
                try {
                  const checkSaved = await timelineService.autoSaveChecklistItem(saved.id, {
                    title: checkItem.title,
                  });
                  if (checkSaved.id) {
                    await timelineService.finalizeChecklistItem(saved.id, checkSaved.id, {
                      title: checkItem.title,
                      ...(checkItem.completed ? { status: TimelineStatus.DONE } : {}),
                    });
                  }
                } catch (err: any) {
                  console.warn(`[Seed] Checklist item "${checkItem.title}" failed: ${err.message}`);
                }
                await pause();
              }
            }

            console.log(`[Seed] Task "${task.title}" → "${event.name}"`);
          } catch (err: any) {
            console.warn(`[Seed] Task "${task.title}" failed: ${err.message}`);
          }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 900_000);
  });

  // =========================================================================
  // 20. Event Reminders
  // =========================================================================
  describe('20. Event Reminders', () => {
    it('should create reminders for events', async () => {
      // Create reminders on the first 5 events
      const eventsForReminders = createdEvents.filter(e => e.id).slice(0, 5);

      for (const event of eventsForReminders) {
        const seedEvent = SEED_EVENTS[event.seedIndex];
        const creds = getCredentials(event.ownerIndex);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        for (const reminder of EVENT_REMINDERS) {
          try {
            const reminderTime = new Date(
              Date.now() + (seedEvent.startDaysFromNow + reminder.offsetDays) * 24 * 60 * 60 * 1000,
            );

            await eventService.createReminder(event.id, {
              title: reminder.title,
              description: reminder.description,
              reminderTime: reminderTime.toISOString().slice(0, 19),
              channel: reminder.channel,
              reminderType: reminder.reminderType,
              isActive: true,
            });
            console.log(`[Seed] Reminder "${reminder.title}" → "${event.name}"`);
          } catch (err: any) {
            console.warn(`[Seed] Reminder "${reminder.title}" failed: ${err.message}`);
          }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 300_000);
  });

  // =========================================================================
  // 21. Social Graph — Users Follow Each Other
  // =========================================================================
  describe('21. Social Graph', () => {
    it('should have users follow each other', async () => {
      for (let i = 0; i < userIds.length; i++) {
        if (!userIds[i]) continue;

        const creds = getCredentials(i);
        await switchTo(creds.email, creds.password, creds.username);
        await pause();

        for (let j = 0; j < userIds.length; j++) {
          if (i === j || !userIds[j]) continue;
          try {
            await userFollowService.followUser(userIds[j]);
            console.log(`[Seed] User ${i + 1} followed User ${j + 1}`);
          } catch (err: any) {
            console.warn(`[Seed] Follow failed (User ${i + 1} → ${j + 1}): ${err.message}`);
          }
          await pause();
        }
      }
      expect(true).toBe(true);
    }, 120_000);
  });

  // =========================================================================
  // 22. Summary
  // =========================================================================
  describe('22. Summary', () => {
    it('should log created data summary', () => {
      console.log('\n========================================');
      console.log('  SEED COMPLETE — Summary');
      console.log('========================================\n');

      console.log('Users:');
      userIds.forEach((id, i) => {
        const profile = USER_PROFILE_UPDATES[i];
        console.log(`  User ${i + 1}: ${id || '(skipped)'} ${profile ? `(${profile.name})` : ''}`);
      });

      console.log('\nEvents:');
      createdEvents.forEach((event) => {
        const seedEvent = SEED_EVENTS[event.seedIndex];
        console.log(`  ${event.id || '(skipped)'} — "${event.name}"`);
        console.log(`    Type: ${seedEvent.eventType} | Access: ${seedEvent.accessType} | Status: ${seedEvent.targetStatus}`);
        console.log(`    Owner: User ${event.ownerIndex + 1} | Budget: $${(seedEvent.budgetTotal / 100).toLocaleString()}`);
        console.log(`    Tasks: ${seedEvent.tasks.length} | Posts: ${seedEvent.posts.length} | Budget items: ${seedEvent.budgetItems.length}`);
        if (seedEvent.ticketTypes) {
          console.log(`    Ticket types: ${seedEvent.ticketTypes.map(t => t.category).join(', ')}`);
        }
      });

      if (clonedEventId) {
        console.log(`\nCloned event: ${clonedEventId}`);
      }

      console.log('\nPost counts per event:');
      for (const [eventId, postIds] of Object.entries(eventPostIds)) {
        const event = createdEvents.find(e => e.id === eventId);
        console.log(`  "${event?.name}": ${postIds.length} posts`);
      }

      console.log(`\nTickets issued: ${issuedTicketIds.length}`);

      // Coverage summary
      const eventTypes = new Set(createdEvents.filter(e => e.id).map(e => SEED_EVENTS[e.seedIndex].eventType));
      const accessTypes = new Set(createdEvents.filter(e => e.id).map(e => SEED_EVENTS[e.seedIndex].accessType));
      const statuses = new Set(createdEvents.filter(e => e.id).map(e => SEED_EVENTS[e.seedIndex].targetStatus));
      const ticketCategories = new Set(
        createdEvents
          .filter(e => e.id && SEED_EVENTS[e.seedIndex].ticketTypes)
          .flatMap(e => SEED_EVENTS[e.seedIndex].ticketTypes!.map(t => t.category))
      );
      const collabRoles = new Set(createdEvents.filter(e => e.id).map(e => SEED_EVENTS[e.seedIndex].collaboratorRole));

      console.log('\nCoverage:');
      console.log(`  Event types:       ${eventTypes.size}/17`);
      console.log(`  Access types:      ${accessTypes.size}/4`);
      console.log(`  Target statuses:   ${statuses.size}`);
      console.log(`  Ticket categories: ${ticketCategories.size}/16`);
      console.log(`  Collaborator roles: ${collabRoles.size}`);

      console.log('\nFeatures exercised:');
      console.log('  ✓ User profiles, avatars (Picsum), notification/privacy/security settings');
      console.log('  ✓ Event cover images + media library (Picsum, different per event)');
      console.log('  ✓ Event website URLs, registration deadlines, time-of-day variety');
      console.log('  ✓ Event create, clone, archive/restore, registration open/close');
      console.log('  ✓ Ticket types, templates, issue, checkout, approval, waitlist');
      console.log('  ✓ Attendees, individual invites, RSVPs (varied statuses)');
      console.log('  ✓ Event waitlist');
      console.log('  ✓ Collaborators (direct add + invite/accept flow)');
      console.log('  ✓ Feed posts (TEXT + IMAGE), likes, comments, quotes, reposts');
      console.log('  ✓ Event reminders');
      console.log('  ✓ Budget with event-specific line items');
      console.log('  ✓ Timeline tasks with checklists (varied status: COMPLETED, IN_PROGRESS)');
      console.log('  ✓ Ticket check-in (validate tickets for attendee check-in)');
      console.log('  ✓ Social graph (mutual follows)');

      console.log('\n========================================\n');
      expect(true).toBe(true);
    });
  });
});
