"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import QRCode from "react-qr-code";

const hideOnPrint = { "@media print": { display: "none !important" } };

const fallback = {
  trn: "100531353900003",
  gate: "الزبیر",
  time: "09:26",
  meridian: "PM",
  receiptNumber: "34302608269247165",
  service: "رسوم عبور شاحنة مع مقطورة",
  owner: "بي اف بي للنقليات ش.ذ.م.م",
  vehicle: "DXB 20956",
  amount: "420.50",
  researchFee: "10.00",
  collectionFee: "10.00",
  vatFee: "0.50",
  tollGate: "",
};

function formatTime(receipt) {
  const raw = receipt.time || "";
  if (/[مص]/.test(raw)) return raw;
  if (/am|pm/i.test(raw)) {
    return raw.replace(/pm/i, "م").replace(/am/i, "ص");
  }
  const suffix = receipt.meridian === "AM" ? "ص" : "م";
  return raw ? `${raw} ${suffix}` : "";
}

function formatMoney(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value || "0";
  return n.toFixed(2);
}

function splitVehicle(vehicle = "") {
  const text = String(vehicle).trim();
  const match =
    text.match(/^([A-Za-z]+)\s+(.+)$/) ||
    text.match(/^(.+?)\s+([A-Za-z]{2,})$/);
  if (match) {
    if (/^[A-Za-z]+$/.test(match[1]))
      return { code: match[1], number: match[2] };
    return { code: match[2], number: match[1] };
  }
  return { code: "", number: text };
}

function DetailRow({ label, value, strong = false }) {
  return (
    <Flex align="baseline" dir="rtl" fontSize="15px" lineHeight="1.65">
      <Text as="span" w="38%" textAlign="right" whiteSpace="nowrap">
        {label} :
      </Text>
      <Text
        as="span"
        flex="1"
        textAlign="right"
        fontWeight={strong ? "700" : "400"}
        letterSpacing={strong ? "0.3px" : "0"}
      >
        {value}
      </Text>
    </Flex>
  );
}

function FeeRow({ label, value }) {
  return (
    <Flex
      justify="flex-start"
      align="baseline"
      dir="rtl"
      fontSize="15px"
      lineHeight="1.65"
    >
      <Text flex="1" textAlign="right" whiteSpace="nowrap">{label}</Text>
      <Text w="62px" textAlign="left" whiteSpace="nowrap">
        {formatMoney(value)} درهم
      </Text>
    </Flex>
  );
}

export default function InvoicePreview({
  invoice,
  showActions = true,
  invoiceRef,
}) {
  if (!invoice) return null;
  const r = { ...fallback, ...(invoice.receipt || {}) };
  const date = invoice.invoiceDate
    ? new Date(`${invoice.invoiceDate}T00:00:00`).toLocaleDateString("en-GB")
    : "26/08/2026";
  const vehicle = splitVehicle(r.vehicle);
  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}/invoices/${invoice.id}`
      : `/invoices/${invoice.id}`;

  return (
    <Flex direction="column" align="center">
      {showActions && (
        <Box mb="16px" sx={hideOnPrint}>
          <Button onClick={() => window.print()} colorScheme="blue">
            Print
          </Button>
        </Box>
      )}
      <Box
        as="article"
        ref={invoiceRef}
        dir="rtl"
        lang="ar"
        w="80mm"
        px="7mm"
        pt="8mm"
        pb="8mm"
        bg="white"
        color="#111"
        fontFamily="serif"
        boxShadow="0 1px 4px rgba(0,0,0,.12)"
        sx={{
          "@media print": {
            w: "80mm",
            m: "0 auto",
            boxShadow: "none",
            px: "5mm",
          },
        }}
      >
        <Box pb="6px">
          <Box
            as="img"
            src="/logonew.png"
            alt="Tahseel logo"
            w="160px"
            h="auto"
            mx="auto"
            display="block"
          />
        </Box>
        <Box borderBottom="1.5px solid" borderColor="#111" mb="6px" />

        <Text
          textAlign="center"
          fontSize="18px"
          fontWeight="bold"
          lineHeight="1.25"
          mb="5px"
        >
          حكومة الشارقة
        </Text>
        <Flex
          justify="center"
          gap="12px"
          textAlign="center"
          fontSize="15px"
          fontWeight="600"
          lineHeight="1.55"
          mb="3px"
        >
          <Box flex="0 1 auto" whiteSpace="nowrap">
            <Text>هيئة الطرق والمواصلات</Text>
            <Text>نظام التعرفة المرورية للشاحنات</Text>
          </Box>
          <Box flex="0 1 auto" whiteSpace="nowrap">
            <Text>دائرة المالية المركزية</Text>
            <Text>نظام الدفع الرقمي تحصيل</Text>
          </Box>
        </Flex>
        <Text
          textAlign="center"
          fontSize="15px"
          fontWeight="700"
          lineHeight="1.35"
          mb="6px"
          w={'50%'}
        >
          بوابة {r.gate}
        </Text>

        <Box borderBottom="1.5px solid" borderColor="#111" mb="6px" />

        <Text
          dir="ltr"
          textAlign="center"
          fontSize="16px"
          fontWeight="700"
          mb="3px"
        >
          (Payment Receipt)
        </Text>
        <Text textAlign="center" fontSize="15px" mb="3px">
          فاتورۃ ضرببیة  / Tax Invoice 
        </Text>
        <Text dir="ltr" textAlign="center" fontSize="15px" mb="6px">
          TRN: {r.trn}
        </Text>

        <Flex
          justify="space-between"
          dir="rtl"
          fontSize="15px"
          mb="4px"
          px="2px"
        >
          <Text whiteSpace="nowrap">تاريخ العبور : {date}</Text>
          <Text whiteSpace="nowrap">الوقت : {formatTime(r)}</Text>
        </Flex>

        <DetailRow label="رقم الإيصال" value={r.receiptNumber} strong />
        <DetailRow label="نوع الخدمة" value={r.service} />
        <DetailRow label="اسم المالك" value={r.owner} />

        <Flex
          justify="space-between"
          align="baseline"
          dir="rtl"
          fontSize="15px"
          lineHeight="1.65"
        >
          <Text>رقم المركبة : {vehicle.number}</Text>
          <Text w="52px" dir="ltr" textAlign="left">{vehicle.code}</Text>
        </Flex>

        <Flex
          justify="space-between"
          align="baseline"
          dir="rtl"
          fontSize="15px"
          lineHeight="1.65"
          mb="4px"
        >
          <Text>إجمالي المبلغ : {formatMoney(r.amount)}</Text>
          <Text>درهم</Text>
        </Flex>

        <Text
          textAlign="right"
          fontWeight="700"
          fontSize="15px"
          mt="6px"
          mb="4px"
        >
          رسوم أخرى :
        </Text>
        <FeeRow
          label="دعم الأبحاث العلمية في إمارة الشارقة"
          value={r.researchFee}
        />
        <FeeRow label="رسم خدمة تحصيل" value={r.collectionFee} />
        <FeeRow label="رسم ضريبة القيمة المضافة" value={r.vatFee} />

        <Text textAlign="right" fontSize="15px" mt="6px" mb="8px">
          اسم المستخدم : {r.tollGate || ""}
        </Text>

        <Text textAlign="center" fontSize="14px" lineHeight="1.55" mb="10px">
          <Text as="span" fontWeight="700">
            ملاحظة :
          </Text>{" "}
          يرجى الإحتفاظ بإيصال تحصيل لدواعي أمنية
        </Text>

        <Flex dir="ltr" justify="center" position="relative">
          <Box position="relative" w="128px" h="128px" p="4px" bg="white">
            <QRCode
              value={qrValue}
              level="H"
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
            <Flex
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              px="2px"
              py="2px"
              align="center"
              justify="center"
            >
              <Box
                as="img"
                src="/logonew.png"
                alt="Tahseel logo"
                w="44px"
                h="auto"
              />
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
}
