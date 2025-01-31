-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "isMultiPage" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "elements" TEXT NOT NULL DEFAULT '[]',
    "config" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
