import { StateCreator } from "zustand";
import { ERoles } from "@/stores/constants";

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
  SOCIAL_POST = "Social Post",
  SOCIAL_THREAD = "Social Thread",
  LINKEDIN_POST = "LinkedIn Post",
  SHORT_CAPTION = "Short Caption",
  BLOG_POST = "Blog Post",
  NEWSLETTER = "Newsletter",
  SLOGAN_TAGLINE = "Slogan / Tagline",
  PRODUCT_DESCRIPTION = "Product Description",
  SOCIAL_REPLY_SET = "Social Reply Set",
  WEBSITE_HEADLINE = "Website Headline",
  CALL_TO_ACTION = "Call-To-Action (CTA)",
  COLD_DM_OUTREACH = "Cold DM / Outreach",
  ABOUT_ME_BIO = "About Me Bio",
  SCRIPT_DIALOGUE = "Script or Dialogue",
  AD_COPY = "Ad Copy",
  LISTICLE_POST = "Listicle Post",
  TUTORIAL_HOW_TO = "Tutorial or How-To",
  THREAD_HOOK = "Thread Hook",
  POETIC_STYLIZED = "Poetic or Stylized Piece",
}

export interface OnboardingSlice {
  step: number;
  setStep: (step: number) => void;
  role: ERoles;
  setRole: (role: ERoles) => void;
  selectedToneKeywords: EToneKeywords[];
  setSelectedToneKeywords: (keywords: EToneKeywords[]) => void;
  selectedNicheKeywords: ENicheKeywords[];
  setSelectedNicheKeywords: (keywords: ENicheKeywords[]) => void;
  selectedContentTypeKeywords: EContentTypes[];
  setSelectedContentTypeKeywords: (keywords: EContentTypes[]) => void;
}

export const createOnboardingSlice: StateCreator<
  OnboardingSlice,
  [],
  [],
  OnboardingSlice
> = (set) => ({
  step: 1,
  setStep: (step: number) => {
    set(() => ({ step }));
  },
  role: ERoles.GHOSTWRITER,
  setRole: (role: ERoles) => {
    set(() => ({ role }));
  },
  selectedToneKeywords: [],
  setSelectedToneKeywords: (keywords: EToneKeywords[]) => {
    set(() => ({ selectedToneKeywords: keywords }));
  },
  selectedNicheKeywords: [],
  setSelectedNicheKeywords: (keywords: ENicheKeywords[]) => {
    set(() => ({ selectedNicheKeywords: keywords }));
  },
  selectedContentTypeKeywords: [],
  setSelectedContentTypeKeywords: (keywords: EContentTypes[]) => {
    set(() => ({ selectedContentTypeKeywords: keywords }));
  },
});
