import { useEffect, useState } from "react";

type HealthStatus = { status: string };

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthStatus) => setHealth(data))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>InvestHub</h1>
      {error && <p style={{ color: "crimson" }}>API error: {error}</p>}
      {!error && !health && <p>Checking API connection…</p>}
      {health && <p>API status: {health.status}</p>}
    </main>
  );
}

export default App;
