import { Box, Flex, Text } from "@chakra-ui/react";
import { formatMoney } from "@/lib/calculations";

export default function InvoiceTotals({
  subtotal,
  discount,
  tax,
  taxPercent,
  grandTotal,
  currency = "AED",
}) {
  return (
    <Box maxW="280px" ml="auto" mb={4}>
      <Flex justify="space-between" py={1}>
        <Text>Subtotal</Text>
        <Text>{formatMoney(subtotal, currency)}</Text>
      </Flex>
      <Flex justify="space-between" py={1}>
        <Text>Discount</Text>
        <Text>-{formatMoney(discount, currency)}</Text>
      </Flex>
      <Flex justify="space-between" py={1}>
        <Text>VAT ({taxPercent || 0}%)</Text>
        <Text>{formatMoney(tax, currency)}</Text>
      </Flex>
      <Flex justify="space-between" py={1} fontWeight="700">
        <Text>Grand Total</Text>
        <Text>{formatMoney(grandTotal, currency)}</Text>
      </Flex>
    </Box>
  );
}
