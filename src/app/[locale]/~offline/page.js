export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-bold">You are offline</h1>
      <p className="mt-4 text-lg text-gray-400">
        LUaid.org will reconnect automatically when your internet is restored.
        Previously viewed data is still available.
      </p>
    </main>
  );
}
