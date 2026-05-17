export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#dfe5ef] bg-[#f7f8fb] p-4">
      <div className="text-2xl font-bold text-[#A78BFA]">{value}</div>
      <div className="mt-1 text-sm text-[#64748B]">{label}</div>
    </div>
  );
}



