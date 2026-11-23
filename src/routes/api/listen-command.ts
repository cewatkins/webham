import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/listen-command")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleListenCommand } = await import("@/lib/rcforb/listen-command.server");
        return handleListenCommand(request);
      },
    },
  },
});
