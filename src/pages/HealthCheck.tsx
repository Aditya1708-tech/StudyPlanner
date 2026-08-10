import React, { useEffect, useState } from "react";
import { logger } from "../utils/logger";

interface TodoData {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const HealthCheck: React.FC = () => {
  const [data, setData] = useState<TodoData | null>(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos/1")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => logger.error(String(err)));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-xl w-full rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold mb-4 font-heading">Health Check</h1>
        <p className="text-slate-300 mb-4 text-sm font-semibold">
          This page verifies that the application can fetch external data.
        </p>

        {data ? (
          <pre className="overflow-auto rounded-xl bg-black/30 p-4 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <p className="text-sm font-semibold">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default HealthCheck;
