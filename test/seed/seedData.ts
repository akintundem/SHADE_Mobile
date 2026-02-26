/**
 * Seed data constants — realistic names, descriptions, venues, etc.
 * Used by seed.test.ts to populate the database for design work.
 *
 * Narrative: Three users (Mayowa, Adaeze, Chinedu) own and collaborate on events across
 * tech, creative, corporate, and community spaces. Each user creates their own events
 * (ownerIndex 0, 1, or 2); events are distributed so multiple users are event owners.
 * Data is interconnected: users follow each other, RSVP across events, comment on posts,
 * hold tickets, and collaborate.
 *
 * Coverage:
 * - ALL 17 EventType values
 * - ALL 4 EventAccessType values (OPEN, RSVP_REQUIRED, INVITE_ONLY, TICKETED)
 * - ALL 16 TicketTypeCategory values (including OTHER)
 * - Varied EventStatus: DRAFT, PLANNING, PUBLISHED, REGISTRATION_OPEN, REGISTRATION_CLOSED
 * - Varied AttendeeStatus: CONFIRMED, PENDING, DECLINED, TENTATIVE, NO_SHOW
 * - Budget items with estimated and actual costs for variance testing
 * - Standard budget categories: Venue & Facilities, Catering & Food, Marketing & Promotion,
 *   Speakers & Talent, Audio & Visual, Staff & Security, Printing & Signage,
 *   Decorations & Flowers, Gifts & Swag, Miscellaneous
 * - Cover images: Free images from Picsum (picsum.photos), different per event
 * - Feed posts: Mix of TEXT and IMAGE posts; image posts use Picsum seeds
 */

import { EventType, EventAccessType } from '../../core/events/types/event';
import { EventUserType } from '../../core/collaboration/types/collaboration';
import { VisibilityLevel } from '../../core/auth/types/auth';

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** TEXT post (string) or IMAGE post (object with content + imageSeed for Picsum URL) */
export type SeedPost = string | { content: string; imageSeed: string };

export interface SeedEvent {
  name: string;
  description: string;
  eventType: EventType;
  accessType: EventAccessType;
  capacity: number;
  isPublic: boolean;
  hashtag: string;
  /** Unique seed for event cover image (picsum.photos/seed/{seed}/800/600) */
  coverImageSeed: string;
  /** Event website URL (for "Visit website" link) */
  eventWebsiteUrl?: string;
  /** Days before start that registration closes (for registration deadline display) */
  registrationDeadlineDaysBeforeStart?: number;
  /** Hour of day for event start (0-23) — variety: 9=morning, 14=afternoon, 19=evening */
  startHourOffset?: number;
  /** Extra images for event media library (Picsum seeds) */
  mediaLibrarySeeds?: string[];
  /** If true: minimal tasks, posts — for empty/sparse state testing */
  isSparseEvent?: boolean;
  /** If true: create without venue, then clear — for "venue TBD" testing */
  noVenue?: boolean;
  /** If true: event requires approval to join (RSVP/ticket) */
  requiresApproval?: boolean;
  /** Theme, objectives, targetAudience for rich event display */
  theme?: string;
  objectives?: string;
  targetAudience?: string;
  /** For collaborator invite flow: 'accept' (default) or 'decline' */
  collaboratorInviteAction?: 'accept' | 'decline';
  /** Promo code for a ticket type: { ticketTypeIndex, code, percentOffBasisPoints } */
  ticketPromo?: { ticketTypeIndex: number; code: string; percentOffBasisPoints: number };
  venue: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  ownerIndex: number;
  targetStatus: string;
  /** Days from now the event starts */
  startDaysFromNow: number;
  /** Duration in hours */
  durationHours: number;
  /** Event-specific budget total in minor units (cents) */
  budgetTotal: number;
  /** Event-specific feed posts (TEXT or IMAGE with Picsum seed) */
  posts: SeedPost[];
  /** Event-specific budget line items */
  budgetItems: SeedBudgetItem[];
  /** Event-specific timeline tasks */
  tasks: SeedTask[];
  /** Event-specific ticket types (only for TICKETED events) */
  ticketTypes?: SeedTicketType[];
  /** Collaborator role to assign */
  collaboratorRole: EventUserType;
}

export interface SeedBudgetItem {
  categoryName: string;
  description: string;
  estimatedCost: number;
  actualCost?: number;
  isEssential: boolean;
  priority: string;
  quantity?: number;
  unitCost?: number;
}

export interface SeedTask {
  title: string;
  description: string;
  priority: string;
  category: string;
  checklist: { title: string; completed?: boolean }[];
  /** Task status for timeline variety: COMPLETED, IN_PROGRESS, etc. */
  taskStatus?: 'PENDING' | 'TO_DO' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'DONE';
}

export interface SeedTicketType {
  name: string;
  category: string;
  description: string;
  priceMinor: number;
  quantityAvailable: number;
}

/** Picsum Photos base URL — free, no auth. Different seed = different image. */
export function getPicsumImageUrl(seed: string, width = 800, height = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

// =====================================================================
// 17 Events — one for every EventType
// =====================================================================

export const SEED_EVENTS: SeedEvent[] = [
  // ---------------------------------------------------------------
  // 1. CONFERENCE — OPEN / PUBLISHED
  // ---------------------------------------------------------------
  {
    name: 'Lagos Tech Summit 2025',
    description:
      'West Africa\'s premier technology conference bringing together founders, engineers, and investors for two days of talks, demos, and networking. Keynotes from industry leaders, hands-on workshops, and an expo hall with 50+ startups.\n\nDay 1 focuses on product and engineering; Day 2 on growth and fundraising. Breakfast, lunch, and networking breaks included. Early bird pricing ends soon!',
    eventType: EventType.CONFERENCE,
    accessType: EventAccessType.OPEN,
    capacity: 500,
    isPublic: true,
    hashtag: '#LagosTechSummit',
    coverImageSeed: 'lagos-tech-conference',
    eventWebsiteUrl: 'https://lagostechsummit.com',
    theme: 'West Africa Tech & Innovation',
    objectives: 'Connect founders, engineers, investors; showcase 50+ startups.',
    targetAudience: 'Founders, engineers, VCs, ecosystem builders',
    registrationDeadlineDaysBeforeStart: 7,
    startHourOffset: 9,
    mediaLibrarySeeds: ['conf-venue', 'conf-speakers', 'conf-expo'],
    venue: {
      address: '1 Ozumba Mbadiwe Ave',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      zipCode: '101233',
      latitude: 6.4281,
      longitude: 3.4219,
    },
    ownerIndex: 0,
    targetStatus: 'PUBLISHED',
    startDaysFromNow: 30,
    durationHours: 16,
    budgetTotal: 2500000,
    collaboratorRole: EventUserType.COORDINATOR,
    posts: [
      'Excited to announce Lagos Tech Summit 2025! Two days of innovation, connection, and inspiration. Mark your calendars!',
      { content: 'Speaker lineup revealed: We have CTOs from Paystack, Flutterwave, and Andela joining us this year.', imageSeed: 'tech-speakers' },
      'Workshop schedule is live! Sign up for your preferred sessions before they fill up.',
      'Venue walkthrough complete — the Eko Convention Centre is going to look incredible this year.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities', description: 'Eko Convention Centre rental (2 days)', estimatedCost: 800000, actualCost: 780000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'Keynote speaker fees', estimatedCost: 600000, actualCost: 620000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Audio & Visual', description: 'AV equipment & staging', estimatedCost: 350000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Catering for 500 attendees (2 days)', estimatedCost: 400000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Marketing & Promotion', description: 'Digital advertising campaign', estimatedCost: 150000, isEssential: false, priority: 'MEDIUM' },
      { categoryName: 'Marketing & Promotion', description: 'Printed banners and signage', estimatedCost: 50000, actualCost: 48000, isEssential: false, priority: 'LOW' },
      { categoryName: 'Staff & Security', description: 'Event staff & security', estimatedCost: 100000, isEssential: true, priority: 'MEDIUM' },
    ],
    tasks: [
      {
        title: 'Finalize speaker lineup',
        description: 'Confirm all keynote and panel speakers and collect their bios.',
        priority: 'HIGH',
        category: 'Content',
        checklist: [
          { title: 'Send speaker agreements', completed: true },
          { title: 'Collect headshots and bios', completed: true },
          { title: 'Confirm travel arrangements' },
        ],
        taskStatus: 'IN_PROGRESS',
      },
      {
        title: 'Print attendee badges',
        description: 'Design and print name badges for all registered attendees.',
        priority: 'MEDIUM',
        category: 'Operations',
        checklist: [
          { title: 'Finalize badge design', completed: true },
          { title: 'Export attendee list', completed: true },
          { title: 'Send to printer', completed: true },
        ],
        taskStatus: 'COMPLETED',
      },
      {
        title: 'Set up registration desk',
        description: 'Prepare the on-site registration area with check-in stations.',
        priority: 'HIGH',
        category: 'Logistics',
        checklist: [{ title: 'Arrange tables and iPads' }, { title: 'Test QR scanning' }],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 2. WORKSHOP — RSVP_REQUIRED / REGISTRATION_OPEN
  // ---------------------------------------------------------------
  {
    name: 'UI/UX Design Workshop',
    description:
      'Hands-on workshop covering Figma prototyping, design systems, and user research methods. Bring your laptop — we\'ll build a real project together. Limited to 30 seats.',
    eventType: EventType.WORKSHOP,
    accessType: EventAccessType.RSVP_REQUIRED,
    capacity: 30,
    isPublic: true,
    hashtag: '#DesignWorkshop',
    coverImageSeed: 'ux-design-workshop',
    registrationDeadlineDaysBeforeStart: 3,
    startHourOffset: 14,
    requiresApproval: true,
    mediaLibrarySeeds: ['workshop-space', 'figma-session'],
    theme: 'Hands-on Figma & Design Systems',
    objectives: 'Build a real project; learn design systems and prototyping.',
    targetAudience: 'Product designers, UX researchers (curated)',
    venue: {
      address: '350 5th Ave',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10118',
      latitude: 40.7484,
      longitude: -73.9857,
    },
    ownerIndex: 0,
    targetStatus: 'REGISTRATION_OPEN',
    startDaysFromNow: 14,
    durationHours: 6,
    budgetTotal: 300000,
    collaboratorRole: EventUserType.STAFF,
    posts: [
      'Our UI/UX Design Workshop is officially open for RSVP! Only 30 spots — don\'t wait.',
      { content: 'Here\'s a sneak peek at the Figma project we\'ll be building together. It\'s going to be hands-on and practical.', imageSeed: 'figma-design' },
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Workshop space rental', estimatedCost: 80000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Lunch and coffee for 30', estimatedCost: 45000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Printing & Signage', description: 'Printed workbooks', estimatedCost: 15000, isEssential: false, priority: 'LOW' },
      { categoryName: 'Audio & Visual', description: 'Projector and screen rental', estimatedCost: 10000, isEssential: true, priority: 'MEDIUM' },
    ],
    tasks: [
      {
        title: 'Prepare workshop materials',
        description: 'Create the Figma template and print participant workbooks.',
        priority: 'HIGH',
        category: 'Content',
        checklist: [
          { title: 'Design Figma starter template' },
          { title: 'Write step-by-step guide' },
          { title: 'Print 35 copies' },
        ],
      },
      {
        title: 'Test projector setup',
        description: 'Verify the projector, screen, and laptop connections work.',
        priority: 'MEDIUM',
        category: 'Production',
        checklist: [],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 3. SEMINAR — OPEN / PUBLISHED
  // ---------------------------------------------------------------
  {
    name: 'AI & the Future of Work Seminar',
    description:
      'An afternoon seminar exploring how artificial intelligence is reshaping industries, jobs, and the workforce. Panel discussion with academics and industry practitioners.',
    eventType: EventType.SEMINAR,
    accessType: EventAccessType.OPEN,
    capacity: 120,
    isPublic: true,
    hashtag: '#AIFutureWork',
    coverImageSeed: 'ai-seminar-mit',
    eventWebsiteUrl: 'https://aifuturework.mit.edu',
    startHourOffset: 14,
    theme: 'AI & the Future of Work',
    objectives: 'Explore AI impact on jobs; panel with academics and industry.',
    targetAudience: 'Students, researchers, HR leaders',
    collaboratorInviteAction: 'decline',
    venue: {
      address: '77 Massachusetts Ave',
      city: 'Cambridge',
      state: 'MA',
      country: 'United States',
      zipCode: '02139',
      latitude: 42.3601,
      longitude: -71.0942,
    },
    ownerIndex: 1,
    targetStatus: 'PUBLISHED',
    startDaysFromNow: 21,
    durationHours: 4,
    budgetTotal: 450000,
    collaboratorRole: EventUserType.SPEAKER,
    posts: [
      'Join us for an important conversation about AI and the future of work. Free and open to all.',
      'Our panelists include Dr. Amara Okafor (MIT), James Chen (Google DeepMind), and Sarah Williams (McKinsey).',
      'We\'ll be recording the seminar — if you can\'t make it in person, catch the replay next week.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'MIT auditorium booking', estimatedCost: 120000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'Panelist honorariums', estimatedCost: 200000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Audio & Visual', description: 'Video recording crew', estimatedCost: 80000, isEssential: false, priority: 'MEDIUM' },
      { categoryName: 'Catering & Food', description: 'Reception refreshments', estimatedCost: 50000, isEssential: false, priority: 'LOW' },
    ],
    tasks: [
      {
        title: 'Coordinate panelist schedules',
        description: 'Confirm availability and travel for all panelists.',
        priority: 'HIGH',
        category: 'Content',
        checklist: [{ title: 'Email confirmation to panelists' }, { title: 'Book hotels if needed' }],
      },
      {
        title: 'Prepare discussion questions',
        description: 'Draft thought-provoking questions for the panel moderator.',
        priority: 'MEDIUM',
        category: 'Content',
        checklist: [],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 4. MEETING — INVITE_ONLY / DRAFT
  // ---------------------------------------------------------------
  {
    name: 'Q4 Board Meeting',
    description:
      'Quarterly board meeting to review financials, approve the 2026 budget, and discuss strategic initiatives. Pre-read materials will be distributed one week before.',
    eventType: EventType.MEETING,
    accessType: EventAccessType.INVITE_ONLY,
    capacity: 12,
    isPublic: false,
    hashtag: '#Q4Board',
    coverImageSeed: 'board-meeting',
    startHourOffset: 10,
    venue: {
      address: '30 Hudson Yards',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10001',
      latitude: 40.7537,
      longitude: -74.0021,
    },
    ownerIndex: 1,
    targetStatus: 'POSTPONED',
    startDaysFromNow: 45,
    durationHours: 3,
    budgetTotal: 150000,
    collaboratorRole: EventUserType.COORDINATOR,
    theme: 'Q4 Strategic Review',
    objectives: 'Approve 2026 budget; discuss expansion initiatives.',
    targetAudience: 'Board members and C-suite',
    posts: [
      'Board meeting postponed — key member unavailable. New date TBD.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Conference room booking', estimatedCost: 50000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Working lunch for 12', estimatedCost: 36000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Printing & Signage', description: 'Printed board packets', estimatedCost: 5000, isEssential: false, priority: 'LOW' },
    ],
    tasks: [
      {
        title: 'Distribute pre-read materials',
        description: 'Send financial reports and strategy decks to all board members.',
        priority: 'HIGH',
        category: 'Communications',
        checklist: [{ title: 'Compile Q3 financials' }, { title: 'Draft strategy memo' }, { title: 'Email to board' }],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 5. PARTY — INVITE_ONLY / PUBLISHED
  // ---------------------------------------------------------------
  {
    name: 'Afrobeats Night Live',
    description:
      'An exclusive night of live Afrobeats performances featuring top artists. Curated cocktails, a rooftop lounge, and sounds from DJ Spinall and friends.',
    eventType: EventType.PARTY,
    accessType: EventAccessType.INVITE_ONLY,
    capacity: 200,
    isPublic: false,
    hashtag: '#AfrobeatsNight',
    coverImageSeed: 'afrobeats-party',
    startHourOffset: 21,
    venue: {
      address: '530 Howard St',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      zipCode: '94105',
      latitude: 37.7873,
      longitude: -122.3964,
    },
    ownerIndex: 0,
    targetStatus: 'PUBLISHED',
    startDaysFromNow: 10,
    durationHours: 6,
    budgetTotal: 800000,
    collaboratorRole: EventUserType.VOLUNTEER,
    posts: [
      { content: 'Afrobeats Night is back! This time we\'re taking over a SF rooftop. Invite only — DM for access.', imageSeed: 'rooftop-party' },
      'The cocktail menu is curated by our friends at The Liquor Store. Get ready for some creative mixes.',
      'DJ Spinall confirmed! Plus two surprise guest performances.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Rooftop venue rental', estimatedCost: 250000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'DJ and performer fees', estimatedCost: 300000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Open bar and canapés', estimatedCost: 180000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Audio & Visual', description: 'Sound system and lighting', estimatedCost: 50000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Decorations & Flowers', description: 'Floral and lounge setup', estimatedCost: 20000, isEssential: false, priority: 'LOW' },
    ],
    tasks: [
      {
        title: 'Confirm performer lineup',
        description: 'Finalize contracts with DJ Spinall and guest artists.',
        priority: 'HIGH',
        category: 'Talent',
        checklist: [{ title: 'Sign DJ contract' }, { title: 'Confirm guest artists' }, { title: 'Arrange sound check schedule' }],
      },
      {
        title: 'Design invitation',
        description: 'Create a visually stunning digital invite for distribution.',
        priority: 'MEDIUM',
        category: 'Marketing',
        checklist: [],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 6. WEDDING — INVITE_ONLY / PUBLISHED
  // ---------------------------------------------------------------
  {
    name: 'Sarah & James Wedding',
    description:
      'Join us to celebrate the union of Sarah and James! Ceremony at 3 PM, reception to follow. Black-tie optional. Dinner, dancing, and an open bar until midnight.',
    eventType: EventType.WEDDING,
    accessType: EventAccessType.INVITE_ONLY,
    capacity: 150,
    isPublic: false,
    hashtag: '#SarahAndJames2025',
    coverImageSeed: 'wedding-park-avenue',
    eventWebsiteUrl: 'https://sarahandjames2025.wedding',
    startHourOffset: 15,
    mediaLibrarySeeds: ['wedding-venue', 'wedding-ceremony'],
    venue: {
      address: '500 Park Ave',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10022',
      latitude: 40.7636,
      longitude: -73.9712,
    },
    ownerIndex: 2,
    targetStatus: 'PUBLISHED',
    startDaysFromNow: 60,
    durationHours: 8,
    budgetTotal: 5000000,
    collaboratorRole: EventUserType.COORDINATOR,
    posts: [
      { content: 'We said YES! We\'re so thrilled to invite you to our special day. Save the date!', imageSeed: 'wedding-couple' },
      'Our wedding website is live with all the details — accommodations, registry, and RSVP.',
      'Sneak peek of the venue! The Park Avenue ballroom is going to be absolutely stunning.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Park Avenue Ballroom (ceremony + reception)', estimatedCost: 1200000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Sit-down dinner for 150 guests', estimatedCost: 1500000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Decorations & Flowers', description: 'Ceremony arch and table centerpieces', estimatedCost: 400000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'Photographer and videographer', estimatedCost: 350000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'Live band for reception', estimatedCost: 250000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Miscellaneous', description: 'Wedding dress and alterations', estimatedCost: 200000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Printing & Signage', description: 'Invitations, menus, and programs', estimatedCost: 50000, isEssential: false, priority: 'LOW' },
      { categoryName: 'Miscellaneous', description: 'Shuttle for guests', estimatedCost: 50000, isEssential: false, priority: 'LOW' },
    ],
    tasks: [
      {
        title: 'Book photographer',
        description: 'Research and book a wedding photographer and videographer.',
        priority: 'HIGH',
        category: 'Vendors',
        checklist: [{ title: 'Review portfolios' }, { title: 'Schedule consultations' }, { title: 'Sign contract' }],
      },
      {
        title: 'Order flowers',
        description: 'Finalize floral arrangements with the florist.',
        priority: 'HIGH',
        category: 'Decor',
        checklist: [{ title: 'Choose color palette' }, { title: 'Select centerpiece style' }, { title: 'Confirm delivery time' }],
      },
      {
        title: 'Finalize seating chart',
        description: 'Assign table seating for all confirmed guests.',
        priority: 'MEDIUM',
        category: 'Planning',
        checklist: [{ title: 'Collect RSVPs' }, { title: 'Group by family/friends' }, { title: 'Print place cards' }],
      },
      {
        title: 'Wedding rehearsal',
        description: 'Run through ceremony with bridal party the evening before.',
        priority: 'HIGH',
        category: 'Logistics',
        checklist: [],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 7. BIRTHDAY — RSVP_REQUIRED / PLANNING
  // ---------------------------------------------------------------
  {
    name: 'Tunde\'s 30th Birthday Bash',
    description:
      'Three decades of greatness deserve a proper celebration! Join us for music, food, and good vibes as we celebrate Tunde. Dress code: all white.',
    eventType: EventType.BIRTHDAY,
    accessType: EventAccessType.RSVP_REQUIRED,
    capacity: 80,
    isPublic: false,
    hashtag: '#Tunde30',
    coverImageSeed: 'birthday-bash-30',
    startHourOffset: 19,
    venue: {
      address: '15 Victoria Island Blvd',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      zipCode: '101241',
      latitude: 6.4281,
      longitude: 3.4132,
    },
    ownerIndex: 2,
    targetStatus: 'PLANNING',
    startDaysFromNow: 20,
    durationHours: 5,
    budgetTotal: 500000,
    collaboratorRole: EventUserType.VOLUNTEER,
    posts: [
      'It\'s officially planning season for Tunde\'s 30th! All white everything — mark your calendars.',
      'We\'ve got a surprise performance lined up. Trust us, you don\'t want to miss this.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Lounge rental', estimatedCost: 120000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Jollof rice, suya, and drinks', estimatedCost: 150000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'DJ and MC', estimatedCost: 80000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Decorations & Flowers', description: 'White and gold decorations', estimatedCost: 60000, isEssential: false, priority: 'MEDIUM' },
      { categoryName: 'Miscellaneous', description: 'Custom 3-tier birthday cake', estimatedCost: 40000, isEssential: true, priority: 'HIGH' },
    ],
    tasks: [
      {
        title: 'Order birthday cake',
        description: 'Commission a custom 3-tier cake from the bakery.',
        priority: 'HIGH',
        category: 'Vendors',
        checklist: [{ title: 'Choose flavor' }, { title: 'Approve design mockup' }, { title: 'Confirm delivery' }],
      },
      {
        title: 'Set up photo booth',
        description: 'Arrange a photo booth with props matching the all-white theme.',
        priority: 'LOW',
        category: 'Entertainment',
        checklist: [],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 8. CORPORATE_EVENT — TICKETED / PUBLISHED
  // ---------------------------------------------------------------
  {
    name: 'Enterprise Innovation Summit',
    description:
      'A full-day corporate event for enterprise leaders exploring digital transformation, AI adoption, and innovation strategy. Includes networking lunch and breakout sessions.',
    eventType: EventType.CORPORATE_EVENT,
    accessType: EventAccessType.TICKETED,
    capacity: 300,
    isPublic: true,
    hashtag: '#InnovationSummit',
    coverImageSeed: 'enterprise-summit',
    eventWebsiteUrl: 'https://innovation-summit.io',
    theme: 'Digital Transformation & AI',
    objectives: 'Enterprise leaders explore AI adoption, cloud strategy, innovation.',
    targetAudience: 'CTOs, VP Engineering, Innovation leads',
    registrationDeadlineDaysBeforeStart: 14,
    startHourOffset: 8,
    mediaLibrarySeeds: ['summit-keynote', 'summit-breakout', 'summit-networking'],
    venue: {
      address: '1 Infinite Loop',
      city: 'Cupertino',
      state: 'CA',
      country: 'United States',
      zipCode: '95014',
      latitude: 37.3318,
      longitude: -122.0312,
    },
    ownerIndex: 1,
    targetStatus: 'PUBLISHED',
    startDaysFromNow: 35,
    durationHours: 10,
    budgetTotal: 3000000,
    collaboratorRole: EventUserType.ORGANIZER,
    ticketTypes: [
      { name: 'General Admission', category: 'GENERAL_ADMISSION', description: 'Full day access to all sessions and networking lunch.', priceMinor: 29900, quantityAvailable: 150 },
      { name: 'VIP Executive', category: 'VIP', description: 'Front-row seating, executive lounge access, and private dinner.', priceMinor: 99900, quantityAvailable: 30 },
      { name: 'Student Pass', category: 'STUDENT', description: 'Discounted rate for full-time students with valid ID.', priceMinor: 9900, quantityAvailable: 50 },
      { name: 'Group Bundle (5+)', category: 'GROUP', description: 'Register 5+ people from the same organization for 20% off.', priceMinor: 23900, quantityAvailable: 70 },
    ],
    posts: [
      { content: 'The Enterprise Innovation Summit is here! Get your tickets now — early bird pricing ends soon.', imageSeed: 'corporate-conference' },
      'Breakout session topics announced: AI in Supply Chain, Cloud Migration Strategies, and Building Innovation Teams.',
      'We\'re partnering with Microsoft and AWS to bring you hands-on demos at the expo hall.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Conference center rental', estimatedCost: 600000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'Keynote speakers and moderators', estimatedCost: 800000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Audio & Visual', description: 'AV, staging, and livestream', estimatedCost: 400000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Breakfast, lunch, and refreshments', estimatedCost: 500000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Marketing & Promotion', description: 'LinkedIn and Google ads', estimatedCost: 300000, isEssential: false, priority: 'MEDIUM' },
      { categoryName: 'Gifts & Swag', description: 'Branded notebooks, pens, and bags', estimatedCost: 100000, isEssential: false, priority: 'LOW' },
    ],
    tasks: [
      {
        title: 'Secure keynote sponsors',
        description: 'Finalize sponsorship agreements with Microsoft and AWS.',
        priority: 'HIGH',
        category: 'Partnerships',
        checklist: [{ title: 'Draft sponsorship tiers' }, { title: 'Send proposals' }, { title: 'Negotiate contracts' }],
      },
      {
        title: 'Design breakout session schedule',
        description: 'Create the session grid with room assignments and time slots.',
        priority: 'MEDIUM',
        category: 'Content',
        checklist: [{ title: 'Collect session proposals' }, { title: 'Assign rooms' }, { title: 'Publish schedule' }],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 9. TRADE_SHOW — TICKETED / REGISTRATION_OPEN
  // ---------------------------------------------------------------
  {
    name: 'London Fashion Trade Show',
    description:
      'Connecting fashion brands, retailers, and buyers. Three days of runway shows, showroom exhibits, and B2B networking. Pre-registration required.',
    eventType: EventType.TRADE_SHOW,
    accessType: EventAccessType.TICKETED,
    capacity: 1500,
    isPublic: true,
    hashtag: '#LondonFashionTrade',
    coverImageSeed: 'fashion-trade-show',
    eventWebsiteUrl: 'https://londonfashiontrade.co.uk',
    registrationDeadlineDaysBeforeStart: 21,
    startHourOffset: 10,
    mediaLibrarySeeds: ['fashion-runway', 'fashion-booth'],
    venue: {
      address: '1 Grand Ave, Olympia',
      city: 'London',
      state: 'Greater London',
      country: 'United Kingdom',
      zipCode: 'W14 8UX',
      latitude: 51.4952,
      longitude: -0.2094,
    },
    ownerIndex: 0,
    targetStatus: 'REGISTRATION_OPEN',
    startDaysFromNow: 50,
    durationHours: 24,
    budgetTotal: 8000000,
    collaboratorRole: EventUserType.MEDIA,
    ticketTypes: [
      { name: 'Buyer Pass', category: 'PREMIUM', description: 'Full access to all showrooms, runway shows, and buyer-only networking.', priceMinor: 45000, quantityAvailable: 500 },
      { name: 'Exhibitor Booth', category: 'ALL_ACCESS', description: 'Includes booth space, setup, and all-area access for 3 days.', priceMinor: 250000, quantityAvailable: 100 },
      { name: 'Media Credential', category: 'BACKSTAGE', description: 'Press access including backstage, interviews, and press kit.', priceMinor: 0, quantityAvailable: 50 },
      { name: 'Single Day Entry', category: 'SINGLE_DAY', description: 'Access for one day of your choice.', priceMinor: 15000, quantityAvailable: 300 },
      { name: 'Weekend Pass', category: 'WEEKEND_PASS', description: 'Two-day pass covering Saturday and Sunday shows.', priceMinor: 25000, quantityAvailable: 200 },
      { name: 'Designer Pass', category: 'OTHER', description: 'Custom access for independent designers and emerging brands.', priceMinor: 75000, quantityAvailable: 50 },
    ],
    posts: [
      'London Fashion Trade Show registration is now OPEN! Secure your buyer pass or exhibitor booth today.',
      'Over 200 brands from 30 countries will be exhibiting. This is the fashion event of the season.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Olympia London (3 days)', estimatedCost: 2000000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Audio & Visual', description: 'Runway staging and lighting', estimatedCost: 1500000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Marketing & Promotion', description: 'Global PR and advertising', estimatedCost: 1200000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Staff & Security', description: 'Staff, security, and logistics', estimatedCost: 800000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Catering & Food', description: 'Catering and hospitality suite', estimatedCost: 600000, isEssential: false, priority: 'MEDIUM' },
    ],
    tasks: [
      {
        title: 'Confirm exhibitor list',
        description: 'Finalize all exhibitor registrations and booth assignments.',
        priority: 'HIGH',
        category: 'Operations',
        checklist: [{ title: 'Send booth confirmations' }, { title: 'Collect brand assets' }, { title: 'Create floor plan' }],
      },
      {
        title: 'Arrange media coverage',
        description: 'Invite fashion editors and coordinate press badges.',
        priority: 'MEDIUM',
        category: 'Marketing',
        checklist: [{ title: 'Send media invites' }, { title: 'Prepare press kits' }],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 10. CONCERT — TICKETED / PUBLISHED
  // ---------------------------------------------------------------
  {
    name: 'Summer Music Festival',
    description:
      'Three stages, twenty artists, one unforgettable weekend. General admission and VIP tickets available now. Food trucks, art installations, and surprise pop-up performances.',
    eventType: EventType.CONCERT,
    accessType: EventAccessType.TICKETED,
    capacity: 2000,
    isPublic: true,
    hashtag: '#SummerFest2025',
    coverImageSeed: 'music-festival',
    eventWebsiteUrl: 'https://summerfest2025.com',
    registrationDeadlineDaysBeforeStart: 30,
    startHourOffset: 12,
    mediaLibrarySeeds: ['fest-main-stage', 'fest-crowd', 'fest-foodtrucks', 'fest-art'],
    ticketPromo: { ticketTypeIndex: 2, code: 'SUMMER20', percentOffBasisPoints: 2000 },
    theme: 'Three Stages, Twenty Artists',
    objectives: 'Celebrate live music; connect artists and fans.',
    targetAudience: 'Music lovers, festival-goers',
    venue: {
      address: '201 E Randolph St',
      city: 'Chicago',
      state: 'IL',
      country: 'United States',
      zipCode: '60602',
      latitude: 41.8826,
      longitude: -87.6226,
    },
    ownerIndex: 1,
    targetStatus: 'PUBLISHED',
    startDaysFromNow: 40,
    durationHours: 48,
    budgetTotal: 15000000,
    collaboratorRole: EventUserType.STAFF,
    ticketTypes: [
      { name: 'General Admission', category: 'GENERAL_ADMISSION', description: 'Standard festival entry with access to all three stages.', priceMinor: 7500, quantityAvailable: 1000 },
      { name: 'VIP Experience', category: 'VIP', description: 'VIP lounge, complimentary drinks, and front-row viewing.', priceMinor: 22500, quantityAvailable: 200 },
      { name: 'Early Bird Special', category: 'EARLY_BIRD', description: 'Limited early-bird pricing — same as General Admission.', priceMinor: 4500, quantityAvailable: 400 },
      { name: 'Meet & Greet Package', category: 'MEET_AND_GREET', description: 'Backstage access and meet & greet with headliners.', priceMinor: 50000, quantityAvailable: 25 },
      { name: 'Standing Room', category: 'STANDING_ROOM', description: 'Standing area near the main stage.', priceMinor: 5000, quantityAvailable: 250 },
      { name: 'Reserved Seating', category: 'RESERVED_SEATING', description: 'Assigned seat in the amphitheater section.', priceMinor: 12000, quantityAvailable: 125 },
    ],
    posts: [
      { content: 'Summer Music Festival lineup just dropped! 20 artists across 3 stages — tickets on sale now.', imageSeed: 'festival-stage' },
      'Early bird tickets are flying — only 100 left at the discounted price!',
      'Food truck lineup revealed: tacos, ramen, BBQ, vegan bowls, and more. Come hungry!',
      'Art installations preview: interactive light tunnels, graffiti walls, and a drone light show on Saturday night.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Grant Park permit and setup', estimatedCost: 2000000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'Artist performance fees', estimatedCost: 6000000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Audio & Visual', description: '3-stage sound and lighting', estimatedCost: 3000000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Staff & Security', description: 'Security, medical, and staff', estimatedCost: 1500000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Marketing & Promotion', description: 'Nationwide marketing campaign', estimatedCost: 1000000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Catering & Food', description: 'Food truck coordination and bar setup', estimatedCost: 800000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Miscellaneous', description: 'Art installations and drone show', estimatedCost: 500000, isEssential: false, priority: 'LOW' },
    ],
    tasks: [
      {
        title: 'Finalize artist contracts',
        description: 'Complete contract negotiations and advance payments for all 20 artists.',
        priority: 'HIGH',
        category: 'Talent',
        checklist: [{ title: 'Draft contracts' }, { title: 'Get legal review' }, { title: 'Process deposits' }],
      },
      {
        title: 'Coordinate food vendors',
        description: 'Secure 10+ food trucks and assign locations on festival grounds.',
        priority: 'MEDIUM',
        category: 'Operations',
        checklist: [{ title: 'Send vendor applications' }, { title: 'Review health permits' }, { title: 'Assign spots' }],
      },
      {
        title: 'Stage setup walkthrough',
        description: 'On-site coordination with production crew for all three stages.',
        priority: 'HIGH',
        category: 'Production',
        checklist: [],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 11. FESTIVAL — OPEN / PUBLISHED
  // ---------------------------------------------------------------
  {
    name: 'Aso Rock Cultural Festival',
    description:
      'A celebration of African music, art, food, and culture at the foot of Aso Rock. Three days of live performances, artisan markets, and storytelling circles.',
    eventType: EventType.FESTIVAL,
    accessType: EventAccessType.OPEN,
    capacity: 5000,
    isPublic: true,
    hashtag: '#AsoRockFest',
    coverImageSeed: 'cultural-festival',
    startHourOffset: 10,
    mediaLibrarySeeds: ['festival-stage', 'festival-artisan'],
    venue: {
      address: 'Millennium Park',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria',
      zipCode: '900001',
      latitude: 9.0765,
      longitude: 7.4898,
    },
    ownerIndex: 2,
    targetStatus: 'PUBLISHED',
    startDaysFromNow: 55,
    durationHours: 72,
    budgetTotal: 10000000,
    collaboratorRole: EventUserType.SPONSOR,
    posts: [
      { content: 'Aso Rock Cultural Festival is coming back bigger than ever! Three days of music, art, and community.', imageSeed: 'african-festival' },
      'Artisan market registration is open — if you\'re a local craftsperson, apply for a free booth.',
      'Storytelling circles with elder griots start at sunset each evening. Bring a blanket and an open heart.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Millennium Park permit and infrastructure', estimatedCost: 1500000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'Musicians and performers (3 days)', estimatedCost: 3000000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Audio & Visual', description: 'Main stage and satellite stages', estimatedCost: 2000000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Vendor coordination and free water stations', estimatedCost: 500000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Marketing & Promotion', description: 'National radio and billboard campaign', estimatedCost: 800000, isEssential: false, priority: 'MEDIUM' },
      { categoryName: 'Miscellaneous', description: 'Booth setup and signage', estimatedCost: 200000, isEssential: false, priority: 'LOW' },
    ],
    tasks: [
      {
        title: 'Secure government permits',
        description: 'Obtain all necessary permits from FCT for the 3-day outdoor event.',
        priority: 'HIGH',
        category: 'Legal',
        checklist: [{ title: 'Submit application to FCT' }, { title: 'Pay fees' }, { title: 'Receive approval' }],
      },
      {
        title: 'Coordinate artisan vendors',
        description: 'Review vendor applications and assign booth locations.',
        priority: 'MEDIUM',
        category: 'Operations',
        checklist: [{ title: 'Review 100+ applications' }, { title: 'Select 50 vendors' }, { title: 'Send confirmations' }],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 12. SPORTS_EVENT — TICKETED / REGISTRATION_OPEN
  // ---------------------------------------------------------------
  {
    name: 'Lagos City Marathon 2025',
    description:
      'The 10th annual Lagos City Marathon — a 42km full marathon and 10km fun run through the heart of Lagos. Open to runners of all levels. Timed, chipped, and certified.',
    eventType: EventType.SPORTS_EVENT,
    accessType: EventAccessType.TICKETED,
    capacity: 3000,
    isPublic: true,
    hashtag: '#LagosCityMarathon',
    coverImageSeed: 'marathon-runners',
    eventWebsiteUrl: 'https://lagoscitymarathon.org',
    registrationDeadlineDaysBeforeStart: 14,
    startHourOffset: 6,
    mediaLibrarySeeds: ['marathon-start', 'marathon-finish'],
    venue: {
      address: 'Tafawa Balewa Square',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      zipCode: '101001',
      latitude: 6.4531,
      longitude: 3.3958,
    },
    ownerIndex: 0,
    targetStatus: 'REGISTRATION_OPEN',
    startDaysFromNow: 70,
    durationHours: 8,
    budgetTotal: 4000000,
    collaboratorRole: EventUserType.COORDINATOR,
    ticketTypes: [
      { name: 'Full Marathon (42km)', category: 'GENERAL_ADMISSION', description: 'Full marathon registration with timing chip and finisher medal.', priceMinor: 5000, quantityAvailable: 1500 },
      { name: '10km Fun Run', category: 'EARLY_BIRD', description: 'Casual 10km run — perfect for beginners.', priceMinor: 2000, quantityAvailable: 1000 },
      { name: 'Senior Runner (60+)', category: 'SENIOR', description: 'Discounted registration for runners aged 60 and above.', priceMinor: 1000, quantityAvailable: 100 },
      { name: 'Child Runner (Under 12)', category: 'CHILD', description: '1km kids dash — fun for the whole family.', priceMinor: 500, quantityAvailable: 200 },
      { name: 'Season Pass (All Races)', category: 'SEASON_PASS', description: 'Entry to all 4 races in the Lagos running series.', priceMinor: 15000, quantityAvailable: 100 },
    ],
    posts: [
      'Registration for Lagos City Marathon 2025 is OPEN! Full marathon, 10km fun run, and kids dash.',
      'Training tip: Start your long runs now — 10 weeks to race day. We believe in you!',
      'Route map released! The course winds through Lagos Island, past the National Museum, and finishes at TBS.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Road closures and permits', estimatedCost: 500000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Staff & Security', description: 'Timing system and chip technology', estimatedCost: 800000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Staff & Security', description: 'Medical support and water stations', estimatedCost: 600000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Gifts & Swag', description: 'Runner bibs, finisher medals, and t-shirts', estimatedCost: 400000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Marketing & Promotion', description: 'Social media and radio advertising', estimatedCost: 300000, isEssential: false, priority: 'MEDIUM' },
    ],
    tasks: [
      {
        title: 'Set up water stations',
        description: 'Place water and electrolyte stations every 5km along the route.',
        priority: 'HIGH',
        category: 'Logistics',
        checklist: [{ title: 'Map station locations' }, { title: 'Order supplies' }, { title: 'Recruit volunteers' }],
      },
      {
        title: 'Order finisher medals',
        description: 'Design and manufacture custom medals for all finishers.',
        priority: 'MEDIUM',
        category: 'Operations',
        checklist: [{ title: 'Approve design' }, { title: 'Place order' }],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 13. CHARITY_EVENT — RSVP_REQUIRED / PUBLISHED
  // ---------------------------------------------------------------
  {
    name: 'Hope Foundation Annual Gala',
    description:
      'An elegant evening supporting education for underprivileged children. Silent auction, live entertainment, and a keynote from Nobel laureate Malala Yousafzai. All proceeds go to building schools.\n\nThis year we\'re raising funds to build 10 new schools in West Africa. Every dollar counts. Join us for dinner, music, and inspiration. 🎗️',
    eventType: EventType.CHARITY_EVENT,
    accessType: EventAccessType.RSVP_REQUIRED,
    capacity: 250,
    isPublic: true,
    hashtag: '#HopeGala2025',
    coverImageSeed: 'charity-gala',
    eventWebsiteUrl: 'https://hopefoundation.org/gala2025',
    registrationDeadlineDaysBeforeStart: 10,
    startHourOffset: 18,
    mediaLibrarySeeds: ['gala-ballroom', 'gala-auction'],
    venue: {
      address: 'The Ritz-Carlton, 50 Central Park South',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10019',
      latitude: 40.7649,
      longitude: -73.9762,
    },
    ownerIndex: 2,
    targetStatus: 'PUBLISHED',
    startDaysFromNow: 25,
    durationHours: 5,
    budgetTotal: 2000000,
    collaboratorRole: EventUserType.ORGANIZER,
    posts: [
      { content: 'The Hope Foundation Annual Gala is back! Join us for an evening of giving, elegance, and impact.', imageSeed: 'charity-event' },
      'This year we\'re raising funds to build 10 new schools in West Africa. Every donation counts.',
      'Silent auction items include: a private yacht dinner, courtside NBA tickets, and a signed Wizkid guitar.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Ritz-Carlton ballroom', estimatedCost: 500000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Seated dinner and premium bar', estimatedCost: 600000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'Live jazz quartet and DJ', estimatedCost: 200000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Decorations & Flowers', description: 'Floral arrangements and lighting', estimatedCost: 150000, isEssential: false, priority: 'MEDIUM' },
      { categoryName: 'Marketing & Promotion', description: 'Event program and printed materials', estimatedCost: 50000, isEssential: false, priority: 'LOW' },
    ],
    tasks: [
      {
        title: 'Source auction items',
        description: 'Reach out to donors and sponsors for silent auction contributions.',
        priority: 'HIGH',
        category: 'Fundraising',
        checklist: [{ title: 'Contact 20 potential donors' }, { title: 'Catalog confirmed items' }, { title: 'Set starting bids' }],
      },
      {
        title: 'Design event program',
        description: 'Create a printed program with the evening schedule and donor acknowledgments.',
        priority: 'MEDIUM',
        category: 'Marketing',
        checklist: [],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 14. NETWORKING — OPEN / PLANNING
  // ---------------------------------------------------------------
  {
    name: 'Founders Mixer NYC',
    description:
      'Casual evening mixer for startup founders, angel investors, and VCs. No agenda, no pitches — just authentic conversations over craft cocktails.',
    eventType: EventType.NETWORKING,
    accessType: EventAccessType.OPEN,
    capacity: 100,
    isPublic: true,
    hashtag: '#FoundersMixer',
    coverImageSeed: 'founders-networking',
    startHourOffset: 19,
    isSparseEvent: true,
    noVenue: true,
    theme: 'Authentic Founder Conversations',
    objectives: 'No pitches, no slides — real connections over drinks.',
    targetAudience: 'Startup founders, angels, VCs',
    venue: {
      address: '60 E 42nd St',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10165',
      latitude: 40.7527,
      longitude: -73.9772,
    },
    ownerIndex: 1,
    targetStatus: 'PLANNING',
    startDaysFromNow: 7,
    durationHours: 3,
    budgetTotal: 200000,
    collaboratorRole: EventUserType.COLLABORATOR,
    posts: [
      'Founders Mixer NYC is happening! No pitches, no slides — just real conversations. Open to all.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Rooftop bar rental', estimatedCost: 80000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Cocktails and appetizers', estimatedCost: 100000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Printing & Signage', description: 'Name tags and event signage', estimatedCost: 5000, isEssential: false, priority: 'LOW' },
    ],
    tasks: [
      {
        title: 'Book rooftop venue',
        description: 'Confirm reservation and deposit for the rooftop bar.',
        priority: 'HIGH',
        category: 'Logistics',
        checklist: [{ title: 'Sign contract' }, { title: 'Pay deposit' }],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 15. TRAINING — RSVP_REQUIRED / REGISTRATION_OPEN
  // ---------------------------------------------------------------
  {
    name: 'AWS Cloud Practitioner Bootcamp',
    description:
      'Intensive 2-day training to prepare for the AWS Cloud Practitioner certification. Hands-on labs, practice exams, and expert instruction. Laptop required.',
    eventType: EventType.TRAINING,
    accessType: EventAccessType.RSVP_REQUIRED,
    capacity: 40,
    isPublic: true,
    hashtag: '#AWSBootcamp',
    coverImageSeed: 'cloud-training',
    registrationDeadlineDaysBeforeStart: 5,
    startHourOffset: 9,
    venue: {
      address: '1918 8th Ave',
      city: 'Seattle',
      state: 'WA',
      country: 'United States',
      zipCode: '98101',
      latitude: 47.6162,
      longitude: -122.3321,
    },
    ownerIndex: 0,
    targetStatus: 'REGISTRATION_OPEN',
    startDaysFromNow: 18,
    durationHours: 16,
    budgetTotal: 400000,
    collaboratorRole: EventUserType.STAFF,
    posts: [
      'AWS Cloud Practitioner Bootcamp — 2 days, hands-on labs, and a practice exam. RSVP now!',
      'Day 1 covers cloud fundamentals and core services. Day 2 is all practice exams and deep dives.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities',description: 'Training room rental (2 days)', estimatedCost: 100000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'AWS-certified instructor fee', estimatedCost: 200000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Printing & Signage', description: 'Lab environment licenses (40 seats)', estimatedCost: 60000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Lunch and coffee for 40 (2 days)', estimatedCost: 40000, isEssential: true, priority: 'MEDIUM' },
    ],
    tasks: [
      {
        title: 'Set up AWS lab environments',
        description: 'Provision 40 sandbox AWS accounts for hands-on labs.',
        priority: 'HIGH',
        category: 'Technical',
        checklist: [{ title: 'Create IAM accounts' }, { title: 'Configure VPCs' }, { title: 'Test lab exercises' }],
      },
      {
        title: 'Print certification study guides',
        description: 'Prepare study materials and practice exam booklets.',
        priority: 'MEDIUM',
        category: 'Materials',
        checklist: [],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 16. RETREAT — INVITE_ONLY / DRAFT
  // ---------------------------------------------------------------
  {
    name: 'Team Wellness Retreat',
    description:
      'A 3-day off-site retreat for the engineering team focused on wellness, team building, and strategic planning. Yoga, hiking, workshops, and fireside chats.',
    eventType: EventType.RETREAT,
    accessType: EventAccessType.INVITE_ONLY,
    capacity: 20,
    isPublic: false,
    hashtag: '#WellnessRetreat',
    coverImageSeed: 'wellness-retreat',
    startHourOffset: 14,
    venue: {
      address: '1000 Highlands Rd',
      city: 'Aspen',
      state: 'CO',
      country: 'United States',
      zipCode: '81611',
      latitude: 39.1911,
      longitude: -106.8175,
    },
    ownerIndex: 2,
    targetStatus: 'CANCELLED',
    startDaysFromNow: 90,
    durationHours: 72,
    budgetTotal: 2000000,
    collaboratorRole: EventUserType.ORGANIZER,
    posts: [
      'Unfortunately the Wellness Retreat is cancelled due to budget reallocation. We\'ll revisit next quarter.',
    ],
    budgetItems: [
      { categoryName: 'Venue & Facilities', description: 'Lodge rental (3 nights, 20 rooms)', estimatedCost: 800000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'All meals for 3 days', estimatedCost: 300000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Speakers & Talent', description: 'Yoga instructor and guided hikes', estimatedCost: 150000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Miscellaneous', description: 'Airport shuttle service', estimatedCost: 50000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Speakers & Talent', description: 'Team building workshop facilitator', estimatedCost: 100000, isEssential: false, priority: 'MEDIUM' },
    ],
    tasks: [
      {
        title: 'Book lodge accommodation',
        description: 'Reserve the mountain lodge for 3 nights with 20 rooms.',
        priority: 'HIGH',
        category: 'Logistics',
        checklist: [{ title: 'Compare lodge options' }, { title: 'Confirm availability' }, { title: 'Pay deposit' }],
      },
      {
        title: 'Plan daily schedule',
        description: 'Create a balanced itinerary mixing work sessions and activities.',
        priority: 'MEDIUM',
        category: 'Planning',
        checklist: [{ title: 'Morning: yoga + breakfast' }, { title: 'Midday: strategic sessions' }, { title: 'Afternoon: outdoor activities' }],
      },
    ],
  },

  // ---------------------------------------------------------------
  // 17. OTHER — OPEN / REGISTRATION_CLOSED
  // ---------------------------------------------------------------
  {
    name: 'Community Cleanup Day',
    description:
      'Volunteer day to clean up Victoria Island beaches and plant 200 trees. Gloves, bags, and refreshments provided. Bring sunscreen and good energy!',
    eventType: EventType.OTHER,
    accessType: EventAccessType.OPEN,
    capacity: 100,
    isPublic: true,
    hashtag: '#CleanUpLagos',
    coverImageSeed: 'beach-cleanup',
    startHourOffset: 7,
    venue: {
      address: 'Bar Beach, Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      zipCode: '101241',
      latitude: 6.4186,
      longitude: 3.4106,
    },
    ownerIndex: 0,
    targetStatus: 'REGISTRATION_CLOSED',
    startDaysFromNow: 5,
    durationHours: 4,
    budgetTotal: 100000,
    collaboratorRole: EventUserType.VOLUNTEER,
    posts: [
      { content: 'Community Cleanup Day is this weekend! 200 trees to plant, 2km of beach to clean. Let\'s go!', imageSeed: 'volunteer-beach' },
      'All supplies provided — just bring yourself and sunscreen. We start at 7 AM sharp.',
    ],
    budgetItems: [
      { categoryName: 'Miscellaneous', description: 'Gloves, trash bags, and tools', estimatedCost: 30000, actualCost: 28500, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Miscellaneous', description: '200 tree seedlings', estimatedCost: 40000, isEssential: true, priority: 'HIGH' },
      { categoryName: 'Catering & Food', description: 'Water and snacks for volunteers', estimatedCost: 20000, isEssential: true, priority: 'MEDIUM' },
      { categoryName: 'Printing & Signage', description: 'Volunteer t-shirts', estimatedCost: 10000, isEssential: false, priority: 'LOW' },
    ],
    theme: 'Community & Environment',
    objectives: 'Clean 2km of beach; plant 200 trees.',
    targetAudience: 'Volunteers, eco-conscious community',
    tasks: [
      {
        title: 'Procure cleanup supplies',
        description: 'Purchase gloves, trash bags, and tools for 100 volunteers.',
        priority: 'HIGH',
        category: 'Procurement',
        checklist: [{ title: 'Get quotes from 3 vendors' }, { title: 'Place order' }, { title: 'Arrange delivery to site' }],
      },
      {
        title: 'Coordinate with forestry department',
        description: 'Confirm delivery of 200 tree seedlings and get planting guidance.',
        priority: 'HIGH',
        category: 'Partnerships',
        checklist: [{ title: 'Contact forestry office' }, { title: 'Confirm seedling species' }],
      },
    ],
  },

];

// ---------------------------------------------------------------------------
// Comments (used across events)
// ---------------------------------------------------------------------------

export const POST_COMMENTS: string[][] = [
  [
    'This is going to be amazing! Can\'t wait.',
    'Count me in! Will there be a live stream for remote attendees?',
    'Great lineup — looking forward to this!',
  ],
  [
    'Just RSVP\'d! See you there.',
    'Any parking tips for the venue?',
  ],
  [
    'Love the energy around this event. Shared it with my team.',
    'Is there a dress code?',
    'Can\'t make it this time but hope you do it again!',
  ],
  [
    'Incredible initiative. Happy to support!',
    'How can we volunteer?',
  ],
  [
    'Bringing the whole crew — this is exactly what we needed.',
    'Venue looks stunning. Early bird secured!',
    'Who else from the team is going?',
  ],
  [
    'Already on the waitlist. Fingers crossed!',
    'Will there be recordings for those who miss it?',
    'Perfect timing for our Q4 planning.',
  ],
];

// ---------------------------------------------------------------------------
// External email attendees (for invite-only events)
// ---------------------------------------------------------------------------

export const EXTERNAL_ATTENDEES = [
  { email: 'alex.johnson@example.com', name: 'Alex Johnson' },
  { email: 'priya.patel@example.com', name: 'Priya Patel' },
  { email: 'david.chen@example.com', name: 'David Chen' },
  { email: 'fatima.diallo@example.com', name: 'Fatima Diallo' },
  { email: 'kenji.tanaka@example.com', name: 'Kenji Tanaka' },
  { email: 'maria.santos@example.com', name: 'Maria Santos' },
  { email: 'oluwaseun.ade@example.com', name: 'Oluwaseun Ade' },
  { email: 'emily.wright@example.com', name: 'Emily Wright' },
  { email: 'rahul.sharma@example.com', name: 'Rahul Sharma' },
  { email: 'chiara.rossi@example.com', name: 'Chiara Rossi' },
];

// ---------------------------------------------------------------------------
// Quote post templates (used when another user quotes a post)
// ---------------------------------------------------------------------------

export const QUOTE_TEXTS = [
  'This is going to be one for the books!',
  'Sharing this with everyone I know. Don\'t sleep on this event.',
  'Absolutely love what this team is putting together.',
  'Big things coming — make sure you\'re part of it.',
  'My team is already planning our trip. See you there!',
  'Bookmarked. This is exactly the kind of event I\'ve been waiting for.',
];

// ---------------------------------------------------------------------------
// Repost texts (used when users repost without a quote)
// ---------------------------------------------------------------------------

export const REPOST_COMMENT_TEXTS = [
  'Everyone needs to see this.',
  'Spreading the word — this is too good to miss.',
  'Signal boosting! Don\'t sleep on this.',
];

// ---------------------------------------------------------------------------
// User profile variations (applied to test users)
// ---------------------------------------------------------------------------

export const USER_PROFILE_UPDATES = [
  {
    name: 'Mayowa Akinwale',
    phoneNumber: '+2348012345678',
    dateOfBirth: '1994-06-15',
    bio: 'Building the future of African tech. Founder at DevCraft. Lagos → SF.',
  },
  {
    name: 'Adaeze Okonkwo',
    phoneNumber: '+14155551234',
    dateOfBirth: '1996-03-22',
    bio: 'Design lead & angel investor. Passionate about founder communities and AI.',
  },
  {
    name: 'Chinedu Eze',
    phoneNumber: '+447911123456',
    dateOfBirth: '1992-11-08',
    bio: 'Event producer & community builder. Making moments matter. Wedding season! 💒',
  },
];

/** Picsum seeds for user profile avatars — different per user */
export const USER_AVATAR_SEEDS = ['mayowa-avatar', 'adaeze-avatar', 'chinedu-avatar'];

// ---------------------------------------------------------------------------
// User notification settings variations
// ---------------------------------------------------------------------------

export const USER_NOTIFICATION_SETTINGS = [
  {
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    eventInvitationsEnabled: true,
    eventUpdatesEnabled: true,
    eventRemindersEnabled: true,
    rsvpNotificationsEnabled: true,
    commentNotificationsEnabled: true,
    collaborationRequestsEnabled: true,
    weeklyDigestEnabled: true,
    activityFeedNotificationsEnabled: true,
    reminderTimingMinutes: 30,
  },
  {
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: false,
    smsNotificationsEnabled: true,
    eventInvitationsEnabled: true,
    eventUpdatesEnabled: false,
    eventRemindersEnabled: true,
    rsvpNotificationsEnabled: false,
    commentNotificationsEnabled: true,
    collaborationRequestsEnabled: false,
    weeklyDigestEnabled: false,
    activityFeedNotificationsEnabled: true,
    reminderTimingMinutes: 60,
  },
  {
    emailNotificationsEnabled: false,
    pushNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    eventInvitationsEnabled: true,
    eventUpdatesEnabled: true,
    eventRemindersEnabled: false,
    rsvpNotificationsEnabled: true,
    commentNotificationsEnabled: false,
    collaborationRequestsEnabled: true,
    weeklyDigestEnabled: true,
    activityFeedNotificationsEnabled: false,
    reminderTimingMinutes: 15,
  },
];

// ---------------------------------------------------------------------------
// User privacy settings variations
// ---------------------------------------------------------------------------

export const USER_PRIVACY_SETTINGS = [
  {
    profileVisibility: VisibilityLevel.PUBLIC,
    eventParticipationVisibility: VisibilityLevel.PUBLIC,
    searchVisibility: true,
    showInEventDirectory: true,
  },
  {
    profileVisibility: VisibilityLevel.PRIVATE,
    eventParticipationVisibility: VisibilityLevel.PRIVATE,
    searchVisibility: true,
    showInEventDirectory: true,
  },
  {
    profileVisibility: VisibilityLevel.PRIVATE,
    eventParticipationVisibility: VisibilityLevel.PRIVATE,
    searchVisibility: false,
    showInEventDirectory: false,
  },
];

// ---------------------------------------------------------------------------
// User security settings variations
// ---------------------------------------------------------------------------

export const USER_SECURITY_SETTINGS = [
  { mfaEnabled: false, autoAcceptInvitations: false, exportEventDataEnabled: true },
  { mfaEnabled: false, autoAcceptInvitations: true, exportEventDataEnabled: true },
  { mfaEnabled: false, autoAcceptInvitations: false, exportEventDataEnabled: false },
];

// ---------------------------------------------------------------------------
// Event reminder templates (applied per-event)
// ---------------------------------------------------------------------------

export const EVENT_REMINDERS = [
  {
    title: '1 Week Reminder',
    description: 'The event is one week away! Make sure you have everything ready.',
    channel: 'push',
    reminderType: 'custom',
    offsetDays: -7,
  },
  {
    title: '1 Day Reminder',
    description: 'Tomorrow is the big day! Don\'t forget to bring your essentials.',
    channel: 'push',
    reminderType: 'event_start',
    offsetDays: -1,
  },
  {
    title: 'Day-of Reminder',
    description: 'The event starts today! See you soon.',
    channel: 'push',
    reminderType: 'event_start',
    offsetDays: 0,
  },
];

// ---------------------------------------------------------------------------
// Ticket type template data (reusable templates)
// ---------------------------------------------------------------------------

export const TICKET_TYPE_TEMPLATES = [
  {
    name: 'Conference Standard Bundle',
    category: 'GENERAL_ADMISSION' as const,
    description: 'Standard conference ticket template — covers general admission with lunch.',
    priceMinor: 19900,
    currency: 'USD',
    quantityAvailable: 500,
  },
  {
    name: 'Workshop Limited Seat',
    category: 'EARLY_BIRD' as const,
    description: 'Early-bird workshop template — limited seats at a discounted rate.',
    priceMinor: 4900,
    currency: 'USD',
    quantityAvailable: 50,
  },
];
