import StatusPending from "@/components/guest/StatusPending";

interface StatusPageProps {
  searchParams: Promise<{ problem?: string; phone?: string }>;
}

export default async function StatusPage({ searchParams }: StatusPageProps) {
  const params = await searchParams;
  return (
    <StatusPending
      problem={params.problem || 'Consultation request'}
      phone={params.phone || 'Phone number provided'}
    />
  );
}