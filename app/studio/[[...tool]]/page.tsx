import type { Metadata } from "next";
import StudioClient from "./StudioClient";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ tool: [] }];
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <StudioClient />;
}
