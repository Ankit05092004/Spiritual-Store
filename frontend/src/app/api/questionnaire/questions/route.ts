import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  questionnaireQuestions as questionnaireQuestionsTable,
  questionnaireQuestionOptions as questionnaireQuestionOptionsTable,
} from "@/db/schema";
import { questionnaireQuestions as defaultQuestionnaireQuestions } from "@/lib/questionnaire";
import { asc, eq } from "drizzle-orm";

type QuestionnaireQuestionResponse = {
  id: string;
  slug: string;
  questionText: string;
  category: string;
  status: string;
  sortOrder: number;
  options: Array<{
    id: string;
    optionKey: string;
    optionText: string;
    optionDescription: string | null;
    scoreWeight: number;
    recommendationMapping: Record<string, unknown> | null;
    isActive: boolean;
    sortOrder: number;
  }>;
};

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

export async function GET() {
  try {
    await seedQuestionsIfMissing();

    const questions = await db.query.questionnaireQuestions.findMany({
      orderBy: asc(questionnaireQuestionsTable.sortOrder),
      with: {
        options: {
          orderBy: asc(questionnaireQuestionOptionsTable.sortOrder),
        },
      },
    });

    const response: QuestionnaireQuestionResponse[] = questions.map(
      (question) => ({
        id: question.id,
        slug: question.slug,
        questionText: question.questionText,
        category: question.category,
        status: question.status,
        sortOrder: question.sortOrder,
        options: question.options.map((option) => ({
          id: option.id,
          optionKey: option.optionKey,
          optionText: option.optionText,
          optionDescription: option.optionDescription,
          scoreWeight: option.scoreWeight,
          recommendationMapping: option.recommendationMapping,
          isActive: option.isActive,
          sortOrder: option.sortOrder,
        })),
      }),
    );

    return NextResponse.json({ success: true, questions: response });
  } catch (error) {
    console.error("Questionnaire questions GET error:", error);
    return NextResponse.json(
      { error: "Failed to load questionnaire questions" },
      { status: 500 },
    );
  }
}
