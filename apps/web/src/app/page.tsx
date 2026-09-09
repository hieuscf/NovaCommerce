export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>NovaCommerce Web</h1>
      <p>API Gateway: {apiUrl}</p>
    </main>
  );
}
