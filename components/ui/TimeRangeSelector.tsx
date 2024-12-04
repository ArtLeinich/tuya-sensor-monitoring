// components/ui/TimeRangeSelector.tsx

import { TimeRange } from "@/lib/utils";

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({
  timeRange,
  onTimeRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-4 mb-6">
      {["day", "month", "year"].map((range) => (
        <button
          key={range}
          onClick={() => onTimeRangeChange(range as TimeRange)}
          className={`px-4 py-2 rounded-full ${
            timeRange === range
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {range === "day" ? "Tag" : range === "month" ? "Monat" : "Jahr"}
        </button>
      ))}
    </div>
  );
}
