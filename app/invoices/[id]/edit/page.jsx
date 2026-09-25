"use client";

import { useEffect, useState } from "react";
import { Alert, AlertIcon, Center, Container, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm/InvoiceForm";

export default function EditInvoicePage({ params }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/invoices/${params.id}`);
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

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <InvoiceForm
        mode="edit"
        initialInvoice={invoice}
        onSubmitted={(updated, meta) =>
          router.push(meta?.print ? `/invoices/${updated.id}?print=1` : `/invoices/${updated.id}`)
        }
      />
    </Container>
  );
}
