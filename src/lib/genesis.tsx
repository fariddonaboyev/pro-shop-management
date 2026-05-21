import * as React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

// Stub types for standalone build (removed @taskade/parade-shared dependency)
type LogFunction = (entry: any) => void;

interface GenesisLogger {
log: LogFunction;
}
declare global {
interface Window {
__TASKADE_APP_LIFECYCLE_LOGGER__?: GenesisLogger;
}
}

export function getGenesisAppLifecycleLogger(): GenesisLogger | null {
if (typeof window === "undefined") {
return null;
}
return window.__TASKADE_APP_LIFECYCLE_LOGGER__ ?? null;
}

export function reportGenesisError(
code: "error.boundary",
error: unknown,
componentStack?: string | null,
) {
getGenesisAppLifecycleLogger()?.log({
level: "error",
message: "Runtime Error",
data: {
code,
message: error instanceof Error ? error.message : String(error),
stack: [error instanceof Error ? error.stack : undefined, componentStack]
.filter(Boolean)
.join("\n"),
},
});
}

function ErrorFallback({
error,
resetErrorBoundary,
}: {
error: Error;
resetErrorBoundary: () => void;
}) {
return (
<div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: 600, margin: "0 auto" }}>
<h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem" }}>Something went wrong</h2>
<p style={{ color: "#999", margin: "0 0 1rem", fontSize: "0.95rem" }}>
The app encountered an error. You can try again, or refresh the page.
</p>
<pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", overflow: "auto", fontSize: "0.8rem", color: "#dc2626", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
{String(error)}
</pre>
<button type="button" onClick={resetErrorBoundary} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#1f2937", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem" }}>
Try again
</button>
</div>
);
}

export function GenesisRoot({ children }: { children: React.ReactNode }) {
return (
<ReactErrorBoundary
FallbackComponent={ErrorFallback}
onError={(error, info) => {
console.error("[Genesis] Uncaught render error:", error, info);
reportGenesisError("error.boundary", error, info.componentStack);
}}
onReset={() => {
console.info("[Genesis] User reset error boundary");
}}
>
{children}
</ReactErrorBoundary>
);
}

