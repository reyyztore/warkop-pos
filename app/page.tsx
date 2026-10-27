export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-2xl font-bold text-emerald-600 mb-2">Warung Kopi Kita</h1>
      <p className="text-gray-600 mb-6 text-sm">Sistem Pemesanan Realtime PWA</p>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 w-full">
        <p className="text-xs text-emerald-800 font-medium">Status Sistem: Siap Terhubung ke Supabase</p>
      </div>
    </div>
  );
}
