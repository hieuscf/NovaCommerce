'use client';

export default function AdminGlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#F7F9FC', color: '#0B1F3A' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: '#64748B', marginBottom: 24 }}>
              We could not load the admin console. Please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#4F46E5',
                color: '#fff',
                border: 0,
                borderRadius: 12,
                padding: '12px 20px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
