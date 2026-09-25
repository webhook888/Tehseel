"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaUser } from "react-icons/fa";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Flex
      as="main"
      minH="100vh"
      align="center"
      justify="center"
      position="relative"
      overflow="hidden"
      bgImage='url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=85")'
      bgPos="center"
      bgSize="cover"
      bgRepeat="no-repeat"
      fontFamily="Arial, Helvetica, sans-serif"
    >
      <Box position="absolute" inset={0} bg="rgba(0,42,29,.16)" />
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(105deg, rgba(0,77,49,.58), rgba(193,135,122,.30) 49%, rgba(0,82,49,.57))"
      />
      <Box
        as="form"
        onSubmit={login}
        position="relative"
        zIndex={1}
        w={{ base: "calc(100vw - 36px)", sm: "420px" }}
        minH="374px"
        px={{ base: "28px", sm: "40px" }}
        pt="34px"
        pb="30px"
        border="2px solid"
        borderColor="whiteAlpha.300"
        borderRadius="11px"
        bg="rgba(66, 57, 50, .23)"
        boxShadow="0 8px 34px rgba(0,0,0,.17)"
        backdropFilter="blur(2px)"
        color="white"
      >
        <Heading as="h1" textAlign="center" mb="34px" fontSize="37px" lineHeight="1" fontWeight="800">
          Login
        </Heading>
        <InputGroup h="50px" mb="29px">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
            required
            h="50px"
            border="0"
            borderRadius="28px"
            bg="#ecf2ff"
            color="#111"
            fontSize="14px"
            pl="21px"
            pr="48px"
            _focus={{ boxShadow: "none" }}
          />
          <InputRightElement h="50px" color="black" fontSize="20px" pointerEvents="none">
            <FaUser />
          </InputRightElement>
        </InputGroup>
        <InputGroup h="50px" mb="29px">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
            required
            h="50px"
            border="0"
            borderRadius="28px"
            bg="#ecf2ff"
            color="#111"
            fontSize="14px"
            pl="21px"
            pr="48px"
            _focus={{ boxShadow: "none" }}
          />
          <InputRightElement h="50px" color="black" fontSize="20px" pointerEvents="none">
            <FaLock />
          </InputRightElement>
        </InputGroup>
        <Flex
          justify="space-between"
          align="center"
          fontSize={{ base: "12px", sm: "14px" }}
          fontWeight="600"
          mt="-12px"
          mb="18px"
        >
          <Checkbox
            isChecked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            color="white"
            size="sm"
            sx={{ ".chakra-checkbox__control": { w: "13px", h: "13px" } }}
          >
            Remember Me
          </Checkbox>
          <Button type="button" variant="link" color="white" fontSize="inherit" fontWeight="600">
            Forgot Your Password?
          </Button>
        </Flex>
        {error && (
          <Text mt="-5px" mb="11px" textAlign="center" color="white" fontSize="13px" fontWeight="700">
            {error}
          </Text>
        )}
        <Button
          type="submit"
          isLoading={loading}
          loadingText="Logging in…"
          h="47px"
          w="full"
          border="0"
          borderRadius="25px"
          bg="white"
          color="#3c3c3c"
          fontSize="20px"
          fontWeight="700"
          _hover={{ bg: "white" }}
          _disabled={{ opacity: 0.75, cursor: "wait" }}
        >
          Login
        </Button>
      </Box>
    </Flex>
  );
}
