-- Saved payment methods (ADR-006): opaque provider token + display metadata only.
-- Never add cvv/cvc/pan/card_number columns.

CREATE TABLE "saved_payment_methods" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_token" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" CHAR(4) NOT NULL,
    "exp_month" INTEGER NOT NULL,
    "exp_year" INTEGER NOT NULL,
    "cardholder_name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_payment_methods_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "saved_payment_methods_customer_id_idx" ON "saved_payment_methods"("customer_id");

CREATE INDEX "saved_payment_methods_customer_id_is_default_idx" ON "saved_payment_methods"("customer_id", "is_default");
