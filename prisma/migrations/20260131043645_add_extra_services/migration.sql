-- CreateTable
CREATE TABLE "ExtraService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderExtra" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "extraServiceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceAtOrder" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderExtra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExtraService_name_key" ON "ExtraService"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OrderExtra_orderId_extraServiceId_key" ON "OrderExtra"("orderId", "extraServiceId");

-- AddForeignKey
ALTER TABLE "OrderExtra" ADD CONSTRAINT "OrderExtra_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderExtra" ADD CONSTRAINT "OrderExtra_extraServiceId_fkey" FOREIGN KEY ("extraServiceId") REFERENCES "ExtraService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
