import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, products } from "@/db";
import {
  questionnaireAttempts as questionnaireAttemptsTable,
  questionnaireQuestionOptions as questionnaireQuestionOptionsTable,
  questionnaireQuestions as questionnaireQuestionsTable,
  questionnaireResponses as questionnaireResponsesTable,
} from "@/db/schema";
import {
  initialQuestionnaireAnswers,
  questionnaireQuestions as defaultQuestionnaireQuestions,
  summarizeQuestionnaireResult,
  type QuestionnaireAnswerMap,
} from "@/lib/questionnaire";

const questionnaireAnswerSchema = z.record(z.string(), z.string());

async function seedQuestionsIfMissing() {
  const existingQuestions = await db.query.questionnaireQuestions.findMany({
    columns: { id: true },
    limit: 1,
  });

  if (existingQuestions.length > 0) {
    return;
  }

  for (const question of defaultQuestionnaireQuestions) {
    const [insertedQuestion] = await db
      .insert(questionnaireQuestionsTable)
      .values({
        slug: question.slug,
        questionText: question.questionText,
        category: question.category,
        sortOrder: question.sortOrder,
        status: "active",
      })
      .returning({ id: questionnaireQuestionsTable.id });

    if (!insertedQuestion) {
      continue;
    }

    const optionValues = question.options.map((option, index) => ({
      questionId: insertedQuestion.id,
      optionKey: option.key,
      optionText: option.label,
      optionDescription: option.description,
      scoreWeight: option.scoreWeight,
      recommendationMapping: option.recommendationMapping,
      sortOrder: index,
      isActive: true,
    }));

    if (optionValues.length > 0) {
      await db.insert(questionnaireQuestionOptionsTable).values(optionValues);
    }
  }
}

function normalizeAnswers(
  input: Record<string, string>,
): QuestionnaireAnswerMap {
  return {
    ...initialQuestionnaireAnswers,
    ...input,
  } as QuestionnaireAnswerMap;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempts = await db.query.questionnaireAttempts.findMany({
      where: eq(questionnaireAttemptsTable.userId, userId),
      orderBy: desc(questionnaireAttemptsTable.createdAt),
      with: {
        responses: {
          with: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        totalScore: attempt.totalScore,
        completionStatus: attempt.completionStatus,
        createdAt: attempt.createdAt,
        completedAt: attempt.completedAt,
        recommendationResult: attempt.recommendationResult,
        responses: attempt.responses.map((response) => ({
          id: response.id,
          questionId: response.questionId,
          questionSlug: response.question.slug,
          questionText: response.question.questionText,
          selectedOptionId: response.selectedOptionId,
          selectedOptionKey: response.selectedOption.optionKey,
          selectedOptionText: response.selectedOption.optionText,
          responseTimestamp: response.responseTimestamp,
        })),
      })),
    });
  } catch (error) {
    console.error("Questionnaire attempts GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch questionnaire history" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    await seedQuestionsIfMissing();

    const body = await request.json();
    const validation = questionnaireAnswerSchema.safeParse(body?.answers ?? {});

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid questionnaire answers",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const answers = normalizeAnswers(validation.data);

    const questions = await db.query.questionnaireQuestions.findMany({
      with: {
        options: true,
      },
      orderBy: asc(questionnaireQuestionsTable.sortOrder),
    });

    const questionBySlug = new Map(
      questions.map((question) => [question.slug, question]),
    );
    const selectedOptionIds: Array<{
      questionId: string;
      selectedOptionId: string;
    }> = [];

    for (const [questionSlug, selectedOptionKey] of Object.entries(answers)) {
      if (!selectedOptionKey) {
        return NextResponse.json(
          { error: `Missing answer for ${questionSlug}` },
          { status: 400 },
        );
      }

      const question = questionBySlug.get(
        questionSlug as keyof QuestionnaireAnswerMap,
      );
      if (!question) {
        return NextResponse.json(
          { error: `Unknown questionnaire question: ${questionSlug}` },
          { status: 400 },
        );
      }

      const selectedOption = question.options.find(
        (option) => option.optionKey === selectedOptionKey,
      );
      if (!selectedOption) {
        return NextResponse.json(
          { error: `Invalid option for ${questionSlug}` },
          { status: 400 },
        );
      }

      selectedOptionIds.push({
        questionId: question.id,
        selectedOptionId: selectedOption.id,
      });
    }

    const recommendations = summarizeQuestionnaireResult(answers, products);

    const [attempt] = await db
      .insert(questionnaireAttemptsTable)
      .values({
        userId,
        totalScore: recommendations.totalScore,
        recommendationResult: recommendations,
        completionStatus: "complete",
      })
      .returning({ id: questionnaireAttemptsTable.id });

    if (!attempt) {
      return NextResponse.json(
        { error: "Failed to create questionnaire attempt" },
        { status: 500 },
      );
    }

    await db.insert(questionnaireResponsesTable).values(
      selectedOptionIds.map((selection) => ({
        attemptId: attempt.id,
        questionId: selection.questionId,
        selectedOptionId: selection.selectedOptionId,
      })),
    );

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      result: recommendations,
    });
  } catch (error) {
    console.error("Questionnaire attempts POST error:", error);
    return NextResponse.json(
      { error: "Failed to save questionnaire attempt" },
      { status: 500 },
    );
  }
}
