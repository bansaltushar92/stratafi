export default function ExchangesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Exchanges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coinbase Card */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
                  🪙
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Coinbase</h3>
                  <p className="text-sm text-gray-500">Not connected</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                Connect
              </button>
            </div>
          </div>

          {/* Add more exchange cards here */}
          <div className="border rounded-lg p-6 border-dashed flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-2">
                +
              </div>
              <p className="text-sm text-gray-500">More exchanges coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Accounts</h2>
        <div className="text-center text-gray-500 py-8">
          No accounts connected yet
        </div>
      </div>

      {/* Connection History */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Connection History</h2>
        <div className="text-center text-gray-500 py-8">
          No connection history to show
        </div>
      </div>
    </div>
  );
} 