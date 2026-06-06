CREATE TABLE IF NOT EXISTS "questionnaire_questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "question_text" text NOT NULL,
  "category" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
-->statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "questionnaire_questions_slug_unique" ON "questionnaire_questions" USING btree ("slug");
-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questionnaire_questions_status" ON "questionnaire_questions" USING btree ("status");
-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questionnaire_questions_category" ON "questionnaire_questions" USING btree ("category");
-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questionnaire_questions_sort_order" ON "questionnaire_questions" USING btree ("sort_order");
-->statement-breakpoint

CREATE TABLE IF NOT EXISTS "questionnaire_question_options" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "question_id" uuid NOT NULL REFERENCES "questionnaire_questions"("id") ON DELETE cascade,
  "option_key" text NOT NULL,
  "option_text" text NOT NULL,
  "option_description" text,
  "score_weight" integer DEFAULT 0 NOT NULL,
  "recommendation_mapping" jsonb DEFAULT '{}'::jsonb,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
-->statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "questionnaire_question_options_unique_key" ON "questionnaire_question_options" USING btree ("question_id","option_key");
-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questionnaire_options_question" ON "questionnaire_question_options" USING btree ("question_id");
-->statement-breakpoint

CREATE TABLE IF NOT EXISTS "questionnaire_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "total_score" integer DEFAULT 0 NOT NULL,
  "recommendation_result" jsonb DEFAULT '{}'::jsonb,
  "completion_status" text DEFAULT 'complete' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questionnaire_attempts_user" ON "questionnaire_attempts" USING btree ("user_id");
-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questionnaire_attempts_created" ON "questionnaire_attempts" USING btree ("created_at");
-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questionnaire_attempts_status" ON "questionnaire_attempts" USING btree ("completion_status");
-->statement-breakpoint

CREATE TABLE IF NOT EXISTS "questionnaire_responses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "attempt_id" uuid NOT NULL REFERENCES "questionnaire_attempts"("id") ON DELETE cascade,
  "question_id" uuid NOT NULL REFERENCES "questionnaire_questions"("id") ON DELETE cascade,
  "selected_option_id" uuid NOT NULL REFERENCES "questionnaire_question_options"("id") ON DELETE cascade,
  "response_timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
-->statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "questionnaire_responses_unique_attempt_question" ON "questionnaire_responses" USING btree ("attempt_id","question_id");
-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questionnaire_responses_attempt" ON "questionnaire_responses" USING btree ("attempt_id");
-->statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questionnaire_responses_question" ON "questionnaire_responses" USING btree ("question_id");