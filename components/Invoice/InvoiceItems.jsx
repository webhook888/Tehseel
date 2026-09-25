import { Box, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";

export default function InvoiceItems({ items = [] }) {
  return (
    <Box mb={4}>
      <Text fontWeight="600" mb={2}>
        Items / Services
      </Text>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Description</Th>
            <Th isNumeric>Qty</Th>
            <Th isNumeric>Price</Th>
            <Th isNumeric>Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => (
            <Tr key={item.id}>
              <Td>{item.name}</Td>
              <Td isNumeric>{item.quantity}</Td>
              <Td isNumeric>{Number(item.price).toFixed(2)}</Td>
              <Td isNumeric>{Number(item.total).toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
