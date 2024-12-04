//components/SensorGraph.tsx
"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  format,
  subDays,
  addDays,
  subMonths,
  addMonths,
  subYears,
  addYears,
} from "date-fns";
import { TimeRange } from "@/lib/utils";
import ViewSelector from "@/components/ui/ViewSelector";
import TimeRangeSelector from "@/components/ui/TimeRangeSelector";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  createdAt: string;
}

interface AggregatedData {
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
}

async function fetchData(range: TimeRange, date: Date): Promise<SensorData[]> {
  const res = await fetch(
    `/api/sensor-graphs?range=${range}&date=${date.toISOString()}`
  );
  return await res.json();
}

function aggregateData(data: SensorData[], range: TimeRange): AggregatedData[] {
  if (!data.length) return [];

  switch (range) {
    case "day": {
      // Erstellen eines Arrays für 24 Stunden mit Nullwerten
      const hourlyData: AggregatedData[] = Array.from(
        { length: 24 },
        (_, i) => ({
          timestamp: `${i.toString().padStart(2, "0")}:00`,
          temperature: null,
          humidity: null,
        })
      );

      // Nur die Stunden ausfüllen, für die Daten vorhanden sind
      data.forEach((reading) => {
        const hour = new Date(reading.createdAt).getHours();
        hourlyData[hour] = {
          timestamp: `${hour.toString().padStart(2, "0")}:00`,
          temperature: reading.temperature,
          humidity: reading.humidity,
        };
      });

      return hourlyData;
    }

    case "month": {
      const dailyData: {
        [day: string]: { temp: number; hum: number; count: number };
      } = {};

      data.forEach((reading) => {
        const day = format(new Date(reading.createdAt), "dd");
        if (!dailyData[day]) {
          dailyData[day] = { temp: 0, hum: 0, count: 0 };
        }
        dailyData[day].temp += reading.temperature;
        dailyData[day].hum += reading.humidity;
        dailyData[day].count += 1;
      });

      const daysInMonth = new Date(
        new Date(data[0]?.createdAt || new Date()).getFullYear(),
        new Date(data[0]?.createdAt || new Date()).getMonth() + 1,
        0
      ).getDate();

      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = (i + 1).toString().padStart(2, "0");
        const aggregated = dailyData[day];

        return {
          timestamp: day,
          temperature: aggregated ? aggregated.temp / aggregated.count : null,
          humidity: aggregated ? aggregated.hum / aggregated.count : null,
        };
      });
    }

    case "year": {
      const monthlyData: {
        [month: string]: { temp: number; hum: number; count: number };
      } = {};

      data.forEach((reading) => {
        const month = format(new Date(reading.createdAt), "MMM");
        if (!monthlyData[month]) {
          monthlyData[month] = { temp: 0, hum: 0, count: 0 };
        }
        monthlyData[month].temp += reading.temperature;
        monthlyData[month].hum += reading.humidity;
        monthlyData[month].count += 1;
      });

      return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(new Date().getFullYear(), i, 1);
        const month = format(date, "MMM");
        const aggregated = monthlyData[month];

        return {
          timestamp: month,
          temperature: aggregated ? aggregated.temp / aggregated.count : null,
          humidity: aggregated ? aggregated.hum / aggregated.count : null,
        };
      });
    }

    default:
      return [];
  }
}

export default function SensorGraph() {
  const [data, setData] = useState<AggregatedData[]>([]);
  const [view, setView] = useState<"temperature" | "humidity">("temperature");
  const [timeRange, setTimeRange] = useState<TimeRange>("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetchData(timeRange, currentDate);
      const aggregatedData = aggregateData(fetchedData, timeRange);
      setData(aggregatedData);
    };
    loadData();
  }, [timeRange, currentDate]);

  const navigateDate = (direction: "prev" | "next") => {
    switch (timeRange) {
      case "day":
        setCurrentDate(
          direction === "prev"
            ? subDays(currentDate, 1)
            : addDays(currentDate, 1)
        );
        break;
      case "month":
        setCurrentDate(
          direction === "prev"
            ? subMonths(currentDate, 1)
            : addMonths(currentDate, 1)
        );
        break;
      case "year":
        setCurrentDate(
          direction === "prev"
            ? subYears(currentDate, 1)
            : addYears(currentDate, 1)
        );
        break;
    }
  };

  const getDateDisplay = () => {
    switch (timeRange) {
      case "day":
        return format(currentDate, "dd/MM/yyyy");
      case "month":
        return format(currentDate, "MM/yyyy");
      case "year":
        return format(currentDate, "yyyy");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <ViewSelector view={view} onViewChange={setView} />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <TimeRangeSelector
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="timestamp" tickLine={false} axisLine={false} />
              <YAxis
                domain={view === "temperature" ? [20, 22] : [30, 70]}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={view}
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                connectNulls={false} // Wichtige Änderung: Trennen Sie die Verbindung mit dem Nullwert
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => navigateDate("prev")}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-gray-600">{getDateDisplay()}</span>
          <button
            onClick={() => navigateDate("next")}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
