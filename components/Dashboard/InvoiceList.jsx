"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/invoices", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => setInvoices(j.data || []))
      .catch(() => setInvoices([]));
  }, []);

  const matching = invoices.filter((inv) =>
    `${inv.receipt?.receiptNumber || inv.invoiceNumber} ${inv.receipt?.trn || ""}`.includes(
      query,
    ),
  );

  async function remove(id) {
    if (!window.confirm("Delete this receipt?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE", credentials: "include" });
    setInvoices((old) => old.filter((item) => item.id !== id));
  }

  const actionBtn = {
    display: "inline-block",
    borderRadius: "4px",
    px: "13px",
    py: "8px",
    bg: "#22bed1",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    _hover: { bg: "#1aa8b9", textDecoration: "none" },
  };

  return (
    <Box
      as="main"
      minH="calc(100vh - 134px)"
      px={{ base: "16px", md: "25px" }}
      pt="16px"
      pb="40px"
      bg="#edf7fc"
      fontFamily="Arial, sans-serif"
    >
      <Heading as="h1" color="#168ce8" mb="4px" fontSize="22px" fontWeight="400">
        Receipt Generator
      </Heading>
      <Text color="#78a5c8" fontSize="14px" mb="22px">
        Home
        <Text as="span" mx="7px">
          ›
        </Text>
        Receipt Generator
      </Text>
      <Box
        maxW="1248px"
        border="1px solid"
        borderColor="#d7e0e4"
        borderRadius="4px"
        bg="white"
        overflow="hidden"
      >
        <Box bg="#2689dd" color="white" px="20px" py="12px" fontSize="18px">
          Previous Receipt Information
        </Box>
        <Box p="20px">
          <Input
            placeholder="Search Receipt"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            w="604px"
            maxW="100%"
            h="38px"
            border="1px solid"
            borderColor="#d4dbe0"
            borderRadius="4px"
            px="12px"
            fontSize="16px"
          />
          <Box borderTop="1px solid" borderColor="#d9dfe2" my="17px" />
          <TableContainer maxH="250px" overflowY="auto" overflowX={{ base: "auto", md: "hidden" }}>
            <Table variant="unstyled" minW={{ base: "900px", md: "full" }}>
              <Thead>
                <Tr>
                  {["ID", "TRN", "Number", "Name", "Amount", "Action"].map((label) => (
                    <Th
                      key={label}
                      bg="#069cb1"
                      color="white"
                      textAlign="left"
                      px="12px"
                      py="14px"
                      fontSize="16px"
                      fontWeight="700"
                    >
                      {label}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {matching.map((inv, index) => (
                  <Tr key={inv.id} _even={{ bg: "#f1f3f6" }}>
                    <Td color="#9aafc5" px="12px" py="13px" borderRight="1px solid" borderColor="#e8eaec" fontSize="16px">
                      {inv.receipt?.receiptNumber?.slice(-5) || 13502 - index}
                    </Td>
                    <Td color="#9aafc5" px="12px" py="13px" borderRight="1px solid" borderColor="#e8eaec" fontSize="16px">
                      {inv.receipt?.trn || "1005313533900003"}
                    </Td>
                    <Td color="#9aafc5" px="12px" py="13px" borderRight="1px solid" borderColor="#e8eaec" fontSize="16px">
                      {inv.receipt?.receiptNumber || inv.invoiceNumber}
                    </Td>
                    <Td color="#9aafc5" px="12px" py="13px" borderRight="1px solid" borderColor="#e8eaec" fontSize="16px">
                      {inv.receipt?.owner || ""}
                    </Td>
                    <Td color="#9aafc5" px="12px" py="13px" borderRight="1px solid" borderColor="#e8eaec" fontSize="16px">
                      {inv.receipt?.amount || inv.grandTotal?.toFixed(2)}
                    </Td>
                    <Td color="#9aafc5" px="12px" py="13px" fontSize="16px">
                      <Flex align="center" wrap="wrap">
                        <Link as={NextLink} href={`/invoices/${inv.id}?print=1`} {...actionBtn}>
                          Print
                        </Link>
                        <Text as="span" color="#22bed1" mx="10px">
                          |
                        </Text>
                        <Link as={NextLink} href={`/invoices/${inv.id}`} {...actionBtn}>
                          Back Print
                        </Link>
                        <Text as="span" color="#22bed1" mx="10px">
                          |
                        </Text>
                        <Button type="button" onClick={() => remove(inv.id)} h="auto" minW="unset" {...actionBtn}>
                          Delete
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}
