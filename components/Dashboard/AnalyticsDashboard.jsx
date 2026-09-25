"use client";

import { useState } from "react";
import {
  Box,
  chakra,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";

const Svg = chakra("svg");
const Rect = chakra("rect");
const Line = chakra("line");
const Path = chakra("path");
const Circle = chakra("circle");
const SvgText = chakra("text");
const G = chakra("g");

const cardProps = {
  bg: "white",
  borderRadius: "4px",
  boxShadow: "0 1px 4px rgba(0,0,0,.06)",
};

function MiniBars({ bars }) {
  const max = Math.max(...bars);
  return (
    <HStack spacing="3px" align="flex-end" h="22px">
      {bars.map((value, index) => (
        <Box key={index} w="5px" h={`${(value / max) * 22}px`} bg="#2cabe3" borderRadius="1px" />
      ))}
    </HStack>
  );
}

function StatCard({ value, label, percent, color }) {
  return (
    <Flex {...cardProps} px="22px" py="22px" align="center" justify="space-between" minH="118px">
      <Box>
        <Text fontSize="28px" fontWeight="400" color="#546e7a" lineHeight="1.1">
          {value}
        </Text>
        <Text fontSize="14px" color="#90a4ae" mt="4px">
          {label}
        </Text>
      </Box>
      <CircularProgress
        value={percent}
        size="78px"
        thickness="8px"
        color={color}
        trackColor="#eef2f4"
        capIsRound
      >
        <CircularProgressLabel fontSize="13px" color="#90a4ae" fontWeight="500">
          {percent}%
        </CircularProgressLabel>
      </CircularProgress>
    </Flex>
  );
}

function SalesOverview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const pixel = [8.6, 4.7, 2.9, 6.7, 4.1, 9.7];
  const ample = [5.5, 3.2, 8.5, 5.2, 3.9, 5.5];
  const max = 12.5;
  const w = 420;
  const h = 230;
  const padL = 36;
  const padR = 12;
  const padT = 10;
  const padB = 28;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const groupW = chartW / days.length;
  const barW = 14;
  const yTicks = [12.5, 10, 7.5, 5, 2.5, 0];

  return (
    <Box {...cardProps} p="22px" h="full">
      <Heading as="h3" fontSize="18px" fontWeight="600" color="#455a64">
        Sales Overview
      </Heading>
      <Text fontSize="13px" color="#90a4ae" mb="10px">
        Ample Admin Vs Pixel Admin
      </Text>
      <Svg viewBox={`0 0 ${w} ${h}`} w="full" h="230px">
        {yTicks.map((tick) => {
          const y = padT + (1 - tick / max) * chartH;
          return (
            <G key={tick}>
              <Line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#edf1f4" strokeWidth="1" />
              <SvgText x={padL - 6} y={y + 4} fontSize="11" fill="#b0bec5" textAnchor="end">
                {tick}
              </SvgText>
            </G>
          );
        })}
        {days.map((day, i) => {
          const cx = padL + groupW * i + groupW / 2;
          const pixelH = (pixel[i] / max) * chartH;
          const ampleH = (ample[i] / max) * chartH;
          return (
            <G key={day}>
              <Rect x={cx - barW - 2} y={padT + chartH - pixelH} width={barW} height={pixelH} fill="#2962ff" />
              <Rect x={cx + 2} y={padT + chartH - ampleH} width={barW} height={ampleH} fill="#26c6da" />
              <SvgText x={cx} y={h - 8} fontSize="12" fill="#90a4ae" textAnchor="middle">
                {day}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <HStack justify="center" spacing="22px" mt="4px">
        <HStack spacing="8px">
          <Box w="10px" h="10px" borderRadius="full" bg="#26c6da" />
          <Text fontSize="13px" color="#78909c">
            Ample
          </Text>
        </HStack>
        <HStack spacing="8px">
          <Box w="10px" h="10px" borderRadius="full" bg="#2962ff" />
          <Text fontSize="13px" color="#78909c">
            Pixel
          </Text>
        </HStack>
      </HStack>
    </Box>
  );
}

function curvePath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function NewsletterCampaign() {
  const openRate = [2, 4.8, 5.2, 8, 24.8, 8.2, 7, 23.5];
  const recurring = [2, 0.8, 0.9, 3.2, 7.2, 1.8, 4.8, 1.5];
  const max = 30;
  const w = 420;
  const h = 230;
  const padL = 32;
  const padR = 16;
  const padT = 10;
  const padB = 28;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const yTicks = [30, 25, 20, 15, 10, 5, 0];
  const toX = (i) => padL + (i / 7) * chartW;
  const toY = (v) => padT + (1 - v / max) * chartH;
  const openPts = openRate.map((v, i) => [toX(i), toY(v)]);
  const recPts = recurring.map((v, i) => [toX(i), toY(v)]);
  const openLine = curvePath(openPts);
  const recLine = curvePath(recPts);
  const area = `${openLine} L ${toX(7)} ${padT + chartH} L ${toX(0)} ${padT + chartH} Z`;

  return (
    <Box {...cardProps} p="22px" h="full">
      <Heading as="h3" fontSize="18px" fontWeight="600" color="#455a64">
        Newsletter Campaign
      </Heading>
      <Text fontSize="13px" color="#90a4ae" mb="10px">
        Overview of Newsletter Campaign
      </Text>
      <Svg viewBox={`0 0 ${w} ${h}`} w="full" h="230px">
        {yTicks.map((tick) => {
          const y = toY(tick);
          return (
            <G key={tick}>
              <Line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#edf1f4" strokeWidth="1" />
              <SvgText x={padL - 6} y={y + 4} fontSize="11" fill="#b0bec5" textAnchor="end">
                {tick === 0 ? "0k" : `${tick}k`}
              </SvgText>
            </G>
          );
        })}
        {Array.from({ length: 8 }, (_, i) => (
          <G key={i}>
            <Line x1={toX(i)} y1={padT} x2={toX(i)} y2={padT + chartH} stroke="#f3f6f8" strokeWidth="1" />
            <SvgText x={toX(i)} y={h - 8} fontSize="12" fill="#90a4ae" textAnchor="middle">
              {i + 1}
            </SvgText>
          </G>
        ))}
        <Path d={area} fill="rgba(38, 198, 218, 0.22)" />
        <Path d={openLine} fill="none" stroke="#26c6da" strokeWidth="2.5" />
        <Path d={recLine} fill="none" stroke="#3d5afe" strokeWidth="2.5" />
        {openPts.map((pt, i) => (
          <Circle key={`o-${i}`} cx={pt[0]} cy={pt[1]} r="3.5" fill="#26c6da" />
        ))}
        {recPts.map((pt, i) => (
          <Circle key={`r-${i}`} cx={pt[0]} cy={pt[1]} r="3.5" fill="#3d5afe" />
        ))}
      </Svg>
      <HStack justify="center" spacing="22px" mt="4px">
        <HStack spacing="8px">
          <Box w="10px" h="10px" borderRadius="full" bg="#26c6da" />
          <Text fontSize="13px" color="#78909c">
            Open Rate
          </Text>
        </HStack>
        <HStack spacing="8px">
          <Box w="10px" h="10px" borderRadius="full" bg="#3d5afe" />
          <Text fontSize="13px" color="#78909c">
            Recurring
          </Text>
        </HStack>
      </HStack>
    </Box>
  );
}

const US_OUTLINE =
  "M118 198 L112 168 L120 132 L138 108 L168 96 L198 102 L208 128 L218 168 L210 214 L198 252 L188 286 L206 302 L238 292 L268 304 L292 338 L328 372 L352 412 L378 428 L402 406 L428 388 L458 372 L488 380 L518 366 L542 382 L568 428 L586 468 L566 482 L542 446 L526 398 L540 356 L566 324 L592 278 L612 238 L628 208 L650 184 L668 152 L662 122 L684 102 L668 90 L640 98 L614 92 L588 108 L558 96 L522 108 L486 96 L444 104 L402 90 L356 98 L308 88 L258 98 L212 90 L176 108 L148 138 L128 168 Z";

const US_BORDERS = [
  "M198 102 L210 214 L188 286",
  "M218 168 L268 176 L292 338",
  "M268 176 L356 168 L352 250 L328 372",
  "M356 168 L444 160 L428 250 L402 406",
  "M444 160 L522 150 L518 250 L458 372",
  "M522 150 L614 148 L612 238 L542 382",
  "M176 200 L308 210 L356 220 L444 215 L522 210 L588 200",
  "M210 250 L328 260 L428 255 L518 250 L592 245",
  "M188 286 L292 300 L352 310 L428 300 L518 290",
  "M402 90 L402 200",
  "M308 88 L308 250",
  "M486 96 L486 215",
  "M258 98 L258 210",
];

const LAKES = [
  "M540 118 C558 112, 580 122, 576 142 C560 150, 538 144, 540 118 Z",
  "M568 148 C586 146, 598 162, 588 176 C572 180, 560 166, 568 148 Z",
  "M600 128 C618 124, 628 140, 618 152 C606 154, 596 140, 600 128 Z",
];

function VisitorsMap() {
  const [zoom, setZoom] = useState(1);
  return (
    <Box {...cardProps} p="22px" h="full">
      <Heading as="h3" fontSize="18px" fontWeight="600" color="#455a64">
        Current Visitors
      </Heading>
      <Text fontSize="13px" color="#90a4ae" mb="8px">
        Different Devices Used to Visit
      </Text>
      <Box position="relative" h="230px" overflow="hidden">
        <Flex direction="column" position="absolute" top="8px" left="8px" zIndex={2} border="1px solid" borderColor="#d7dee3" borderRadius="2px" overflow="hidden" bg="white">
          <IconButton
            aria-label="Zoom in"
            size="xs"
            h="22px"
            w="22px"
            minW="22px"
            borderRadius="0"
            bg="white"
            fontSize="14px"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
          >
            +
          </IconButton>
          <Box borderTop="1px solid" borderColor="#d7dee3" />
          <IconButton
            aria-label="Zoom out"
            size="xs"
            h="22px"
            w="22px"
            minW="22px"
            borderRadius="0"
            bg="white"
            fontSize="14px"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
          >
            −
          </IconButton>
        </Flex>
        <Svg viewBox="0 0 780 540" w="full" h="230px">
          <G transform={`translate(390 270) scale(${zoom}) translate(-390 -270)`}>
            <Path d={US_OUTLINE} fill="#c5ced6" stroke="#b7c2cb" strokeWidth="1.2" strokeLinejoin="round" />
            {US_BORDERS.map((d, i) => (
              <Path key={i} d={d} fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            ))}
            {LAKES.map((d, i) => (
              <Path key={i} d={d} fill="white" />
            ))}
            <Circle cx="200" cy="240" r="7" fill="#26c6da" stroke="white" strokeWidth="2" />
            <Circle cx="370" cy="280" r="7" fill="#ec407a" stroke="white" strokeWidth="2" />
            <Circle cx="640" cy="130" r="7" fill="#3d5afe" stroke="white" strokeWidth="2" />
          </G>
        </Svg>
      </Box>
      <HStack justify="center" spacing="22px" mt="8px">
        <HStack spacing="8px">
          <Box w="10px" h="10px" borderRadius="full" bg="#26c6da" />
          <Text fontSize="13px" color="#78909c">
            Valley
          </Text>
        </HStack>
        <HStack spacing="8px">
          <Box w="10px" h="10px" borderRadius="full" bg="#3d5afe" />
          <Text fontSize="13px" color="#78909c">
            Newyork
          </Text>
        </HStack>
        <HStack spacing="8px">
          <Box w="10px" h="10px" borderRadius="full" bg="#ec407a" />
          <Text fontSize="13px" color="#ec407a">
            Kansas
          </Text>
        </HStack>
      </HStack>
    </Box>
  );
}

export default function AnalyticsDashboard() {
  return (
    <Box bg="#eef6fa" minH="calc(100vh - 120px)" fontFamily="'Nunito Sans', 'Segoe UI', sans-serif">
      <Box px={{ base: 4, md: 8 }} py="28px" maxW="1320px" mx="auto">
        <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4} mb="22px">
          <Box>
            <Heading as="h1" fontSize="26px" fontWeight="500" color="#2cabe3" lineHeight="1.2">
              Dashboard
            </Heading>
            <HStack spacing="8px" fontSize="13px" mt="4px">
              <Text color="#90a4ae">Home</Text>
              <Text color="#c5d0d6">›</Text>
              <Text color="#2cabe3">Dashboard</Text>
            </HStack>
          </Box>
          <HStack spacing="28px">
            <HStack spacing="10px">
              <Box>
                <Text fontSize="11px" color="#90a4ae" letterSpacing="0.6px" textTransform="uppercase">
                  This Month
                </Text>
                <Text fontSize="18px" color="#546e7a" fontWeight="500">
                  58,356
                </Text>
              </Box>
              <MiniBars bars={[8, 12, 10, 16]} />
            </HStack>
            <HStack spacing="10px">
              <Box>
                <Text fontSize="11px" color="#90a4ae" letterSpacing="0.6px" textTransform="uppercase">
                  Last Month
                </Text>
                <Text fontSize="18px" color="#546e7a" fontWeight="500">
                  48,356
                </Text>
              </Box>
              <MiniBars bars={[6, 9, 11, 10, 15]} />
            </HStack>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing="18px" mb="18px">
          <StatCard value="324" label="New Clients" percent={20} color="#2cabe3" />
          <StatCard value="2376" label="Total Visits" percent={30} color="#26c6da" />
          <StatCard value="1795" label="New Leads" percent={40} color="#7e57c2" />
          <StatCard value="36870" label="Page Views" percent={60} color="#ec407a" />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="18px">
          <SalesOverview />
          <NewsletterCampaign />
          <VisitorsMap />
        </SimpleGrid>
      </Box>
    </Box>
  );
}
