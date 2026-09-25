"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { generateId } from "@/lib/id";
import { lineItemTotalCents, fromCents } from "@/lib/calculations";

export default function ItemsFieldArray({ items, onChange, errors = {} }) {
  const updateItem = (id, field, value) => {
    onChange(
      items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const addItem = () => {
    onChange([
      ...items,
      { id: generateId("item"), name: "", quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id) => {
    onChange(items.filter((it) => it.id !== id));
  };

  return (
    <Box>
      <FormLabel mb={2}>Products / Services</FormLabel>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Description</Th>
            <Th isNumeric>Qty</Th>
            <Th isNumeric>Unit Price</Th>
            <Th isNumeric>Total</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => {
            const total = fromCents(
              lineItemTotalCents(item.quantity, item.price)
            );
            return (
              <Tr key={item.id}>
                <Td minW="180px">
                  <Input
                    size="sm"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      updateItem(item.id, "name", e.target.value)
                    }
                  />
                </Td>
                <Td>
                  <Input
                    size="sm"
                    type="number"
                    min={0}
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", e.target.value)
                    }
                  />
                </Td>
                <Td>
                  <Input
                    size="sm"
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(item.id, "price", e.target.value)
                    }
                  />
                </Td>
                <Td isNumeric>{total.toFixed(2)}</Td>
                <Td>
                  <IconButton
                    aria-label="Remove item"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeItem(item.id)}
                    isDisabled={items.length === 1}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      {errors.items && (
        <Text color="red.500" fontSize="sm" mt={1}>
          {errors.items}
        </Text>
      )}

      <Button
        mt={3}
        size="sm"
        leftIcon={<AddIcon />}
        onClick={addItem}
        variant="outline"
      >
        Add Item
      </Button>
    </Box>
  );
}
