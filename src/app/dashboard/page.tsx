export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <p className="text-gray-600 dark:text-gray-300">Welcome to your dashboard</p>
          </div>
          <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-600 dark:text-gray-300">View your analytics here</p>
          </div>
          <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600 dark:text-gray-300">Manage your settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
