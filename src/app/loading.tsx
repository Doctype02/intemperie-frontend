export default function Loading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    </main>
  );
}
