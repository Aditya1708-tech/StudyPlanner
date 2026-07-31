import { useEffect, useState } from "react";

export default function HealthCheck() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos/1")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-xl w-full rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold mb-4">Health Check</h1>
        <p className="text-slate-300 mb-4">
          This page verifies that the application can fetch external data.
        </p>

        {data ? (
          <pre className="overflow-auto rounded-xl bg-black/30 p-4 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}