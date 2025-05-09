export enum EToneKeywords {
  WITTY = "Witty",
  BOLD = "Bold",
  FRIENDLY = "Friendly",
  PROFESSIONAL = "Professional",
  SARCASTIC = "Sarcastic",
  INSPIRATIONAL = "Inspirational",
  ANALYTICAL = "Analytical",
  NARRATIVE = "Narrative",
  MINIMALIST = "Minimalist",
  EDUCATIONAL = "Educational",
  CYNICAL = "Cynical",
  SINCERE = "Sincere",
  RELATABLE = "Relatable",
  AESTHETIC = "Aesthetic",
  AGGRESSIVE = "Aggressive",
  PLAYFUL = "Playful",
  FORMAL = "Formal",
  EDGY = "Edgy",
  MEME_HEAVY = "Meme-heavy",
  SHILL_CORE = "Shill-core",
  THOUGHT_LEADER = "Thought Leader",
  FOUNDER_VOICE = "Founder Voice",
  MEDIA_TRAINED = "Media-Trained",
  CRYPTO_DEGEN = "Crypto-Degen",
  VC_CORE = "VC-Core",
  OPERATOR_BRAIN = "Operator Brain",
  THREAD_BANGER = "Thread-Banger",
  COLD_TRUTH = "Cold-Truth",
  ZEN_MASTER = "Zen Master",
  AUTHORITATIVE = "Authoritative",
  CASUAL = "Casual",
}

export enum ENicheKeywords {
  // Audience Niches
  SOLOPRENEURS = "Solopreneurs",
  INDIE_HACKERS = "Indie Hackers",
  CRYPTO_TWITTER = "Crypto Twitter",
  VC_STARTUP = "VC & Startup X",
  DEGENS = "Degens ",
  ARTISTS = "Artists",
  MENTAL_HEALTH = "Mental Health",
  PERSONAL_FINANCE = "Personal Finance",
  LIFESTYLE = "Lifestyle",
  PRODUCTIVITY = "Productivity",
  RELATIONSHIPS = "Relationships",
  PARENTING = "Parenting",
  TECH_NEWS = "Tech News",
  AI_BUILDERS = "AI Builders",
  FOUNDERS = "Founders",
  SIDE_HUSTLERS = "Side Hustlers",
  FITNESS = "Fitness",
  FASHION = "Fashion",
  EDUCATION = "Education",
  WEB3_INFLUENCERS = "Web3 Influencers",

  // Industry Niches
  WEB3_CRYPTO = "Web3 / Crypto",
  DEFI = "DeFi",
  NFT = "NFTs",
  AI_ML = "AI & Machine Learning",
  SAAS = "SaaS",
  ECOMMERCE = "eCommerce",
  HEALTHTECH = "HealthTech",
  EDTECH = "EdTech",
  FINTECH = "FinTech",
  GAMING = "Gaming",
  MEDIA = "Media & Entertainment",
  MARKETING = "Marketing",
  REAL_ESTATE = "Real Estate",
  CONSUMER_TECH = "Consumer Tech",
  CLIMATE = "Climate & Sustainability",
  CONSULTING = "Consulting",
  FREELANCING = "Freelancing",
  DAO = "DAO",
  HR = "HR",
  LEGAL = "Legal & Compliance",
  DESIGN = "Design & UX",
}

export enum EContentTypes {
  SOCIAL_POST = "Social Post", // Single tweet, LinkedIn, etc. /
  SOCIAL_THREAD = "Thread / Longform Post", // Tweet thread or multi-part post /
  SHORT_CAPTION = "Short Caption", // IG, TikTok, or quick hooks /
  BLOG_NEWSLETTER = "Blog / Newsletter", // Long-form + email content /
  PRODUCT_MARKETING = "Product Copy", // Ad copy, CTAs, product desc /
  WEBSITE_LANDING = "Website / Landing Copy", // Headlines, hero copy /
  SCRIPT_DIALOGUE = "Script / Dialogue", // Podcast, video, reels /
  PERSONAL_BIO = "Bio / About Me", // Creator intros, brand bios
}

// Activity types - aligned with contract events for subgraph integration
export enum EActivityType {
  GIG_CREATED = "GIG_CREATED",
  INVITE_SENT = "INVITE_SENT",
  INVITE_ACCEPTED = "INVITE_ACCEPTED",
  INVITE_DECLINED = "INVITE_DECLINED",
  DRAFT_SUBMITTED = "DRAFT_SUBMITTED",
  DRAFT_REVISED = "DRAFT_REVISED",
  DRAFT_APPROVED = "DRAFT_APPROVED",
  DRAFT_REJECTED = "DRAFT_REJECTED",
  PAYMENT_RELEASED = "PAYMENT_RELEASED",
  GIG_COMPLETED = "GIG_COMPLETED",
  GIG_CANCELLED = "GIG_CANCELLED",
  GIG_EXPIRED = "GIG_EXPIRED",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED", // For UI display (not a contract event)
}

// Submission status types
export enum ESubmissionStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  REVISION_REQUESTED = "REVISION_REQUESTED",
}

// Event types for history tracking
export enum EGigEvent {
  GIG_CREATED = "GIG_CREATED",
  INVITE_SENT = "INVITE_SENT",
  INVITE_ACCEPTED = "INVITE_ACCEPTED",
  INVITE_DECLINED = "INVITE_DECLINED",
  DRAFT_SUBMITTED = "DRAFT_SUBMITTED",
  DRAFT_REVISED = "DRAFT_REVISED",
  DRAFT_APPROVED = "DRAFT_APPROVED",
  DRAFT_REJECTED = "DRAFT_REJECTED",
  PAYMENT_RELEASED = "PAYMENT_RELEASED",
  GIG_CANCELLED = "GIG_CANCELLED",
}
