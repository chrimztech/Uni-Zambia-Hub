import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getApiBaseUrl } from "@/lib/api";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const response = await fetch(`${getApiBaseUrl()}/api/public/sitemap`);
        const xml = await response.text();
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});