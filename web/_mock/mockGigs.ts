import {
  EContentTypes,
  EToneKeywords,
  EGigEvent,
  ESubmissionStatus,
  ENicheKeywords,
} from "@/schema/enum.schema";
import { GigStatus, IGigMetadata } from "@/schema/gig.schema";

// Mock onchain data (representing what we'd get from blockchain)
export const mockOnchainGigs = {
  // Gigs for creator1
  "0x6F77340aE4D1933B5fd1b7eCC034298833Ec68CE": [
    {
      gigId: "1",
      creator: "0x6F77340aE4D1933B5fd1b7eCC034298833Ec68CE",
      writer: "0xWriter1...",
      amount: "120000000", // 120 USDC (with 6 decimals)
      status: GigStatus.ASSIGNED,
      createdAt: 1714816800,
      lastUpdated: 1714830000,
    },
    {
      gigId: "2",
      creator: "0x6F77340aE4D1933B5fd1b7eCC034298833Ec68CE",
      writer: null,
      amount: "90000000", // 90 USDC
      status: GigStatus.PENDING,
      createdAt: 1714551300,
      lastUpdated: 1714551300,
    },
    {
      gigId: "3",
      creator: "0x6F77340aE4D1933B5fd1b7eCC034298833Ec68CE",
      writer: "0xWriter2...",
      amount: "150000000", // 150 USDC
      status: GigStatus.SUBMITTED,
      createdAt: 1714401300,
      lastUpdated: 1714520000,
    },
  ],

  // Gigs for creator2
  "0xCreator2...": [
    {
      gigId: "4",
      creator: "0xCreator2...",
      writer: "0xWriter1...",
      amount: "200000000", // 200 USDC
      status: GigStatus.APPROVED,
      createdAt: 1714301300,
      lastUpdated: 1714610000,
    },
  ],

  // Gigs for writer1
  "0xWriter1...": [
    {
      gigId: "1",
      creator: "0x6F77340aE4D1933B5fd1b7eCC034298833Ec68CE",
      writer: "0xWriter1...",
      amount: "120000000",
      status: GigStatus.ASSIGNED,
      createdAt: 1714816800,
      lastUpdated: 1714830000,
    },
    {
      gigId: "4",
      creator: "0xCreator2...",
      writer: "0xWriter1...",
      amount: "200000000",
      status: GigStatus.APPROVED,
      createdAt: 1714301300,
      lastUpdated: 1714610000,
    },
  ],

  // Gigs for writer2
  "0xWriter2...": [
    {
      gigId: "3",
      creator: "0x6F77340aE4D1933B5fd1b7eCC034298833Ec68CE",
      writer: "0xWriter2...",
      amount: "150000000",
      status: GigStatus.SUBMITTED,
      createdAt: 1714401300,
      lastUpdated: 1714520000,
    },
  ],
};

// Mock offchain metadata (stored in Firebase)
export const mockGigMetadata: Record<string, IGigMetadata> = {
  // GigId as key
  "1": {
    title: "Launch Tweet Thread for AI Tool",
    description:
      "Create a compelling thread announcing our new AI tool focusing on key features and benefits",
    contentType: EContentTypes.SOCIAL_THREAD,
    toneKeywords: [
      EToneKeywords.WITTY,
      EToneKeywords.ANALYTICAL,
      EToneKeywords.BOLD,
    ],
    nicheKeywords: [ENicheKeywords.AI_ML],
    wordCount: 500,
    deadline: 1715330000, // 1 week from creation
    invitedGhostwriters: ["0xWriter1...", "0xWriter3..."],
    submissions: [],
    history: [
      {
        event: EGigEvent.GIG_CREATED,
        timestamp: 1715330000,
      },
      {
        event: EGigEvent.INVITE_SENT,
        by: "0x6F77340aE4D1933B5fd1b7eCC034298833Ec68CE",
        timestamp: 1715330300, // 5 minutes after creation
        details: { writer: "0xWriter1..." },
      },
      {
        event: EGigEvent.INVITE_ACCEPTED,
        by: "0xWriter1...",
        timestamp: 1715344200, // 4.5 hours after invite
      },
    ],
  },

  "2": {
    title: "About Me Bio for Creator Portfolio",
    description:
      "Professional bio for my personal website highlighting my expertise in digital content creation",
    contentType: EContentTypes.PERSONAL_BIO,
    toneKeywords: [
      EToneKeywords.PROFESSIONAL,
      EToneKeywords.FRIENDLY,
      EToneKeywords.INSPIRATIONAL,
    ],
    nicheKeywords: [ENicheKeywords.DESIGN],
    wordCount: 300,
    deadline: 1715100000,
    invitedGhostwriters: [],
    submissions: [],
    history: [
      {
        event: EGigEvent.GIG_CREATED,
        timestamp: 1714551300,
      },
    ],
  },

  "3": {
    title: "Cryptocurrency Market Analysis Article",
    description:
      "In-depth analysis of recent market trends with focus on DeFi innovations",
    contentType: EContentTypes.BLOG_NEWSLETTER,
    toneKeywords: [
      EToneKeywords.ANALYTICAL,
      EToneKeywords.EDUCATIONAL,
      EToneKeywords.AUTHORITATIVE,
    ],
    nicheKeywords: [ENicheKeywords.WEB3_CRYPTO, ENicheKeywords.DEFI],
    wordCount: 1500,
    deadline: 1714950000,
    invitedGhostwriters: ["0xWriter2..."],
    submissions: [
      {
        submissionId: "sub_001",
        submittedBy: "0xWriter2...",
        previewLink: "https://firestore.mock/articles/sub_001",
        status: ESubmissionStatus.PENDING_REVIEW,
        submittedAt: "2024-05-01T16:30:00Z",
      },
    ],
    history: [
      {
        event: EGigEvent.GIG_CREATED,
        timestamp: 1714401300,
      },
      {
        event: EGigEvent.INVITE_SENT,
        by: "0x6F77340aE4D1933B5fd1b7eCC034298833Ec68CE",
        timestamp: 1714401600,
        details: { writer: "0xWriter2..." },
      },
      {
        event: EGigEvent.INVITE_ACCEPTED,
        by: "0xWriter2...",
        timestamp: 1714468500,
      },
      {
        event: EGigEvent.DRAFT_SUBMITTED,
        by: "0xWriter2...",
        timestamp: 1714520000,
        details: { submissionId: "sub_001" },
      },
    ],
  },

  "4": {
    title: "Weekly Tech Newsletter",
    description:
      "Engaging newsletter covering latest tech trends and startup news",
    contentType: EContentTypes.BLOG_NEWSLETTER,
    toneKeywords: [
      EToneKeywords.CASUAL,
      EToneKeywords.WITTY,
      EToneKeywords.EDUCATIONAL,
    ],
    nicheKeywords: [ENicheKeywords.TECH_NEWS],
    wordCount: 1000,
    deadline: 1714700000,
    invitedGhostwriters: ["0xWriter1..."],
    submissions: [
      {
        submissionId: "sub_002",
        submittedBy: "0xWriter1...",
        previewLink: "https://firestore.mock/newsletters/sub_002",
        status: ESubmissionStatus.APPROVED,
        submittedAt: "2024-04-30T15:20:00Z",
        feedback: "Excellent work! Exactly what I was looking for.",
      },
    ],
    history: [
      {
        event: EGigEvent.GIG_CREATED,
        timestamp: 1714301300,
      },
      {
        event: EGigEvent.INVITE_SENT,
        by: "0xCreator2...",
        timestamp: 1714301600,
        details: { writer: "0xWriter1..." },
      },
      {
        event: EGigEvent.INVITE_ACCEPTED,
        by: "0xWriter1...",
        timestamp: 1714370100,
      },
      {
        event: EGigEvent.DRAFT_SUBMITTED,
        by: "0xWriter1...",
        timestamp: 1714482000,
        details: { submissionId: "sub_002" },
      },
      {
        event: EGigEvent.DRAFT_APPROVED,
        by: "0xCreator2...",
        timestamp: 1714553400,
      },
      {
        event: EGigEvent.PAYMENT_RELEASED,
        by: "0xCreator2...",
        timestamp: 1714553460,
        details: { amount: "200 USDC" },
      },
    ],
  },
};
