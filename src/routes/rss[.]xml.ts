import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getApiBaseUrl } from "@/lib/api";


export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const response = await fetch(`${getApiBaseUrl()}/api/public/rss`);
        const xml = await response.text();
        /*
    <title>UBIRR — UNZA Biosafety Repository</title>
    <link>${BASE_URL}/</link>
    <description>Latest resources published in the University of Zambia Biosafety Information &amp; Resource Repository.</description>
    <language>en</language>${items}
  </channel>
</rss>`;
        */
        return new Response(xml, { headers: { "Content-Type": "application/rss+xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
