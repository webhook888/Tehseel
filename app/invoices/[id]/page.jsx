"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  AlertIcon,
  Center,
  Container,
  Spinner,
  Button,
  HStack,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import InvoicePreview from "@/components/Invoice/InvoicePreview";
import { decodeQrInvoice } from "@/lib/qr";

const hideOnPrint = { "@media print": { display: "none !important" } };

export default function ViewInvoicePage({ params }) {
  const [invoice, setInvoice] = useState(null);
  const [fromScan, setFromScan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const invoiceRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const encoded = new URLSearchParams(window.location.search).get("p");
      const scanned = decodeQrInvoice(encoded);
      if (scanned) {
        setInvoice(scanned);
        setFromScan(true);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/invoices/${params.id}`, { credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load invoice");
        setInvoice(json.data);
        setFromScan(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  useEffect(() => {
    if (!invoice) return;
    const shouldPrint = new URLSearchParams(window.location.search).get("print") === "1";
    if (!shouldPrint) return;
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [invoice]);

  async function shareInvoice() {
    if (!invoiceRef.current) return;

    setSharing(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(invoiceRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const widthMm = 80;
      const heightMm = (canvas.height * widthMm) / canvas.width;
      const pdf = new jsPDF({ unit: "mm", format: [widthMm, heightMm] });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, widthMm, heightMm);

      const filename = `receipt-${invoice.receipt?.receiptNumber || invoice.invoiceNumber || params.id}.pdf`;
      const file = new File([pdf.output("blob")], filename, { type: "application/pdf" });
      const shareData = {
        title: "Invoice",
        text: "Invoice receipt",
        files: [file],
      };

      if (navigator.share && typeof navigator.canShare === "function" && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({ title: "Invoice ready to share", status: "success", duration: 2500, isClosable: true });
      } else {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
        toast({ title: "PDF downloaded", description: "You can now send it to the customer.", status: "info", duration: 3500, isClosable: true });
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        toast({ title: "Could not create the PDF", status: "error", duration: 3500, isClosable: true });
      }
    } finally {
      setSharing(false);
    }
  }

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxW="4xl"
      py={8}
      sx={{ "@media print": { maxW: "100%", p: "0 !important", m: "0 auto" } }}
    >
      <HStack justify="center" mb={4} sx={hideOnPrint}>
        {!fromScan && (
          <>
            <Button as={NextLink} href="/invoices" variant="outline">
              Receipts List
            </Button>
            <Button as={NextLink} href={`/invoices/${params.id}/edit`} variant="outline">
              Edit
            </Button>
          </>
        )}
        <Button colorScheme="blue" onClick={() => window.print()}>
          Print
        </Button>
        <Button colorScheme="green" onClick={shareInvoice} isLoading={sharing} loadingText="Preparing PDF">
          Share
        </Button>
      </HStack>
      <InvoicePreview invoice={invoice} invoiceRef={invoiceRef} showActions={false} />
    </Container>
  );
}
