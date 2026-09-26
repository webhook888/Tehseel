"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";

const Svg = chakra("svg");
const Polygon = chakra("polygon");
const Line = chakra("line");

export function SnowflakeMark({ size = 52 }) {
  const petals = [0, 60, 120, 180, 240, 300];
  return (
    <Svg viewBox="0 0 100 100" w={`${size}px`} h={`${size}px`} flexShrink={0}>
      {petals.map((deg) => (
        <Polygon
          key={deg}
          points="50,5 59,29 50,38 41,29"
          fill="none"
          stroke="#111"
          strokeWidth="1.7"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <Polygon points="50,30 67,40 67,60 50,70 33,60 33,40" fill="none" stroke="#111" strokeWidth="1.7" />
      {petals.map((deg) => (
        <Line
          key={`spoke-${deg}`}
          x1="50"
          y1="38"
          x2="50"
          y2="30"
          stroke="#111"
          strokeWidth="1.5"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <Polygon points="50,42 57,46.2 57,53.8 50,58 43,53.8 43,46.2" fill="#111" />
    </Svg>
  );
}

export default function TahseelLogo({ size = "md" }) {
  const compact = size === "sm";
  return (
    <Flex dir="ltr" align="center" justify="center" gap={compact ? "4px" : "8px"}>
      <Box lineHeight="0.92" textAlign="left">
        <Text
          fontFamily="Tahoma, Arial, sans-serif"
          fontSize={compact ? "13px" : "30px"}
          fontWeight="600"
          color="#111"
          dir="rtl"
        >
          تحصيل
        </Text>
        <Text fontSize={compact ? "11px" : "22px"} fontWeight="500" color="#111" letterSpacing="0.2px">
          Tahseel
        </Text>
      </Box>
      <SnowflakeMark size={compact ? 28 : 54} />
    </Flex>
  );
}
