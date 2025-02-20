'use client';

interface Contribution {
  id: string;
  date: string;
  contributor: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

interface ContributionHistoryProps {
  contributions: Contribution[];
}

export function ContributionHistory({ contributions }: ContributionHistoryProps) {
  if (!contributions.length) {
    return (
      <div className="text-center py-6 text-gray-500">
        No contributions yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contributor
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {contributions.map((contribution) => (
            <tr key={contribution.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(contribution.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {contribution.contributor}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {contribution.amount.toLocaleString()} USDC
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    contribution.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : contribution.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {contribution.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 