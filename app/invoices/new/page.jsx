"use client";

import { useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import InvoiceForm from "@/components/InvoiceForm/InvoiceForm";
import { invoiceScanPath } from "@/lib/qr";

export default function NewInvoicePage() {
  const router = useRouter();
  return (
    <Box as="main" px={{ base: 3, md: 5 }} py="16px" pb="40px" bg="#f7f9fb" minH="calc(100vh - 120px)">
      <InvoiceForm
        mode="create"
        onSubmitted={(invoice, meta) => {
          const path = invoiceScanPath(invoice);
          router.push(meta?.print ? `${path}&print=1` : path);
        }}
      />
    </Box>
  );
}
