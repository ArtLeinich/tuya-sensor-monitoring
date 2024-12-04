"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Thermometer, Droplets, Clock } from "lucide-react";

interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface ApiResponse {
  data: SensorData[];
  pagination: PaginationData;
}

export default function SensorTable() {
  const [data, setData] = useState<SensorData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();
  const ITEMS_PER_PAGE = 120;

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/sensor-data?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`
      );
      const result: ApiResponse = await response.json();

      if (result.data) {
        setData((prevData) => [...prevData, ...result.data]);
        setHasMore(result.pagination.hasMore);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (window.innerWidth < 640) {
      return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleString("ru-RU");
  };

  return (
    <Card className="w-full mx-auto max-w-full sm:max-w-4xl">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
          Indikatoren
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
        {/* Fixed top */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b">
            <div className="grid grid-cols-3 px-4 py-3">
              <div className="flex items-center space-x-1">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium">Temperatur</span>
              </div>
              <div className="flex items-center space-x-1">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium">Luftfeuchtigkeit</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium">Zeit</span>
              </div>
            </div>
          </div>
          <div className="max-h-[47vh] overflow-y-auto mb-2">
            {data.map((item, index) => (
              <div
                key={item.id}
                ref={index === data.length - 1 ? lastElementRef : null}
                className="grid grid-cols-3 px-4 py-2 border-b hover:bg-gray-50"
              >
                <div>
                  <span
                    className={`text-xs ${
                      item.temperature > 25
                        ? "text-red-600"
                        : item.temperature < 18
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {item.temperature}°C
                  </span>
                </div>
                <div>
                  <span
                    className={`text-xs ${
                      item.humidity > 70
                        ? "text-blue-600"
                        : item.humidity < 30
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {item.humidity}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-600">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="p-4 text-center text-gray-500 text-xs">
                Loading...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
