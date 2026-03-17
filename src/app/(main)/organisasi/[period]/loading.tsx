export default function OrganisasiLoading() {
  return (
    <div className="w-full px-4 animate-pulse pt-8 pb-20">
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
        <div className="h-12 w-64 bg-gray-200 rounded-xl" />
        <div className="h-5 w-96 max-w-full bg-gray-100 rounded" />
      </div>

      <div className="space-y-12 max-w-5xl mx-auto">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-6">
            <div className="h-8 w-48 bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-28 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center p-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full shrink-0" />
                  <div className="ml-4 space-y-2 flex-1">
                    <div className="h-5 w-3/4 bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
