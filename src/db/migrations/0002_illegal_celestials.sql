ALTER TABLE "email_verification" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_verification" ADD COLUMN "verified_at" timestamp;