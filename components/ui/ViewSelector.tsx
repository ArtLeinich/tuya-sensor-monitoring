//components/ui/ViewSelector.tsx
interface ViewSelectorProps {
  view: "temperature" | "humidity";
  onViewChange: (view: "temperature" | "humidity") => void;
}

export default function ViewSelector({
  view,
  onViewChange,
}: ViewSelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => {
          console.log("Selected view: temperature");
          onViewChange("temperature");
        }}
        className={`text-xl font-bold py-2 px-4 rounded-lg ${view === "temperature" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
      >
        Temperatur
      </button>
      <button
        onClick={() => {
          console.log("Selected view: humidity");
          onViewChange("humidity");
        }}
        className={`text-xl py-2 px-4 rounded-lg ${view === "humidity" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
      >
        Feuchtigkeit
      </button>
    </div>
  );
}
