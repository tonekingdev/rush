import { DocumentsTable } from "@/app/components/admin/documents-table"

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Document Management</h1>
        <p className="text-gray-600">Review and manage uploaded documents</p>
      </div>

      <DocumentsTable />
    </div>
  )
}