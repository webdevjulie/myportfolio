import { useState } from 'react';

export default function ReactDemo() {
  const [count, setCount] = useState(0);

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 px-6 py-4 shadow-lg shadow-cyan-500/10">
      <p className="text-sm font-medium text-cyan-400">React is working</p>
      <p className="mt-2 text-sm text-slate-300">
        Click count: <span className="font-semibold text-white">{count}</span>
      </p>
      <button
        onClick={() => setCount((value) => value + 1)}
        className="mt-3 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
      >
        Increment
      </button>
    </div>
  );
}
