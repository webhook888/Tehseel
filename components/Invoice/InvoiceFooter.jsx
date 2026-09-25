import { Box, Divider, Text } from "@chakra-ui/react";
import InvoiceQRCode from "./InvoiceQRCode";

export default function InvoiceFooter({ qrPayload, note }) {
  return (
    <Box>
      <Divider borderColor="gray.400" my={3} />
      {note && (
        <Text fontSize="sm" mb={3}>
          {note}
        </Text>
      )}
      <InvoiceQRCode payload={qrPayload} size={96} />
    </Box>
  );
}
