"use client";

import { useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { MdAccessTime } from "react-icons/md";
import { generateId } from "@/lib/id";

const hideOnPrint = { "@media print": { display: "none !important" } };

const defaults = {
  gate: "الذيد",
  trn: "10053125656353900003",
  meridian: "PM",
  time: "12:28",
  receiptNumber: "34011308243764279",
  service: "عبور بدون بطاقة . رسوم عبور شاحنة مع مقطورة نقدى",
  owner: "",
  vehicle: "Oman (WK) 4229",
  amount: "470.50",
  otherFees: "0",
  researchFee: "0",
  collectionFee: "0",
  vatFee: "0",
  tollGate: "Omnis quia consequat",
};

const fieldRows = [
  { key: "gate", type: "select", inline: ":TRN", label: "هيئة الطرق والمواصلات نظام التعرفة المرورية للشاحنات بوابة :", options: ["الذيد", "بوابة الزبير"] },
  { key: "invoiceDate", type: "date", inline: ":الوقت", label: "التاريخ :" },
  { key: "receiptNumber", type: "text", label: "رقم الايصال:" },
  {
    key: "service",
    type: "select",
    label: "نوع الخدمة:",
    options: [
      "عبور بدون بطاقة . رسوم عبور شاحنة مع مقطورة نقدى",
      "رسوم عبور شاحنة مع مقطورة",
    ],
  },
  { key: "owner", type: "text", label: "اسم المالك:" },
  { key: "vehicle", type: "text", label: "رقم المركبة:" },
  { key: "amount", type: "text", inline: "درهم", label: "اجمالى المبلغ:" },
  { key: "otherFees", type: "text", label: "رسوم أخرى:" },
  { key: "researchFee", type: "text", inline: "درهم", label: "دعم الابحاث العلمية فى امارة الشارقة:" },
  { key: "collectionFee", type: "text", inline: "درهم", label: "رسوم خدمات تحصيل:" },
  { key: "vatFee", type: "text", inline: "درهم", label: "رسوم ضريبة القيمة المضافة:" },
  { key: "tollGate", type: "text", label: "Toll Gate:", labelDir: "rtl" },
];

const fieldStyle = {
  h: "38px",
  bg: "white",
  border: "1px solid",
  borderColor: "#ced4da",
  borderRadius: "4px",
  fontSize: "14px",
  color: "#333",
};

function FieldControl({ row, receipt, invoiceDate, setInvoiceDate, update }) {
  if (row.type === "select") {
    return (
      <Select
        {...fieldStyle}
        value={receipt[row.key]}
        onChange={(e) => update(row.key, e.target.value)}
        textAlign="right"
        dir="rtl"
      >
        {row.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    );
  }
  if (row.type === "date") {
    return (
      <Input
        {...fieldStyle}
        type="date"
        value={invoiceDate}
        onChange={(e) => setInvoiceDate(e.target.value)}
        dir="ltr"
        textAlign="left"
      />
    );
  }
  return (
    <Input
      {...fieldStyle}
      value={receipt[row.key] ?? ""}
      onChange={(e) => update(row.key, e.target.value)}
      textAlign="right"
    />
  );
}

export default function InvoiceForm({ mode = "create", initialInvoice, onSubmitted }) {
  const toast = useToast();
  const formRef = useRef(null);
  const printAfterSave = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [stamp, setStamp] = useState(false);
  const [receipt, setReceipt] = useState({ ...defaults, ...(initialInvoice?.receipt || {}) });
  const [invoiceDate, setInvoiceDate] = useState(
    initialInvoice?.invoiceDate || new Date().toISOString().slice(0, 10),
  );
  const update = (key, value) => setReceipt((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    const payload = {
      invoiceDate,
      receipt,
      customer: { name: receipt.owner || "—", phone: "", address: receipt.vehicle || "" },
      items: [
        {
          id: initialInvoice?.items?.[0]?.id || generateId("item"),
          name: receipt.service || "رسوم عبور",
          quantity: 1,
          price: Number(receipt.amount) || 0,
        },
      ],
      discount: { type: "flat", value: 0 },
      taxPercent: 0,
    };
    try {
      const response = await fetch(
        mode === "edit" ? `/api/invoices/${initialInvoice.id}` : "/api/invoices",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Request failed");
      const shouldPrint = printAfterSave.current;
      printAfterSave.current = false;
      onSubmitted?.(json.data, { print: shouldPrint });
    } catch (error) {
      printAfterSave.current = false;
      toast({ title: "تعذر حفظ الإيصال", description: error.message, status: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      maxW="1240px"
      mx="auto"
      bg="white"
      border="1px solid"
      borderColor="#d8dee4"
      borderRadius="6px"
      overflow="hidden"
      boxShadow="0 1px 3px rgba(0,0,0,.06)"
    >
      <Box bg="#2196F3" color="white" px="16px" py="10px" fontSize="14px" fontWeight="500">
        Payment Receipt
      </Box>
      <Box as="form" ref={formRef} onSubmit={submit} px={{ base: "16px", md: "22px" }} pt="18px" pb="28px">
        <Heading as="h1" fontSize="26px" fontWeight="700" color="#212121" mb="18px" lineHeight="1.2">
          Tax Invoice / فاتورة ضريبية
        </Heading>

        <Flex direction={{ base: "column", lg: "row" }} align="flex-start" gap={{ base: 5, lg: "36px" }}>
          <Stack w={{ base: "full", lg: "250px" }} spacing="10px" flexShrink={0} pt="2px">
            <Input
              {...fieldStyle}
              value={receipt.trn}
              onChange={(e) => update("trn", e.target.value)}
              textAlign="right"
              aria-label="TRN Number"
            />
            <Grid templateColumns="1fr 1fr" gap="10px">
              <Select
                {...fieldStyle}
                value={receipt.meridian || "PM"}
                onChange={(e) => update("meridian", e.target.value)}
                aria-label="AM PM"
              >
                <option value="PM">PM</option>
                <option value="AM">AM</option>
              </Select>
              <InputGroup>
                <Input
                  {...fieldStyle}
                  type="time"
                  value={receipt.time}
                  onChange={(e) => update("time", e.target.value)}
                  aria-label="Time"
                  pr="36px"
                />
                <InputRightElement h="38px" color="#6c757d" pointerEvents="none">
                  <MdAccessTime />
                </InputRightElement>
              </InputGroup>
            </Grid>
          </Stack>

          <Stack spacing="8px" flex="1" w="full">
            {fieldRows.map((row) => (
              <Grid
                key={row.key}
                templateColumns={{ base: "1fr", md: "58px minmax(240px, 400px) minmax(180px, 1fr)" }}
                columnGap="12px"
                alignItems="center"
                minH="38px"
              >
                <Text fontSize="14px" color="#333" textAlign="right" whiteSpace="nowrap">
                  {row.inline || ""}
                </Text>
                <FieldControl
                  row={row}
                  receipt={receipt}
                  invoiceDate={invoiceDate}
                  setInvoiceDate={setInvoiceDate}
                  update={update}
                />
                <Text
                  fontSize="15px"
                  textAlign="right"
                  color="#111"
                  lineHeight="1.35"
                  dir={row.labelDir || "rtl"}
                >
                  {row.label}
                </Text>
              </Grid>
            ))}

            <Box pl={{ md: "70px" }} pt="6px">
              <Checkbox
                isChecked={stamp}
                onChange={(e) => setStamp(e.target.checked)}
                color="#333"
                size="md"
              >
                Is Stamp Show
              </Checkbox>
              <Stack direction="row" spacing="8px" mt="10px" sx={hideOnPrint}>
                <Button type="submit" colorScheme="blue" size="sm" px="18px" isLoading={submitting}>
                  Save
                </Button>
                <Button
                  type="button"
                  colorScheme="blue"
                  size="sm"
                  px="18px"
                  isLoading={submitting}
                  onClick={() => {
                    printAfterSave.current = true;
                    formRef.current?.requestSubmit();
                  }}
                >
                  Print
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Flex>
      </Box>
    </Box>
  );
}
