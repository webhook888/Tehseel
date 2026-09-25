import { Box, Divider, Heading, Text } from "@chakra-ui/react";

export default function InvoiceHeader({ companyName, orgLines = [] }) {
  return (
    <Box textAlign="center" mb={4}>
      <Heading as="h2" size="md">
        {companyName}
      </Heading>
      {orgLines.map((line, i) => (
        <Text key={i} fontSize="sm">
          {line}
        </Text>
      ))}
      <Divider my={3} borderColor="black" />
      <Heading as="h3" size="sm">
        Tax Invoice
      </Heading>
    </Box>
  );
}
