// app/page.tsx

import React from "react";
import SensorTable from "@/components/SensorTable";
import SensorGraph from "@/components/SensorGraph";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center">
      <h1 className="text-3xl font-bold my-6">Sensordaten</h1>

      {/* Sensortabelle auf dem ersten Bildschirm */}
      <section className="w-full max-w-4xl">
        <SensorTable />
      </section>

      {/* Grafiken unter der Tabelle */}
      <section className="w-full max-w-4xl mt-12">
        <h2 className="text-2xl font-semibold my-6 text-center">Grafiken</h2>
        <SensorGraph />
      </section>
    </main>
  );
}
