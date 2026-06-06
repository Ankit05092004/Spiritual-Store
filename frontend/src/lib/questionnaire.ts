import type { Product } from "@/data/products";

export type QuestionnaireQuestionId =
  | "goal"
  | "usage"
  | "budget"
  | "zodiac"
  | "certification";

export type QuestionnaireAnswerMap = Record<
  QuestionnaireQuestionId,
  string | null
>;

export type QuestionnaireOption = {
  key: string;
  label: string;
  description: string;
  scoreWeight: number;
  recommendationMapping: Record<string, unknown>;
};

export type QuestionnaireQuestion = {
  slug: QuestionnaireQuestionId;
  questionText: string;
  category: string;
  sortOrder: number;
  options: QuestionnaireOption[];
};

export type RecommendedProduct = {
  product: Product;
  score: number;
  reasons: string[];
};

export type QuestionnaireRecommendationResult = {
  totalScore: number;
  recommendations: Array<{
    productId: string;
    title: string;
    category: string;
    price: string;
    score: number;
    reasons: string[];
    isLabCertified: boolean;
  }>;
};

export const questionnaireQuestions: QuestionnaireQuestion[] = [
  {
    slug: "goal",
    questionText: "What is your primary intention?",
    category: "intent",
    sortOrder: 1,
    options: [
      {
        key: "wealth",
        label: "Wealth & prosperity",
        description: "For money flow, abundance, and business growth.",
        scoreWeight: 35,
        recommendationMapping: {
          goal: "wealth",
          keywords: ["wealth", "prosperity", "abundance", "financial"],
          categories: ["Yantras", "Gemstones"],
        },
      },
      {
        key: "peace",
        label: "Peace & spiritual calm",
        description: "For balance, mindfulness, and inner stability.",
        scoreWeight: 35,
        recommendationMapping: {
          goal: "peace",
          keywords: ["calm", "peace", "meditation", "spiritual", "balance"],
          categories: ["Rudraksha", "Malas", "Crystals"],
        },
      },
      {
        key: "career",
        label: "Career & communication",
        description: "For focus, confidence, and better expression.",
        scoreWeight: 35,
        recommendationMapping: {
          goal: "career",
          keywords: [
            "career",
            "communication",
            "focus",
            "intellect",
            "success",
            "discipline",
          ],
          categories: ["Gemstones", "Yantras"],
        },
      },
      {
        key: "protection",
        label: "Protection & obstacle removal",
        description: "For shielding, clearing blocks, and fresh starts.",
        scoreWeight: 35,
        recommendationMapping: {
          goal: "protection",
          keywords: [
            "protection",
            "obstacles",
            "negative energy",
            "shield",
            "remove",
          ],
          categories: ["Yantras", "Idols", "Crystals"],
        },
      },
      {
        key: "meditation",
        label: "Meditation & spiritual growth",
        description: "For mantra practice, discipline, and devotion.",
        scoreWeight: 35,
        recommendationMapping: {
          goal: "meditation",
          keywords: ["meditation", "mantra", "spiritual", "devotion", "calm"],
          categories: ["Rudraksha", "Malas", "Yantras"],
        },
      },
    ],
  },
  {
    slug: "usage",
    questionText: "How do you plan to use it?",
    category: "usage",
    sortOrder: 2,
    options: [
      {
        key: "wear",
        label: "Daily wear",
        description: "Something you can wear close to you every day.",
        scoreWeight: 20,
        recommendationMapping: {
          usage: "wear",
          categories: ["Gemstones", "Rudraksha", "Malas"],
        },
      },
      {
        key: "home",
        label: "Home or office placement",
        description: "Best for a sacred corner, desk, or altar.",
        scoreWeight: 20,
        recommendationMapping: {
          usage: "home",
          categories: ["Yantras", "Idols", "Crystals"],
        },
      },
      {
        key: "ritual",
        label: "Prayer or meditation",
        description: "Ideal for chanting, meditation, or puja sessions.",
        scoreWeight: 20,
        recommendationMapping: {
          usage: "ritual",
          categories: ["Rudraksha", "Malas", "Yantras"],
        },
      },
      {
        key: "gift",
        label: "Gift or all-purpose",
        description: "A versatile choice when you want broader appeal.",
        scoreWeight: 10,
        recommendationMapping: {
          usage: "gift",
          categories: ["All"],
        },
      },
    ],
  },
  {
    slug: "budget",
    questionText: "What budget range feels right?",
    category: "budget",
    sortOrder: 3,
    options: [
      {
        key: "under-1000",
        label: "Under ₹1,000",
        description: "Entry-level spiritual essentials.",
        scoreWeight: 25,
        recommendationMapping: { budgetBand: "under-1000" },
      },
      {
        key: "1000-5000",
        label: "₹1,000 - ₹5,000",
        description: "Accessible options with strong everyday value.",
        scoreWeight: 25,
        recommendationMapping: { budgetBand: "1000-5000" },
      },
      {
        key: "5000-25000",
        label: "₹5,000 - ₹25,000",
        description: "Mid-premium pieces for focused outcomes.",
        scoreWeight: 25,
        recommendationMapping: { budgetBand: "5000-25000" },
      },
      {
        key: "25000-plus",
        label: "Above ₹25,000",
        description: "High-value sacred items and premium stones.",
        scoreWeight: 25,
        recommendationMapping: { budgetBand: "25000-plus" },
      },
    ],
  },
  {
    slug: "zodiac",
    questionText: "Which zodiac energy should it support?",
    category: "astrology",
    sortOrder: 4,
    options: [
      {
        key: "Aries",
        label: "Aries",
        description: "Bold, direct, and energetic.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Aries"] },
      },
      {
        key: "Taurus",
        label: "Taurus",
        description: "Grounded, steady, and practical.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Taurus"] },
      },
      {
        key: "Gemini",
        label: "Gemini",
        description: "Curious, adaptive, and expressive.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Gemini"] },
      },
      {
        key: "Cancer",
        label: "Cancer",
        description: "Sensitive, nurturing, and intuitive.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Cancer"] },
      },
      {
        key: "Leo",
        label: "Leo",
        description: "Confident, creative, and radiant.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Leo"] },
      },
      {
        key: "Virgo",
        label: "Virgo",
        description: "Precise, thoughtful, and analytical.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Virgo"] },
      },
      {
        key: "Libra",
        label: "Libra",
        description: "Balanced, elegant, and harmonious.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Libra"] },
      },
      {
        key: "Scorpio",
        label: "Scorpio",
        description: "Deep, focused, and transformative.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Scorpio"] },
      },
      {
        key: "Sagittarius",
        label: "Sagittarius",
        description: "Visionary, adventurous, and open.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Sagittarius"] },
      },
      {
        key: "Capricorn",
        label: "Capricorn",
        description: "Disciplined, ambitious, and patient.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Capricorn"] },
      },
      {
        key: "Aquarius",
        label: "Aquarius",
        description: "Independent, inventive, and clear-minded.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Aquarius"] },
      },
      {
        key: "Pisces",
        label: "Pisces",
        description: "Compassionate, spiritual, and dreamy.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["Pisces"] },
      },
      {
        key: "All Zodiac Signs",
        label: "All zodiac signs / not sure",
        description: "A safe choice when you want a universal recommendation.",
        scoreWeight: 15,
        recommendationMapping: { zodiac: ["All Zodiac Signs"] },
      },
    ],
  },
  {
    slug: "certification",
    questionText: "How important is lab certification?",
    category: "quality",
    sortOrder: 5,
    options: [
      {
        key: "must",
        label: "Must be lab-certified",
        description: "Only recommend verified and certified items.",
        scoreWeight: 5,
        recommendationMapping: { certification: "must" },
      },
      {
        key: "preferred",
        label: "Preferred, but not mandatory",
        description: "Prioritize certified products when possible.",
        scoreWeight: 5,
        recommendationMapping: { certification: "preferred" },
      },
      {
        key: "any",
        label: "Not a deciding factor",
        description: "Focus on the spiritual fit first.",
        scoreWeight: 0,
        recommendationMapping: { certification: "any" },
      },
    ],
  },
];

export const initialQuestionnaireAnswers: QuestionnaireAnswerMap = {
  goal: null,
  usage: null,
  budget: null,
  zodiac: null,
  certification: null,
};

export function parsePrice(price: string) {
  const numeric = Number(price.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function getBudgetBand(price: number) {
  if (price <= 1000) return "under-1000";
  if (price <= 5000) return "1000-5000";
  if (price <= 25000) return "5000-25000";
  return "25000-plus";
}

function includesAny(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

export function scoreProduct(
  product: Product,
  answers: QuestionnaireAnswerMap,
): RecommendedProduct {
  const reasons: string[] = [];
  let score = 0;

  const searchableText = [
    product.title,
    product.category,
    product.description,
    product.benefits.join(" "),
    product.zodiacCompatibility.join(" "),
  ].join(" ");

  switch (answers.goal) {
    case "wealth":
      if (
        includesAny(searchableText, [
          "wealth",
          "prosperity",
          "abundance",
          "financial",
          "money",
        ]) ||
        ["Yantras", "Gemstones"].includes(product.category)
      ) {
        score += 35;
        reasons.push("Matches your prosperity goal");
      }
      break;
    case "peace":
      if (
        includesAny(searchableText, [
          "calm",
          "peace",
          "meditation",
          "spiritual",
          "balance",
        ]) ||
        ["Rudraksha", "Malas", "Crystals"].includes(product.category)
      ) {
        score += 35;
        reasons.push("Supports peace and spiritual calm");
      }
      break;
    case "career":
      if (
        includesAny(searchableText, [
          "career",
          "communication",
          "focus",
          "intellect",
          "success",
          "discipline",
        ]) ||
        ["Gemstones", "Yantras"].includes(product.category)
      ) {
        score += 35;
        reasons.push("Aligned with career and focus needs");
      }
      break;
    case "protection":
      if (
        includesAny(searchableText, [
          "protection",
          "obstacles",
          "negative energy",
          "shield",
          "remove",
        ]) ||
        ["Yantras", "Idols", "Crystals"].includes(product.category)
      ) {
        score += 35;
        reasons.push("Helpful for protection and clearing blocks");
      }
      break;
    case "meditation":
      if (
        includesAny(searchableText, [
          "meditation",
          "mantra",
          "spiritual",
          "devotion",
          "calm",
        ]) ||
        ["Rudraksha", "Malas", "Yantras"].includes(product.category)
      ) {
        score += 35;
        reasons.push("Well suited for mantra and meditation practice");
      }
      break;
    default:
      break;
  }

  switch (answers.usage) {
    case "wear":
      if (
        ["Gemstones", "Rudraksha", "Malas"].includes(product.category) ||
        Boolean(product.howToWear.finger)
      ) {
        score += 20;
        reasons.push("Fits your preference for daily wear");
      }
      break;
    case "home":
      if (["Yantras", "Idols", "Crystals"].includes(product.category)) {
        score += 20;
        reasons.push("Ideal for home or office placement");
      }
      break;
    case "ritual":
      if (["Rudraksha", "Malas", "Yantras"].includes(product.category)) {
        score += 20;
        reasons.push("Strong match for prayer or meditation rituals");
      }
      break;
    case "gift":
      score += 10;
      reasons.push("Works as a versatile gift choice");
      break;
    default:
      break;
  }

  const productPrice = parsePrice(product.price);
  const budgetBand = getBudgetBand(productPrice);

  if (answers.budget === budgetBand) {
    score += 25;
    reasons.push("Fits your selected budget range");
  } else if (
    answers.budget === "1000-5000" &&
    (budgetBand === "under-1000" || budgetBand === "5000-25000")
  ) {
    score += 10;
    reasons.push("Close to your budget range");
  } else if (answers.budget === "5000-25000" && budgetBand === "25000-plus") {
    score += 6;
    reasons.push("Sits just above your target budget");
  }

  if (
    answers.zodiac &&
    (answers.zodiac === "All Zodiac Signs" ||
      product.zodiacCompatibility.includes(answers.zodiac))
  ) {
    score += 15;
    reasons.push(`Matches ${answers.zodiac} energy`);
  }

  if (answers.certification === "must") {
    if (product.isLabCertified) {
      score += 5;
      reasons.push("Lab-certified, as requested");
    }
  } else if (answers.certification === "preferred") {
    if (product.isLabCertified) {
      score += 5;
      reasons.push("Certified item that fits your preference");
    }
  }

  if (product.isLabCertified && answers.certification !== "must") {
    score += 2;
  }

  return {
    product,
    score: Math.min(score, 100),
    reasons: reasons.slice(0, 3),
  };
}

export function getQuestionnaireRecommendations(
  answers: QuestionnaireAnswerMap,
  products: Product[],
) {
  return products
    .map((product) => scoreProduct(product, answers))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

export function summarizeQuestionnaireResult(
  answers: QuestionnaireAnswerMap,
  products: Product[],
): QuestionnaireRecommendationResult {
  const recommendations = getQuestionnaireRecommendations(answers, products);

  return {
    totalScore: recommendations.reduce((sum, item) => sum + item.score, 0),
    recommendations: recommendations.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      category: item.product.category,
      price: item.product.price,
      score: item.score,
      reasons: item.reasons,
      isLabCertified: item.product.isLabCertified,
    })),
  };
}
