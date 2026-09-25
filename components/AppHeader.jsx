"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Box,
  Flex,
  HStack,
  Icon,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { FaRegSnowflake } from "react-icons/fa";
import { MdOutlineCloud } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function AppHeader() {
  const path = usePathname();
  if (path === "/login") return null;

  const dashActive = path === "/dashboard";
  const formsActive = path.startsWith("/invoices");
  const navLink = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "500",
    color: active ? "#2cabe3" : "#90a4ae",
    _hover: { textDecoration: "none", color: active ? "#2cabe3" : "#607d8b" },
  });
  const menuItem = {
    display: "block",
    w: "full",
    px: "18px",
    py: "10px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#5b7a8a",
    _hover: { bg: "#eff8fa", color: "#2cabe3", textDecoration: "none" },
  };

  return (
    <Box as="header" bg="white" position="relative" zIndex={5} sx={{ "@media print": { display: "none !important" } }}>
      <Flex h="64px" align="center" justify="center" bg="#2196F3" color="white" position="relative">
        <HStack spacing="10px">
          <Icon as={FaRegSnowflake} boxSize="26px" />
          <HStack spacing="6px" align="baseline">
            <Text fontSize="20px" fontWeight="500">
              Tahseel
            </Text>
            <Text fontSize="22px" fontWeight="500">
              تحصيل
            </Text>
          </HStack>
        </HStack>
        <Avatar
          position="absolute"
          right={{ base: "16px", md: "40px" }}
          size="sm"
          name="User"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96"
        />
      </Flex>
      <Flex bg="white" h="56px" align="center" borderBottom="1px solid" borderColor="#eef3f6" px={{ base: 5, md: "72px" }}>
        <HStack spacing="28px">
          <Link as={NextLink} href="/dashboard" {...navLink(dashActive)}>
            <Icon as={MdOutlineCloud} boxSize="20px" />
            Dashboard
          </Link>
          <Popover trigger="hover" placement="bottom-start" gutter={8} openDelay={0} closeDelay={150}>
            <PopoverTrigger>
              <Link as={NextLink} href="/invoices/new" {...navLink(formsActive)}>
                <Icon as={HiOutlineDocumentText} boxSize="18px" />
                Forms
              </Link>
            </PopoverTrigger>
            <PopoverContent w="210px" borderColor="#d7e2e8" boxShadow="0 8px 20px rgba(0,0,0,.12)" _focus={{ outline: "none" }}>
              <PopoverBody p={0}>
                <Link as={NextLink} href="/invoices/new" {...menuItem}>
                  Receipt Generate
                </Link>
                <Link as={NextLink} href="/invoices" {...menuItem}>
                  Receipts List
                </Link>
                <Box as="button" type="button" textAlign="left" border={0} bg="white" {...menuItem}>
                  Owner Name
                </Box>
                <Box as="button" type="button" textAlign="left" border={0} bg="white" {...menuItem}>
                  Delete Records
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </HStack>
      </Flex>
    </Box>
  );
}
