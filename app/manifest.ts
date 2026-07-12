import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = false;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Waleed Ahmed | Software Engineer & Product Builder",
    short_name: "Waleed Ahmed",
    description: "Crafting products people remember.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F4EE",
    theme_color: "#B76E56",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
