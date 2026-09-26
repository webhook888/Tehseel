"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Center,
  Container,
  Spinner,
  Button,
  HStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import InvoicePreview from "@/components/Invoice/InvoicePreview";

const hideOnPrint = { "@media print": { display: "none !important" } };

export default function ViewInvoicePage({ params }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/invoices/${params.id}`, { credentials: "include" });
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
        <Button as={NextLink} href="/invoices" variant="outline">
          Receipts List
        </Button>
        <Button as={NextLink} href={`/invoices/${params.id}/edit`} variant="outline">
          Edit
        </Button>
        <Button colorScheme="blue" onClick={() => window.print()}>
          Print
        </Button>
      </HStack>
      <InvoicePreview invoice={invoice} showActions={false} />
    </Container>
  );
}
