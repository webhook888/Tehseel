"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Segoe UI', system-ui, sans-serif`,
    body: `'Segoe UI', system-ui, sans-serif`,
  },
  colors: {
    brand: {
      50: "#e6f0ff",
      500: "#1a56db",
      600: "#1544ad",
    },
  },
  styles: {
    global: {
      html: { p: 0, m: 0 },
      body: { bg: "gray.50", p: 0, m: 0 },
      "*": { boxSizing: "border-box" },
      "@media print": {
        "@page": { size: "80mm auto", margin: 0 },
        "html, body": {
          bg: "white !important",
          m: "0 !important",
          p: "0 !important",
        },
        header: { display: "none !important" },
      },
    },
  },
});

export default function Providers({ children }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
