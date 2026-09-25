"use client";

import { Box, Flex } from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import TahseelLogo from "./TahseelLogo";

export default function InvoiceQRCode({ payload, size = 148 }) {
  if (!payload) return null;
  return (
    <Flex justify="center" position="relative">
      <Box position="relative" w={`${size}px`} h={`${size}px`}>
        <QRCodeSVG value={payload} size={size} level="H" includeMargin={false} />
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="white"
          px="4px"
          py="3px"
        >
          <TahseelLogo size="sm" />
        </Flex>
      </Box>
    </Flex>
  );
}
