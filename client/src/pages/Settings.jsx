import Card from '../components/common/Card'

export default function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <Card.Header>
            <h2 className="font-semibold">Application Info</h2>
          </Card.Header>
          <Card.Body className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Environment</span>
              <span className="font-medium">{import.meta.env.MODE}</span>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="font-semibold">Database</h2>
          </Card.Header>
          <Card.Body className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Server</span>
              <span className="font-medium">Voltron</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Database</span>
              <span className="font-medium">FabTracker</span>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="font-semibold">Status Legend</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-24 px-2 py-1 text-center rounded bg-gray-100 text-gray-800">Submitted</span>
                <span className="text-gray-600">Submitted, awaiting action</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 px-2 py-1 text-center rounded bg-blue-100 text-blue-800">Ready</span>
                <span className="text-gray-600">Ready to ship from MFC</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 px-2 py-1 text-center rounded bg-yellow-100 text-yellow-800">Sent</span>
                <span className="text-gray-600">Shipped from MFC to sub</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 px-2 py-1 text-center rounded bg-orange-100 text-orange-800">In-Process</span>
                <span className="text-gray-600">Being fabricated at sub</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 px-2 py-1 text-center rounded bg-purple-100 text-purple-800">Shipped</span>
                <span className="text-gray-600">Shipped from sub back to MFC</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 px-2 py-1 text-center rounded bg-teal-100 text-teal-800">Received</span>
                <span className="text-gray-600">Received at MFC</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 px-2 py-1 text-center rounded bg-green-100 text-green-800">QCd</span>
                <span className="text-gray-600">Quality checked</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 px-2 py-1 text-center rounded bg-green-200 text-green-900">Complete</span>
                <span className="text-gray-600">Fully complete</span>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="font-semibold">Card Border Colors</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 bg-red-500 rounded"></span>
                <span className="text-gray-600">Overdue - past leave date, not fully shipped</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 bg-orange-500 rounded"></span>
                <span className="text-gray-600">Overdue receive - past ship date, not received</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 bg-pink-500 rounded"></span>
                <span className="text-gray-600">Missing steel</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 bg-blue-500 rounded"></span>
                <span className="text-gray-600">Ready to ship</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 bg-yellow-500 rounded"></span>
                <span className="text-gray-600">In progress</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 bg-green-500 rounded"></span>
                <span className="text-gray-600">Complete</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}
