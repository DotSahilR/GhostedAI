CREATE TYPE "public"."account_provider" AS ENUM('gmail', 'caspian', 'telegram');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('connected', 'disconnected', 'error');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('waiting', 'needs_followup', 'completed', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."draft_status" AS ENUM('draft', 'approved', 'scheduled', 'sent', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."followup_action" AS ENUM('tracking_started', 'draft_generated', 'draft_approved', 'followup_sent', 'reply_received', 'status_changed', 'paused', 'resumed', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."message_direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email', 'telegram');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'sent', 'reply', 'completed', 'paused', 'connection', 'summary');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."tone" AS ENUM('professional', 'friendly', 'formal');--> statement-breakpoint
CREATE TYPE "public"."tracking_rule_event" AS ENUM('no_reply');--> statement-breakpoint
CREATE TABLE "connected_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "account_provider" NOT NULL,
	"account_name" text NOT NULL,
	"external_id" text,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"status" "account_status" DEFAULT 'disconnected' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"description" text,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"external_thread_id" text,
	"name" text NOT NULL,
	"handle" text NOT NULL,
	"company" text,
	"avatar_url" text,
	"subject" text NOT NULL,
	"category" text,
	"platform" "account_provider",
	"status" "conversation_status" DEFAULT 'waiting' NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"days_waiting" integer DEFAULT 0 NOT NULL,
	"last_message" text,
	"next_action" text,
	"confidence" integer DEFAULT 0 NOT NULL,
	"follow_ups_sent" integer DEFAULT 0 NOT NULL,
	"value" text,
	"last_message_at" timestamp with time zone,
	"next_follow_up_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"account_id" uuid,
	"direction" "message_direction" NOT NULL,
	"body" text NOT NULL,
	"external_message_id" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracking_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"event" "tracking_rule_event" DEFAULT 'no_reply' NOT NULL,
	"wait_minutes" integer DEFAULT 4320 NOT NULL,
	"max_follow_ups" integer DEFAULT 3 NOT NULL,
	"tone" "tone" DEFAULT 'professional' NOT NULL,
	"category" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "followup_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"tone" "tone" DEFAULT 'professional' NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" "draft_status" DEFAULT 'draft' NOT NULL,
	"variant" integer DEFAULT 1 NOT NULL,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "followup_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"draft_id" uuid,
	"action" "followup_action" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"detail" text,
	"channel" "notification_channel" DEFAULT 'in_app' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"title" text,
	"detail" text,
	"entity_type" text,
	"entity_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_type" text DEFAULT 'freelancer' NOT NULL,
	"wait_days" integer DEFAULT 3 NOT NULL,
	"max_follow_ups" integer DEFAULT 3 NOT NULL,
	"auto_send" boolean DEFAULT true NOT NULL,
	"default_tone" "tone" DEFAULT 'professional' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"working_hours_start" text,
	"working_hours_end" text,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"telegram_notifications" boolean DEFAULT true NOT NULL,
	"in_app_notifications" boolean DEFAULT true NOT NULL,
	"track_categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ignore_categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_rules" ADD CONSTRAINT "tracking_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followup_drafts" ADD CONSTRAINT "followup_drafts_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followup_drafts" ADD CONSTRAINT "followup_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followup_history" ADD CONSTRAINT "followup_history_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followup_history" ADD CONSTRAINT "followup_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followup_history" ADD CONSTRAINT "followup_history_draft_id_followup_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."followup_drafts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_user_id_idx" ON "conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "tracking_rules_user_id_idx" ON "tracking_rules" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "followup_drafts_conversation_id_idx" ON "followup_drafts" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "followup_history_conversation_id_idx" ON "followup_history" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs" USING btree ("user_id");