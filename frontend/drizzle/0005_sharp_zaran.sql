CREATE TABLE "report_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"report_type" text NOT NULL,
	"order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_report_type_entitlement" UNIQUE("user_id","report_type")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cashfree_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cashfree_payment_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_kind" text DEFAULT 'product' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "cashfree_payment_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "cashfree_order_id" text;--> statement-breakpoint
ALTER TABLE "report_entitlements" ADD CONSTRAINT "report_entitlements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_report_entitlements_user" ON "report_entitlements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_astrology_reports_cache_key" ON "astrology_reports" USING btree ("cache_key");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cashfree_order_id_unique" UNIQUE("cashfree_order_id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_cashfree_payment_id_unique" UNIQUE("cashfree_payment_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_kind_check" CHECK ("orders"."order_kind" IN ('product', 'report'));--> statement-breakpoint