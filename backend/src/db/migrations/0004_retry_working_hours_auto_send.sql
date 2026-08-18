ALTER TABLE "followup_drafts" ADD COLUMN "retry_count" integer NOT NULL DEFAULT 0;
ALTER TABLE "followup_drafts" ADD COLUMN "next_retry_at" timestamp with time zone;
ALTER TABLE "followup_drafts" ADD COLUMN "last_error" text;
ALTER TABLE "conversations" ADD COLUMN "auto_send" boolean;
