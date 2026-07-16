"use client";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-bold text-neutral-800">Terjadi Kesalahan</h2>
      <p className="text-neutral-500 text-center max-w-md">
        {error.message || "Terjadi kesalahan yang tidak terduga."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary-400 px-6 py-2 text-white font-medium hover:bg-primary-500 transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}
