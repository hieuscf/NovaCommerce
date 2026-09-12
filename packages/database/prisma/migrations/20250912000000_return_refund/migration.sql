-- CreateEnum
CREATE TYPE "ReturnRequestStatus" AS ENUM ('requested', 'approved', 'refunded', 'rejected');

-- CreateTable
CREATE TABLE "return_requests" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "status" "ReturnRequestStatus" NOT NULL DEFAULT 'requested',
    "refund_amount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "return_requests_order_id_idx" ON "return_requests"("order_id");

-- CreateIndex
CREATE INDEX "return_requests_customer_id_idx" ON "return_requests"("customer_id");

-- CreateIndex
CREATE INDEX "return_requests_payment_id_idx" ON "return_requests"("payment_id");

-- CreateIndex
CREATE INDEX "return_requests_status_idx" ON "return_requests"("status");
