CREATE TYPE "public"."article_category" AS ENUM('audit', 'ux', 'seo', 'funnel', 'commerce');--> statement-breakpoint
CREATE TYPE "public"."campaign_event_type" AS ENUM('impression', 'click', 'dismiss', 'convert');--> statement-breakpoint
CREATE TYPE "public"."campaign_placement" AS ENUM('announcement_bar', 'inline', 'sticky_footer', 'exit_intent');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'active', 'paused', 'archived');--> statement-breakpoint
CREATE TABLE "cms_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"category" "article_category" DEFAULT 'audit' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"body" text,
	"excerpt" text,
	"client" text,
	"work_slug" text,
	"featured" boolean DEFAULT false NOT NULL,
	"proof" jsonb DEFAULT '[]'::jsonb,
	"comparisons" jsonb DEFAULT '[]'::jsonb,
	"hero_media_id" uuid,
	"reading_minutes" integer,
	"seo_title" text,
	"seo_description" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "campaign_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"event_type" "campaign_event_type" NOT NULL,
	"user_key" text NOT NULL,
	"page" text,
	"device" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"placement" "campaign_placement" DEFAULT 'announcement_bar' NOT NULL,
	"inline_hook" text,
	"heading" text,
	"body" text,
	"cta_label" text,
	"cta_url" text,
	"cta_new_tab" boolean DEFAULT false NOT NULL,
	"secondary_cta_label" text,
	"secondary_cta_url" text,
	"dismissible" boolean DEFAULT true NOT NULL,
	"theme_style" text DEFAULT 'default',
	"animation" text DEFAULT 'none',
	"audience" text DEFAULT 'all' NOT NULL,
	"page_pattern" text,
	"device_target" text DEFAULT 'all' NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"impression_cap" integer,
	"frequency_cap_hours" integer,
	"trigger_type" text DEFAULT 'immediate' NOT NULL,
	"trigger_delay" integer,
	"trigger_scroll_depth" integer,
	"duration" integer,
	"collapse_to_widget" boolean DEFAULT false NOT NULL,
	"position" text DEFAULT 'bottom-right' NOT NULL,
	"once_per_session" boolean DEFAULT false NOT NULL,
	"until_conversion" boolean DEFAULT false NOT NULL,
	"sequence_id" uuid,
	"sequence_position" integer,
	"sequence_condition" text DEFAULT 'seen',
	"conversion_value" integer,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cms_themes" ADD COLUMN "checkout_url" text;--> statement-breakpoint
ALTER TABLE "cms_themes" ADD COLUMN "screenshot_urls" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "cms_articles" ADD CONSTRAINT "cms_articles_hero_media_id_cms_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_events" ADD CONSTRAINT "campaign_events_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cms_articles_status_idx" ON "cms_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cms_articles_category_idx" ON "cms_articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "cms_articles_featured_idx" ON "cms_articles" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "campaign_events_campaign_idx" ON "campaign_events" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_events_user_key_idx" ON "campaign_events" USING btree ("user_key");--> statement-breakpoint
CREATE INDEX "campaign_events_type_idx" ON "campaign_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "campaign_events_created_at_idx" ON "campaign_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaigns_placement_idx" ON "campaigns" USING btree ("placement");--> statement-breakpoint
CREATE INDEX "campaigns_priority_idx" ON "campaigns" USING btree ("priority");