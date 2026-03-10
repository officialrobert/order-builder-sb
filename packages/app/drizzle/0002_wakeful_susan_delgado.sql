CREATE TABLE IF NOT EXISTS "deal_structure" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NULL,
	"deleted_at" timestamp with time zone DEFAULT NULL,
	"order_id" uuid DEFAULT NULL,
	"contract_start_date" timestamp with time zone DEFAULT now() NOT NULL,
	"contract_end_date" timestamp with time zone DEFAULT NULL,
	"contract_months_period" integer DEFAULT 12
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_structure" ADD CONSTRAINT "deal_structure_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
