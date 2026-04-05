CREATE TABLE "astrology_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"order_id" uuid,
	"report_type" text NOT NULL,
	"birth_data" jsonb NOT NULL,
	"report_data" jsonb NOT NULL,
	"cache_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "astrology_reports_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"image_url" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "astrology_reports" ADD CONSTRAINT "astrology_reports_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_astrology_reports_user" ON "astrology_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_astrology_reports_cache_key" ON "astrology_reports" USING btree ("cache_key");