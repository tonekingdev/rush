import CommunicationsTable from "@/app/components/admin/communications-table"

export default function CommunicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Communications</h1>
        <p className="text-gray-600">Manage email communications with providers</p>
      </div>

      <CommunicationsTable initialCommunications={[]} initialTotalPages={1} />
    </div>
  )
}