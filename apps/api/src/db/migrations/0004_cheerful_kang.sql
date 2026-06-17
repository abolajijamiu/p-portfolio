CREATE TYPE "public"."commerce_order_status" AS ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."deliverable_category" AS ENUM('theme', 'support', 'custom_project', 'license', 'service');--> statement-breakpoint
CREATE TYPE "public"."deliverable_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'order_received';--> statement-breakpoint
CREATE TABLE "commerce_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commerce_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"external_product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"price_cents" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "commerce_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"status" "commerce_order_status" NOT NULL,
	"total_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliverable_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category" "deliverable_category" NOT NULL,
	"auto_trigger" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"deliverable_type_id" uuid NOT NULL,
	"status" "deliverable_status" DEFAULT 'pending' NOT NULL,
	"assigned_to" uuid,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"external_product_id" text NOT NULL,
	"deliverable_type_id" uuid NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wc_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" text NOT NULL,
	"webhook_id" text,
	"topic" text NOT NULL,
	"external_order_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"payload" jsonb NOT NULL,
	"error" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commerce_customers" ADD CONSTRAINT "commerce_customers_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commerce_customers" ADD CONSTRAINT "commerce_customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commerce_order_items" ADD CONSTRAINT "commerce_order_items_order_id_commerce_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."commerce_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commerce_orders" ADD CONSTRAINT "commerce_orders_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commerce_orders" ADD CONSTRAINT "commerce_orders_customer_id_commerce_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."commerce_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverable_types" ADD CONSTRAINT "deliverable_types_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_order_id_commerce_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."commerce_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_customer_id_commerce_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."commerce_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_deliverable_type_id_deliverable_types_id_fk" FOREIGN KEY ("deliverable_type_id") REFERENCES "public"."deliverable_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_mappings" ADD CONSTRAINT "product_mappings_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_mappings" ADD CONSTRAINT "product_mappings_deliverable_type_id_deliverable_types_id_fk" FOREIGN KEY ("deliverable_type_id") REFERENCES "public"."deliverable_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "commerce_customers_org_email_uniq" ON "commerce_customers" USING btree ("org_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "commerce_orders_provider_external_uniq" ON "commerce_orders" USING btree ("org_id","provider","external_id");--> statement-breakpoint
CREATE INDEX "commerce_orders_status_idx" ON "commerce_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "commerce_orders_customer_idx" ON "commerce_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "deliverable_types_org_slug_uniq" ON "deliverable_types" USING btree ("org_id","slug");--> statement-breakpoint
CREATE INDEX "deliverables_order_idx" ON "deliverables" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "deliverables_customer_idx" ON "deliverables" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "deliverables_status_idx" ON "deliverables" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "product_mappings_provider_product_uniq" ON "product_mappings" USING btree ("org_id","provider","external_product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wc_webhook_events_delivery_id_uniq" ON "wc_webhook_events" USING btree ("delivery_id");--> statement-breakpoint
CREATE INDEX "wc_webhook_events_order_idx" ON "wc_webhook_events" USING btree ("external_order_id");--> statement-breakpoint
CREATE INDEX "wc_webhook_events_status_idx" ON "wc_webhook_events" USING btree ("status");