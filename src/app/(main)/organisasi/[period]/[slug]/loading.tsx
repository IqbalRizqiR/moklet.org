export default function OrganisasiDetailLoading() {
  return (
    <div className="w-full animate-pulse pb-20">
      {/* Overview Block */}
      <div className="w-full bg-white rounded-t-3xl border-b shadow-sm pt-8 pb-12 px-4 mb-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full shrink-0 border-4 border-white shadow-sm" />
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="h-10 w-64 bg-gray-200 rounded-xl mx-auto md:mx-0" />
            <div className="h-6 w-32 bg-gray-100 rounded-full mx-auto md:mx-0" />
            <div className="space-y-2 mt-4">
              <div className="h-4 w-full max-w-2xl bg-gray-200 rounded" />
              <div className="h-4 w-5/6 max-w-2xl bg-gray-200 rounded" />
              <div className="h-4 w-4/6 max-w-2xl bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Block */}
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="h-64 md:h-96 w-full bg-gray-200 rounded-3xl" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded-lg" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-full bg-gray-100 rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-40 bg-gray-200 rounded-lg" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-white border rounded-xl">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
