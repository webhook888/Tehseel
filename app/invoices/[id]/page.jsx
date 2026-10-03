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
import InvoicePreview from "@/components/Invoice/InvoicePreview";
import { decodeQrInvoice } from "@/lib/qr";

const hideOnPrint = { "@media print": { display: "none !important" } };

export default function ViewInvoicePage({ params }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
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
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/invoices/${params.id}`, {
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load invoice");
        setInvoice(json.data);
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

  function openPrintTab() {
    const printUrl = new URL(window.location.href);
    printUrl.searchParams.set("print", "1");
    window.open(printUrl.toString(), "_blank", "noopener,noreferrer");
  }

  async function createInvoicePdf() {
    if (!invoiceRef.current) return;
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(invoiceRef.current, {
      backgroundColor: "#ffffff",
      // Keep the QR modules crisp in the generated PDF.  A higher capture
      // scale prevents thin modules from disappearing when a phone scans it.
      scale: 4,
      useCORS: true,
      logging: false,
    });
    const widthMm = 80;
    const heightMm = (canvas.height * widthMm) / canvas.width;
    const pdf = new jsPDF({ unit: "mm", format: [widthMm, heightMm] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, widthMm, heightMm);
    const filename = `invoice-${invoice.receipt?.receiptNumber || invoice.invoiceNumber || params.id}.pdf`;
    return { pdf, filename };
  }

  async function downloadInvoice() {
    if (!invoiceRef.current) return;

    setDownloading(true);
    try {
      const { pdf, filename } = await createInvoicePdf();
      pdf.save(filename);
      toast({ title: "Invoice downloaded", status: "success", duration: 2500, isClosable: true });
    } catch {
      toast({ title: "Could not download the invoice", status: "error", duration: 3500, isClosable: true });
    } finally {
      setDownloading(false);
    }
  }

  async function shareInvoice() {
    if (!invoiceRef.current) return;

    setSharing(true);
    try {
      const { pdf, filename } = await createInvoicePdf();
      const file = new File([pdf.output("blob")], filename, { type: "application/pdf" });

      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          title: "Invoice",
          text: `Invoice ${invoice.receipt?.receiptNumber || invoice.invoiceNumber || ""}`,
          files: [file],
        });
        return;
      }

      pdf.save(filename);
      toast({ title: "PDF downloaded — your browser does not support file sharing", status: "info", duration: 4000, isClosable: true });
    } catch (err) {
      if (err?.name !== "AbortError") {
        toast({ title: "Could not share the invoice", status: "error", duration: 3500, isClosable: true });
      }
    } finally {
      setSharing(false);
    }
  }

  useEffect(() => {
    if (!invoice || new URLSearchParams(window.location.search).get("share") !== "1") return;
    shareInvoice();
  }, [invoice]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <Button colorScheme="blue" onClick={openPrintTab}>
          Print
        </Button>
        <Button
          colorScheme="green"
          onClick={downloadInvoice}
          isLoading={downloading}
          loadingText="Preparing PDF"
        >
          Download
        </Button>
        <Button
          colorScheme="teal"
          onClick={shareInvoice}
          isLoading={sharing}
          loadingText="Preparing PDF"
        >
          Share
        </Button>
      </HStack>
      <InvoicePreview invoice={invoice} invoiceRef={invoiceRef} showActions={false} />
    </Container>
  );
}
