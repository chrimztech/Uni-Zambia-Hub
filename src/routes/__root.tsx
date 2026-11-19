import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw, Search, WifiOff } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, color-mix(in srgb, #01862b 6%, white) 0%, #ffffff 60%)" }}
    >
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-success-soft">
          <img src="/logo.png" alt="UNZA" className="h-10 w-10 object-contain" />
        </div>

        {/* Big 404 */}
        <div
          className="text-[7rem] font-black leading-none tracking-tighter"
          style={{ color: "oklch(0.42 0.13 148)" }}
        >
          404
        </div>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-3 text-base text-gray-500 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
            style={{ background: "oklch(0.42 0.13 148)" }}
          >
            <Home className="h-4 w-4" />
            Return home
          </Link>
          <Link
            to="/library"
            search={{ q: "", type: "all", category: "", department: "", page: 0 }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Search className="h-4 w-4" />
            Browse library
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-400">University of Zambia · Sanitation Hub</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("[Route Error]", error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const isOffline =
    "isNetworkError" in error && (error as { isNetworkError: boolean }).isNetworkError;
  const isTimeout = error.message.includes("timed out");

  const title = isOffline
    ? "No internet connection"
    : isTimeout
      ? "Request timed out"
      : "Something went wrong";

  const description = isOffline
    ? "Please check your internet connection and try again."
    : isTimeout
      ? "The server took too long to respond. Please try again."
      : "An unexpected error occurred. Our team has been notified.";

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #fef2f2 0%, #ffffff 60%)" }}
    >
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          {isOffline ? (
            <WifiOff className="h-8 w-8 text-red-500" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-red-500" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 text-base text-gray-500 leading-relaxed">{description}</p>

        {/* Collapsible error detail */}
        {!isOffline && (
          <details className="mt-4 rounded-lg border border-gray-100 bg-gray-50 text-left">
            <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-gray-400 hover:text-gray-600">
              Error details
            </summary>
            <pre className="overflow-auto px-4 pb-3 text-xs text-gray-600 whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
            style={{ background: "oklch(0.42 0.13 148)" }}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            Return home
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-400">University of Zambia · Sanitation Hub</p>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "UNZA Sanitation Hub — Knowledge & Research Platform" },
      {
        name: "description",
        content:
          "University of Zambia platform for sanitation research, policy, training, monitoring and field-tested solutions.",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/logo.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
