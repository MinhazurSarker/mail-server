"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import Calendar from "@/components/main/calendar";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/palette.css";
import "@fullcalendar/react/themes/classic/theme.css";

export default function CalendarPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendar" />
      <Calendar />
    </div>
  );
}
