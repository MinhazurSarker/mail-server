"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ActiveUserStats from "./active-user-stats";
import CardHeader from "./card-header";
import { activeUserChartOptions, activeUserChartSeries } from "./data";
import LiveVisitors from "./live-visitors";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function ActiveUsersChart() {
  const [series, setSeries] = useState(activeUserChartSeries);
  const [liveVisitors, setLiveVisitors] = useState(364);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate new random data (same as html version)
      const newData = Array.from(
        { length: 12 },
        () => Math.floor(Math.random() * 50) + 150,
      );

      setSeries([
        {
          name: "Active Users",
          data: newData,
        },
      ]);

      const newActiveUsers = Math.floor(Math.random() * 500) + 100;
      setLiveVisitors(newActiveUsers);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />
      <LiveVisitors count={liveVisitors} />

      <div className="my-5 min-h-38.75 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900">
        <div className="-ms-5.5 -me-2.5 h-full rtl:-ms-2.5 rtl:-me-5.5">
          <ReactApexChart
            options={activeUserChartOptions}
            series={series}
            type="area"
            height={140}
          />
        </div>
      </div>

      <ActiveUserStats />
    </div>
  );
}
