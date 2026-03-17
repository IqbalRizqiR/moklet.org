export default function BeritaLoading() {
  return (
    <div className="w-full px-4 animate-pulse pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="space-y-3">
          <div className="h-10 w-48 bg-gray-200 rounded-lg" />
          <div className="h-5 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-12 w-full md:w-72 bg-gray-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border shadow-sm">
            <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded-full" />
              <div className="h-6 w-full bg-gray-200 rounded" />
              <div className="h-6 w-2/3 bg-gray-200 rounded" />
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <div className="h-4 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
