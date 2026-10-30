import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Amar Kumar, software engineer";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOgImage({
    eyebrow: "Software engineer · GEO research",
    title: "Building full-stack products and researching how brands get found in AI answers.",
    subtitle: "South Asian University, Delhi",
  });
}
