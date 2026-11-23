import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/listen")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleListen } = await import("@/lib/rcforb/listen-handler.server");
        return handleListen(request);
      },
    },
  },
});
