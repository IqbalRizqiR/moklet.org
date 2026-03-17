export default function UsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 bg-gray-200 rounded" />
        <div className="h-9 w-32 bg-gray-200 rounded-xl" />
      </div>
      <div className="rounded-2xl bg-white/50 border border-white/30 overflow-hidden shadow-sm">
        <div className="bg-white/30 border-b border-white/20 px-4 py-3 flex gap-8">
          {["w-12", "w-24", "w-32", "w-16", "w-16"].map((w, i) => (
            <div key={i} className={`h-4 ${w} bg-gray-200 rounded`} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-6 border-b border-white/10">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="h-4 w-36 bg-gray-200 rounded flex-1" />
            <div className="h-4 w-44 bg-gray-100 rounded flex-1" />
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
            <div className="flex gap-1">
              <div className="w-7 h-7 bg-gray-100 rounded-lg" />
              <div className="w-7 h-7 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
