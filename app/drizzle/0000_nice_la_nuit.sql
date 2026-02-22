CREATE TABLE "books" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"subtitle" varchar,
	"authors" jsonb,
	"pubdate" varchar,
	"description" text,
	"isbn" varchar,
	"isbn_data" jsonb,
	"thumbnail" varchar,
	"bib_barcode" varchar,
	"bib_comment" varchar,
	"bib_room" varchar,
	"bib_section" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bukker" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"died" varchar,
	"comment" varchar,
	"awards" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "googleapps_accounts" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"accountname" varchar NOT NULL,
	"group" varchar,
	"aliases" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone
);
--> statement-breakpoint
CREATE TABLE "googleapps_accountusers" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"account_id" varchar(24) NOT NULL,
	"username" varchar NOT NULL,
	"notification" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone
);
--> statement-breakpoint
CREATE TABLE "matmeny" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"day" date NOT NULL,
	"text" text,
	"dishes" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matmeny_day_unique" UNIQUE("day")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"token_hash" varchar NOT NULL,
	"username" varchar NOT NULL,
	"email" varchar NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "registration_requests" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"firstname" varchar NOT NULL,
	"lastname" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"password_hash" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"group_name" varchar,
	"processed_by" varchar,
	"processed_at" timestamp (3) with time zone,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"remember_token" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "googleapps_accountusers" ADD CONSTRAINT "googleapps_accountusers_account_id_googleapps_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."googleapps_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "googleapps_accountusers_account_username_unique" ON "googleapps_accountusers" USING btree ("account_id","username") WHERE deleted_at IS NULL;