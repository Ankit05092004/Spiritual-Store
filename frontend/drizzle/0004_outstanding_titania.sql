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
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
	NEW."updated_at" = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
ALTER TABLE "astrology_reports" ADD CONSTRAINT "astrology_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrology_reports" ADD CONSTRAINT "astrology_reports_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE TRIGGER "trg_update_timestamp_astrology_reports"
BEFORE UPDATE ON "astrology_reports"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER "trg_update_timestamp_users"
BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE INDEX "idx_astrology_reports_user" ON "astrology_reports" USING btree ("user_id");--> statement-breakpoint