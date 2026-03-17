export default function MembersLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded-full" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded-full" />
        <div className="h-4 w-28 bg-gray-200 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-9 w-36 bg-gray-200 rounded-xl" />
          </div>
          <div className="rounded-2xl bg-white/50 border border-white/30 overflow-hidden shadow-sm">
            <div className="bg-white/30 border-b border-white/20 px-4 py-3 flex gap-8">
              {["w-24", "w-16", "w-28", "w-12"].map((w, i) => (
                <div key={i} className={`h-4 ${w} bg-gray-200 rounded`} />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-6 border-b border-white/10">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-40 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-7 w-28 bg-gray-200 rounded-lg" />
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                <div className="flex gap-1">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg" />
                  <div className="w-7 h-7 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-white/60 border border-white/40 p-4 space-y-3">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-9 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
