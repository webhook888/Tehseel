"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import TahseelLogo from "./TahseelLogo";
import { invoiceScanUrl } from "@/lib/qr";

const hideOnPrint = { "@media print": { display: "none !important" } };

const fallback = {
  trn: "100531353900003",
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
  const match = text.match(/^([A-Za-z]+)\s+(.+)$/) || text.match(/^(.+?)\s+([A-Za-z]{2,})$/);
  if (match) {
    if (/^[A-Za-z]+$/.test(match[1])) return { code: match[1], number: match[2] };
    return { code: match[2], number: match[1] };
  }
  return { code: "", number: text };
}

function DetailRow({ label, value, strong = false }) {
  return (
    <Flex justify="center" dir="rtl" fontSize="14px" lineHeight="1.7" gap="6px">
      <Text as="span" whiteSpace="nowrap">
        {label} :
      </Text>
      <Text as="span" fontWeight={strong ? "700" : "400"} letterSpacing={strong ? "0.3px" : "0"}>
        {value}
      </Text>
    </Flex>
  );
}

function FeeRow({ label, value }) {
  return (
    <Flex justify="space-between" align="baseline" dir="rtl" fontSize="13.5px" lineHeight="1.75" px="2px">
      <Text>{label}</Text>
      <Text dir="ltr" whiteSpace="nowrap">
        {formatMoney(value)} درهم
      </Text>
    </Flex>
  );
}

export default function InvoicePreview({ invoice, showActions = true }) {
  if (!invoice) return null;
  const r = { ...fallback, ...(invoice.receipt || {}) };
  const date = invoice.invoiceDate
    ? new Date(`${invoice.invoiceDate}T00:00:00`).toLocaleDateString("en-GB")
    : "26/08/2026";
  const vehicle = splitVehicle(r.vehicle);
  const qrValue = invoiceScanUrl(
    invoice.id,
    typeof window !== "undefined" ? window.location.origin : "",
  );

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
        dir="rtl"
        lang="ar"
        w="80mm"
        px="7mm"
        pt="8mm"
        pb="8mm"
        bg="white"
        color="#111"
        fontFamily="Tahoma, Arial, sans-serif"
        boxShadow="0 1px 4px rgba(0,0,0,.12)"
        sx={{
          "@media print": {
            w: "80mm",
            m: "0 auto",
            boxShadow: "none",
            px: "6mm",
          },
        }}
      >
        <Box pb="6px">
          <TahseelLogo />
        </Box>
        <Box borderBottom="1.5px solid" borderColor="#111" mb="8px" />

        <Text textAlign="center" fontSize="15px" fontWeight="700" mb="6px">
          حكومة الشارقة
        </Text>
        <Flex justify="space-between" textAlign="center" fontSize="12px" fontWeight="600" lineHeight="1.7" mb="2px">
          <Box flex="1">
            <Text>هيئة الطرق والمواصلات</Text>
            <Text>نظام التعرفة المرورية للشاحنات</Text>
          </Box>
          <Box flex="1">
            <Text>دائرة المالية المركزية</Text>
            <Text>نظام الدفع الرقمي تحصيل</Text>
          </Box>
        </Flex>
        <Text textAlign="center" fontSize="12px" fontWeight="700" mb="8px">
          بوابة الزبير
        </Text>

        <Box borderBottom="1.5px solid" borderColor="#111" mb="8px" />

        <Text dir="ltr" textAlign="center" fontSize="14px" fontWeight="700" mb="2px">
          (Payment Receipt)
        </Text>
        <Text textAlign="center" fontSize="13.5px" mb="3px">
          Tax invoice / فاتورة ضريبية
        </Text>
        <Text dir="ltr" textAlign="center" fontSize="13.5px" mb="8px">
          TRN: {r.trn}
        </Text>

        <Flex justify="center" gap="14px" fontSize="13.5px" mb="2px" wrap="wrap">
          <Text whiteSpace="nowrap">
            تاريخ العبور : {date}
          </Text>
          <Text whiteSpace="nowrap">
            الوقت : {formatTime(r)}
          </Text>
        </Flex>

        <DetailRow label="رقم الإيصال" value={r.receiptNumber} strong />
        <DetailRow label="نوع الخدمة" value={r.service} />
        <DetailRow label="اسم المالك" value={r.owner} />

        <Flex justify="space-between" align="baseline" dir="rtl" fontSize="14px" lineHeight="1.7" px="2px">
          <Text>
            رقم المركبة : {vehicle.number}
          </Text>
          <Text dir="ltr">{vehicle.code}</Text>
        </Flex>

        <Flex justify="space-between" align="baseline" dir="rtl" fontSize="14px" lineHeight="1.7" px="2px" mb="4px">
          <Text>
            إجمالي المبلغ : {formatMoney(r.amount)}
          </Text>
          <Text>درهم</Text>
        </Flex>

        <Text textAlign="right" fontWeight="700" fontSize="14px" mt="6px" mb="2px">
          رسوم أخرى :
        </Text>
        <FeeRow label="دعم الأبحاث العلمية في إمارة الشارقة" value={r.researchFee} />
        <FeeRow label="رسم خدمة تحصيل" value={r.collectionFee} />
        <FeeRow label="رسم ضريبة القيمة المضافة" value={r.vatFee} />

        <Text textAlign="right" fontSize="14px" mt="4px" mb="10px">
          اسم المستخدم : {r.tollGate || ""}
        </Text>

        <Text textAlign="center" fontSize="12px" mb="14px">
          <Text as="span" fontWeight="700">
            ملاحظة :
          </Text>{" "}
          يرجى الإحتفاظ بإيصال تحصيل لدواعي أمنية
        </Text>

        <Flex dir="ltr" justify="center" position="relative">
          <Box position="relative" w="148px" h="148px">
            <QRCodeSVG value={qrValue} size={148} level="H" includeMargin={false} bgColor="#ffffff" fgColor="#111111" />
            <Flex
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              px="4px"
              py="3px"
              align="center"
              justify="center"
            >
              <TahseelLogo size="sm" />
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
}
