import { dimensionLabels } from "@/lib/vocational/data";
import type { Dimension } from "@/lib/vocational/types";

export function PanelPuntajes({
  title,
  dimensions,
  averages,
  muted = false,
}: {
  title: string;
  dimensions: Dimension[];
  averages: Record<Dimension, number>;
  muted?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#dfe5ef] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {dimensions.map((dimension) => (
          <BarraPuntaje
            key={dimension}
            label={dimensionLabels[dimension]}
            value={averages[dimension]}
            muted={muted}
          />
        ))}
      </div>
    </div>
  );
}

function BarraPuntaje({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  const width = Math.round((value / 5) * 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className={muted ? "font-medium text-[#64748B]" : "font-medium"}>
          {label}
        </span>
        <span className="text-[#64748B]">{value.toFixed(1)}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-[#dfe5ef]">
        <div
          className={`h-2 rounded-full ${muted ? "bg-[#93C5FD]" : "bg-[#93C5FD]"}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}





