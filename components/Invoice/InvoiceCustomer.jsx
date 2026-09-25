import { Table, Tbody, Td, Tr } from "@chakra-ui/react";

function Row({ label, value }) {
  return (
    <Tr>
      <Td fontWeight="600" py={1} px={2}>
        {label}
      </Td>
      <Td py={1} px={2}>
        {value || "-"}
      </Td>
    </Tr>
  );
}

export default function InvoiceCustomer({ invoiceNumber, invoiceDate, customer }) {
  return (
    <Table size="sm" variant="simple" mb={4}>
      <Tbody>
        <Row label="Invoice No." value={invoiceNumber} />
        <Row label="Invoice Date" value={invoiceDate} />
        <Row label="Customer Name" value={customer?.name} />
        <Row label="Phone" value={customer?.phone} />
        <Row label="Address" value={customer?.address} />
      </Tbody>
    </Table>
  );
}
