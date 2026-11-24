"use client";

import dynamic from "next/dynamic";
import { useSettings } from "@/context/settingContext";

const Background = dynamic(() => import("./Background"), { ssr: false });

export default function EnhancedBackground() {
  const { enhancedGraphics } = useSettings();
  return enhancedGraphics ? <Background /> : null;
}