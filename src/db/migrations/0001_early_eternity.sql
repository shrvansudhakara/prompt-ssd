CREATE TABLE "prompt_tag" (
	"prompt_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_tag_prompt_id_tag_id_pk" PRIMARY KEY("prompt_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name"),
	CONSTRAINT "tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "prompt_tag" ADD CONSTRAINT "prompt_tag_prompt_id_prompt_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_tag" ADD CONSTRAINT "prompt_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prompt_tag_prompt_id_idx" ON "prompt_tag" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_tag_tag_id_idx" ON "prompt_tag" USING btree ("tag_id");