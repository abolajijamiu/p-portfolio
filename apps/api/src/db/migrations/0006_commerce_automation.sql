-- Add consultation + analytics workflow categories
ALTER TYPE "public"."deliverable_category" ADD VALUE IF NOT EXISTS 'consultation';--> statement-breakpoint
ALTER TYPE "public"."deliverable_category" ADD VALUE IF NOT EXISTS 'analytics';--> statement-breakpoint

-- Store WooCommerce product name on mappings (denormalised for display without WC API)
ALTER TABLE "product_mappings" ADD COLUMN IF NOT EXISTS "product_name" text;--> statement-breakpoint

-- Per-order automation event log (separate from general audit_logs for fast querying)
CREATE TABLE IF NOT EXISTS "commerce_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "order_id" uuid NOT NULL REFERENCES "public"."commerce_orders"("id") ON DELETE CASCADE,
  "event" text NOT NULL,
  "status" text NOT NULL DEFAULT 'ok',
  "detail" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "commerce_events_order_idx" ON "commerce_events" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "commerce_events_created_idx" ON "commerce_events" ("created_at");
