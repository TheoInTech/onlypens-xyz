import { openai } from "@/lib/openai";
import {
  EMatchmakerSource,
  IMatchmaker,
  MatchmakerMatchResponseSchema,
} from "@/schema/matchmaker.schema";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5-minute timeout for the API route (Vercel)

export async function POST(request: NextRequest) {
  try {
    // Check if the API is temporarily disabled
    const isApiDisabled = process.env.DISABLE_GENERATION_API === "true";
    if (isApiDisabled) {
      return NextResponse.json(
        {
          error: "Service temporarily unavailable",
          message:
            "Our generation service is currently undergoing maintenance. Please try again later.",
        },
        { status: 503 }
      );
    }

    // Verify authentication
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    const body: IMatchmaker = await request.json();

    // Create system prompt with instructions for the AI
    const systemPrompt = `You are an AI metadata generator. Your job is to analyze a user's bio, sample writings, niche and tone preferences, and generate structured metadata insights that help us match ghostwriters with gig packages.
    You must respond with a strict JSON object, using only predefined enums from our system.
    Generate a structured JSON object that summarizes the content and returns it in the following schema:
    {
        "topTone": EToneKeywords[],               // Top 3 consistent tones detected
        "topNiches": ENicheKeywords[],            // Top 5 most relevant niches
        "complexityLevel": "basic" | "intermediate" | "advanced",
        "preferredContentTypes": EContentTypes[], // Up to 5 ideal content formats
        "writingPersona": string,                 // 1-liner human-readable persona
        "strengths": string[],                    // Up to 3 strengths (e.g. "Clear hooks", "Audience-focused")
        "weaknesses": string[],                   // Up to 2 weaknesses (e.g. "Lacks flow", "Weak CTA")
        "idealMatchDescription": string           // 1-line match summary (e.g. "Great for bold, founder-led brand threads")
        "tags": string[]                         // Up to 3 tags (e.g. "Founder Voice", "Media-Trained", "Crypto-Degen")
    }

    Here are the enums you can use:
    Tone Keywords: Witty, Bold, Friendly, Professional, Sarcastic, Inspirational, Analytical, Narrative, Minimalist, Educational, Cynical, Sincere, Relatable, Aesthetic, Aggressive, Playful, Formal, Edgy, Meme-heavy, Shill-core, Thought Leader, Founder Voice, Media-Trained, Crypto-Degen, VC-Core, Operator Brain, Thread-Banger, Cold-Truth, Zen Master, Authoritative, Casual
    Niche Keywords: Solopreneurs, Indie Hackers, Crypto Twitter, VC & Startup X, Degens, Artists, Mental Health, Personal Finance, Lifestyle, Productivity, Relationships, Parenting, Tech News, AI Builders, Founders, Side Hustlers, Fitness, Fashion, Education, Web3 Influencers, Web3 / Crypto, DeFi, NFTs, AI & Machine Learning, SaaS, eCommerce, HealthTech, EdTech, FinTech, Gaming, Media & Entertainment, Marketing, Real Estate, Consumer Tech, Climate & Sustainability, Consulting, Freelancing, DAO, HR, Legal & Compliance, Design & UX
    Content Types: Social Post, Thread / Longform, Short Caption, Blog / Newsletter, Product Copy, Website Copy, Script / Dialogue, Bio / About Me, Whitepaper, Book

    Output Rules:
    - Return only valid enums for tone, niche, and content types. Do not create your own terms.
    - writingPersona, strengths, and idealMatchDescription must be brief and helpful for human understanding.
    - All fields are required unless weaknesses is legitimately empty (but prefer to include them).
    - Output must be a single valid JSON object, no markdown, no explanation.
    `;

    // Create the user prompt with the form data
    let userPrompt = "";

    if (body.source === EMatchmakerSource.ONBOARDING) {
      const rawUserPrompt = `Analyze based on the following fields:
        - Bio: {{about}}
        - Niche Keywords: {{nicheKeywords[]}} — from list like ["crypto", "health", "startups"]
        - Content Types: {{contentTypeKeywords[]}} — from list like ["threads", "newsletters", "web copy"]
        - Rate per word: {{ratePerWord}} per word — in USD
        - Sample Writings:
        1. {{samples[0]}}
        2. {{samples[1]}}
        3. {{samples[2]}}

        DO NOT just mirror inputs. Infer missing tone/style/persona from samples and bio.
        If toneKeywords are missing, infer them from the writing samples. Use judgment.
      `;

      userPrompt = rawUserPrompt
        .replace("{{about}}", body.bio)
        .replace("{{nicheKeywords[]}}", body.nicheKeywords.join(", "))
        .replace(
          "{{contentTypeKeywords[]}}",
          body.contentTypeKeywords.join(", ")
        )
        .replace("{{ratePerWord}}", `$${body.budget}`)
        .replace("{{samples[0]}}", body.samples[0])
        .replace("{{samples[1]}}", body.samples[1])
        .replace("{{samples[2]}}", body.samples[2]);
    } else if (body.source === EMatchmakerSource.GIG_CREATION) {
      const rawUserPrompt = `Analyze based on:
        - Creator Description of Project: {{about}}
        - Gig Niche: {{nicheKeywords[]}}
        - Content Types Expected: {{contentTypeKeywords[]}}
        - Overall Budget: {{totalAmount}}
        - Sample Writings:
        1. {{samples[0]}}
        2. {{samples[1]}}
        3. {{samples[2]}}

        Do NOT include estimatedWordRate — just set it to 'null'.
        The goal is to profile what type of ghostwriter would best fit this gig.
      `;

      userPrompt = rawUserPrompt
        .replace("{{about}}", body.bio)
        .replace("{{nicheKeywords[]}}", body.nicheKeywords.join(", "))
        .replace(
          "{{contentTypeKeywords[]}}",
          body.contentTypeKeywords.join(", ")
        )
        .replace("{{totalAmount}}", `$${body.budget}`)
        .replace("{{samples[0]}}", body.samples[0])
        .replace("{{samples[1]}}", body.samples[1])
        .replace("{{samples[2]}}", body.samples[2]);
    }

    // Call OpenAI API without streaming to get the complete response first
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Get the complete response from OpenAI
    const completeJsonResponse = completion.choices[0].message.content || "{}";

    try {
      // Parse the complete JSON response
      const matchmakerJson = JSON.parse(completeJsonResponse);

      // Validate the response against the schema
      const validatedResponse =
        MatchmakerMatchResponseSchema.safeParse(matchmakerJson);

      if (!validatedResponse.success) {
        return NextResponse.json(
          {
            error: "Invalid matchmaker response",
            details: validatedResponse.error,
          },
          { status: 400 }
        );
      }

      // Return the validated response to the user
      return NextResponse.json(validatedResponse);
    } catch (jsonError) {
      console.error("Error parsing or saving JSON:", jsonError);
      return NextResponse.json(
        { error: "Failed to process matchmaker data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Matchmaker generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate matchmaker" },
      { status: 500 }
    );
  }
}
