export async function generateStaticParams() {
  // Return a reasonable set of NP Intake IDs for static generation (500)
  const intakeIds = Array.from({ length: 1000 }, (_, i) => (i + 1001).toString())

  return intakeIds.map((id) => ({
    npIntakeId: id,
  }))
}

import NpIntakeDetailPageClient from "./NpIntakeDetailPageClient"

// The main server component that wraps the client component
export default function NpIntakeDetailPage() {
  return <NpIntakeDetailPageClient />
}