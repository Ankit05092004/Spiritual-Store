"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { products, type Product } from "@/data/products";

type QuestionId = "goal" | "usage" | "budget" | "zodiac" | "certification";

type AnswerMap = Record<QuestionId, string | null>;

type Option = {
  label: string;
  value: string;
  description: string;
};

type Question = {
  id: QuestionId;
  title: string;
  helper: string;
  options: Option[];
};

type RecommendedProduct = {
  product: Product;
  score: number;
  reasons: string[];
};

const questions: Question[] = [
  {
    id: "goal",
    title: "What is your primary intention?",
    helper: "Choose the outcome that matters most right now.",
    options: [
      {
        label: "Wealth & prosperity",
        value: "wealth",
        description: "For money flow, abundance, and business growth.",
      },
      {
        label: "Peace & spiritual calm",
        value: "peace",
        description: "For balance, mindfulness, and inner stability.",
      },
      {
        label: "Career & communication",
        value: "career",
        description: "For focus, confidence, and better expression.",
      },
      {
        label: "Protection & obstacle removal",
        value: "protection",
        description: "For shielding, clearing blocks, and fresh starts.",
      },
      {
        label: "Meditation & spiritual growth",
        value: "meditation",
        description: "For mantra practice, discipline, and devotion.",
      },
    ],
  },
  {
    id: "usage",
    title: "How do you plan to use it?",
    helper: "This helps match the item to your daily routine.",
    options: [
      {
        label: "Daily wear",
        value: "wear",
        description: "Something you can wear close to you every day.",
      },
      {
        label: "Home or office placement",
        value: "home",
        description: "Best for a sacred corner, desk, or altar.",
      },
      {
        label: "Prayer or meditation",
        value: "ritual",
        description: "Ideal for chanting, meditation, or puja sessions.",
      },
      {
        label: "Gift or all-purpose",
        value: "gift",
        description: "A versatile choice when you want broader appeal.",
      },
    ],
  },
  {
    id: "budget",
    title: "What budget range feels right?",
    helper: "We will keep the suggestions within your comfort zone.",
    options: [
      {
        label: "Under ₹1,000",
        value: "under-1000",
        description: "Entry-level spiritual essentials.",
      },
      {
        label: "₹1,000 - ₹5,000",
        value: "1000-5000",
        description: "Accessible options with strong everyday value.",
      },
      {
        label: "₹5,000 - ₹25,000",
        value: "5000-25000",
        description: "Mid-premium pieces for focused outcomes.",
      },
      {
        label: "Above ₹25,000",
        value: "25000-plus",
        description: "High-value sacred items and premium stones.",
      },
    ],
  },
  {
    id: "zodiac",
    title: "Which zodiac energy should it support?",
    helper: "Select your sign, or use the all-signs option if you are unsure.",
    options: [
      {
        label: "Aries",
        value: "Aries",
        description: "Bold, direct, and energetic.",
      },
      {
        label: "Taurus",
        value: "Taurus",
        description: "Grounded, steady, and practical.",
      },
      {
        label: "Gemini",
        value: "Gemini",
        description: "Curious, adaptive, and expressive.",
      },
      {
        label: "Cancer",
        value: "Cancer",
        description: "Sensitive, nurturing, and intuitive.",
      },
      {
        label: "Leo",
        value: "Leo",
        description: "Confident, creative, and radiant.",
      },
      {
        label: "Virgo",
        value: "Virgo",
        description: "Precise, thoughtful, and analytical.",
      },
      {
        label: "Libra",
        value: "Libra",
        description: "Balanced, elegant, and harmonious.",
      },
      {
        label: "Scorpio",
        value: "Scorpio",
        description: "Deep, focused, and transformative.",
      },
      {
        label: "Sagittarius",
        value: "Sagittarius",
        description: "Visionary, adventurous, and open.",
      },
      {
        label: "Capricorn",
        value: "Capricorn",
        description: "Disciplined, ambitious, and patient.",
      },
      {
        label: "Aquarius",
        value: "Aquarius",
        description: "Independent, inventive, and clear-minded.",
      },
      {
        label: "Pisces",
        value: "Pisces",
        description: "Compassionate, spiritual, and dreamy.",
      },
      {
        label: "All zodiac signs / not sure",
        value: "All Zodiac Signs",
        description: "A safe choice when you want a universal recommendation.",
      },
    ],
  },
  {
    id: "certification",
    title: "How important is lab certification?",
    helper: "This adjusts the match toward certified items when needed.",
    options: [
      {
        label: "Must be lab-certified",
        value: "must",
        description: "Only recommend verified and certified items.",
      },
      {
        label: "Preferred, but not mandatory",
        value: "preferred",
        description: "Prioritize certified products when possible.",
      },
      {
        label: "Not a deciding factor",
        value: "any",
        description: "Focus on the spiritual fit first.",
      },
    ],
  },
];

const initialAnswers: AnswerMap = {
  goal: null,
  usage: null,
  budget: null,
  zodiac: null,
  certification: null,
};

function parsePrice(price: string) {
  const numeric = Number(price.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function includesAny(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function getBudgetBand(price: number) {
  if (price <= 1000) return "under-1000";
  if (price <= 5000) return "1000-5000";
  if (price <= 25000) return "5000-25000";
  return "25000-plus";
}

function scoreProduct(
  product: Product,
  answers: AnswerMap,
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

function getRecommendations(answers: AnswerMap) {
  return products
    .map((product) => scoreProduct(product, answers))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

type QuestionnaireAttemptHistory = {
  id: string;
  totalScore: number;
  completionStatus: string;
  createdAt: string;
  completedAt: string;
  recommendationResult: {
    totalScore?: number;
    recommendations?: Array<{
      productId: string;
      title: string;
      category: string;
      price: string;
      score: number;
      reasons: string[];
      isLabCertified: boolean;
    }>;
  };
  responses: Array<{
    questionSlug: string;
    questionText: string;
    selectedOptionText: string;
  }>;
};

export default function RecommendationsPage() {
  const { isSignedIn } = useAuth();
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<
    QuestionnaireAttemptHistory[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const completionPercent = Math.round(
    (answeredCount / questions.length) * 100,
  );

  const recommendations = submitted ? getRecommendations(answers) : [];
  const hasAllAnswers = answeredCount === questions.length;

  const handleSelect = (questionId: QuestionId, value: string) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleReset = () => {
    setAnswers(initialAnswers);
    setSubmitted(false);
    setSubmitStatus(null);
  };

  const loadHistory = async () => {
    if (!isSignedIn) {
      setAttemptHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await fetch("/api/questionnaire/attempts");
      if (response.ok) {
        const data = await response.json();
        setAttemptHistory(data.attempts || []);
      }
    } catch (error) {
      console.error("Failed to load questionnaire attempts", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [isSignedIn]);

  const handleSubmit = async () => {
    if (!hasAllAnswers) {
      return;
    }

    setSubmitted(true);
    setSubmitStatus(null);

    if (!isSignedIn) {
      setSubmitStatus("Sign in to save this attempt and view your history.");
      return;
    }

    try {
      const response = await fetch("/api/questionnaire/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        setSubmitStatus("Your attempt was saved successfully.");
        await loadHistory();
      } else {
        const data = await response.json().catch(() => null);
        setSubmitStatus(
          data?.error || "Unable to save your attempt right now.",
        );
      }
    } catch (error) {
      console.error("Failed to save questionnaire attempt", error);
      setSubmitStatus("Unable to save your attempt right now.");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/40 bg-linear-to-br from-primary/10 via-background to-secondary/10 pt-28 pb-16">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-12 top-12 size-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-16 bottom-0 size-56 rounded-full bg-secondary/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <Badge className="mb-5 bg-background/80 text-primary border-primary/20 px-4 py-1 backdrop-blur">
            PERSONALIZED RECOMMENDATIONS
          </Badge>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-5">
              <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Find the right spiritual product for your next step
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                Answer a short multiple-choice questionnaire and we will rank
                the products that best fit your intention, usage style, budget,
                zodiac energy, and certification preference.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/shop">
                  <Button
                    size="lg"
                    className="rounded-full px-6 shadow-lg shadow-primary/20"
                  >
                    Browse all products
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={handleReset}
                >
                  Reset questionnaire
                </Button>
              </div>
            </div>

            <Card className="border-primary/15 bg-background/80 shadow-2xl backdrop-blur">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completion
                    </p>
                    <p className="text-2xl font-bold">{completionPercent}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      Questions answered
                    </p>
                    <p className="text-2xl font-bold">
                      {answeredCount}/{questions.length}
                    </p>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Once every question is answered, the feature ranks the best
                  matches and explains why they fit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id} className="border-border/60 shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">
                    {question.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {question.helper}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(question.id, option.value)}
                        className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                          selected
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border/60 bg-background hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{option.label}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                          {selected && (
                            <span className="material-symbols-outlined text-primary">
                              check_circle
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-full px-6"
              onClick={handleSubmit}
              disabled={!hasAllAnswers}
            >
              Show my recommendations
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full px-6"
              onClick={handleReset}
            >
              Clear answers
            </Button>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="border-primary/15 bg-linear-to-br from-primary/8 via-background to-secondary/10 shadow-xl">
            <CardContent className="space-y-4 p-6">
              <div>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  Tailored match preview
                </Badge>
                <h2 className="mt-3 font-serif text-3xl font-bold">
                  {submitted
                    ? "Your top matches"
                    : "Your recommendations will appear here"}
                </h2>
              </div>

              {!submitted ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Complete the questionnaire and click the button to see a
                  ranked shortlist with reasons for each match.
                </p>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((item, index) => (
                    <div
                      key={item.product.id}
                      className="rounded-2xl border border-border/60 bg-background/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              #{index + 1} match
                            </Badge>
                            <Badge variant="outline">
                              {item.product.category}
                            </Badge>
                          </div>
                          <h3 className="mt-3 text-lg font-bold leading-tight">
                            {item.product.title}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Match score
                          </p>
                          <p className="text-2xl font-black text-primary">
                            {item.score}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.reasons.map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-foreground">
                          {item.product.price}
                        </p>
                        <Link href={`/product/${item.product.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            View product
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  We could not generate a strong match from the current answers.
                  Try adjusting your budget or zodiac preference.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="space-y-3 p-6">
              <h3 className="font-serif text-2xl font-bold">How it works</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                The feature compares your answers against the product catalog
                and ranks items by relevance, budget fit, zodiac compatibility,
                and certification preference.
              </p>
              {submitStatus && (
                <p className="text-sm font-medium text-primary">
                  {submitStatus}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">Goal fit</Badge>
                <Badge variant="secondary">Usage style</Badge>
                <Badge variant="secondary">Budget match</Badge>
                <Badge variant="secondary">Zodiac energy</Badge>
                <Badge variant="secondary">Certification</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-serif text-2xl font-bold">
                  {isSignedIn
                    ? "Your questionnaire history"
                    : "History available after sign-in"}
                </h3>
                {isSignedIn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={loadHistory}
                  >
                    Refresh
                  </Button>
                )}
              </div>

              {!isSignedIn ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Sign in to save questionnaire attempts permanently, view past
                  recommendations, and compare results across retakes.
                </p>
              ) : historyLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading history...
                </p>
              ) : attemptHistory.length > 0 ? (
                <div className="space-y-3">
                  {attemptHistory.map((attempt) => {
                    const topMatch =
                      attempt.recommendationResult.recommendations?.[0];

                    return (
                      <div
                        key={attempt.id}
                        className="rounded-2xl border border-border/60 bg-background/80 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {new Date(attempt.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {attempt.responses.length} answers stored
                            </p>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            Score {attempt.totalScore}
                          </Badge>
                        </div>

                        {topMatch && (
                          <div className="mt-3 space-y-2">
                            <p className="font-medium">Top recommendation</p>
                            <p className="text-sm text-muted-foreground">
                              {topMatch.title} • {topMatch.category}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {topMatch.price}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  No attempts saved yet. Complete the questionnaire and submit
                  it while signed in to build your history.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
