export async function generateStaticParams() {
  // Return a reasonable set of application IDs for static generation
  const applicationIds = Array.from({ length: 1000 }, (_, i) => (i + 1).toString())

  return applicationIds.map((id) => ({
    id: id,
  }))
}

import ApplicationDetailPageClient from "./ApplicationDetailPageClient"

export default function ApplicationDetailPage() {
  return <ApplicationDetailPageClient />
}