"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/settingContext";

const Background = dynamic(() => import("./Background"), { ssr: false });

/**
 * The enhanced 3D background is an arcade-only effect — it never renders on
 * the landing page, auth screens or settings.
 */
export default function EnhancedBackground() {
  const { enhancedGraphics } = useSettings();
  const pathname = usePathname();

  const onArcade = pathname === "/arcade" || (pathname?.startsWith("/arcade/") ?? false);
  if (!enhancedGraphics || !onArcade) return null;

  return <Background />;
}
