"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rpcCall } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Users,
  CheckCircle2,
  X,
} from "lucide-react";

interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  timezone: string;
  color: string;
  attendees: Array<{
    email: string;
    name?: string;
    status: string;
  }>;
  createdAt: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showDialog, setShowDialog] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [eventStartTime, setEventStartTime] = useState("09:00");
  const [eventEndTime, setEventEndTime] = useState("10:00");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventColor, setEventColor] = useState("#3b82f6");
  const [eventAttendees, setEventAttendees] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadEvents = useCallback(async (baseDate: Date) => {
    try {
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const startRange = new Date(year, month - 1, 1).toISOString();
      const endRange = new Date(year, month + 2, 0).toISOString();

      const res = await rpcCall<{ items: CalendarEventItem[] }>("calendar", "list", {
        startRange,
        endRange,
      });
      setEvents(res.items || []);
    } catch (err: any) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    loadEvents(currentDate);
  }, [router, currentDate, loadEvents]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenCreateForDate = (dateStr: string) => {
    setEventDate(dateStr);
    setEventTitle("");
    setEventStartTime("09:00");
    setEventEndTime("10:00");
    setEventLocation("");
    setEventDescription("");
    setEventAttendees("");
    setEventColor("#3b82f6");
    setShowDialog(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${eventDate}T${eventStartTime}:00`).toISOString();
      const endDateTime = new Date(`${eventDate}T${eventEndTime}:00`).toISOString();

      const attendeesArr = eventAttendees
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((email) => ({ email }));

      const res = await rpcCall<{ event: CalendarEventItem }>("calendar", "create", {
        title: eventTitle,
        description: eventDescription || undefined,
        location: eventLocation || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        color: eventColor,
        attendees: attendeesArr.length > 0 ? attendeesArr : undefined,
      });

      setEvents((prev) => [...prev, res.event]);
      setShowDialog(false);
      showToast("Calendar event created!");
    } catch (err: any) {
      alert("Error scheduling event: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to cancel and remove this event?")) return;
    try {
      await rpcCall("calendar", "delete", { eventId });
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      showToast("Event deleted");
    } catch (err: any) {
      alert("Error deleting event: " + err.message);
    }
  };

  // Calendar days grid computation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarCells: Array<{ date: Date; dateStr: string; isCurrentMonth: boolean }> = [];

    // Prev month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      calendarCells.push({
        date: d,
        dateStr: d.toISOString().split("T")[0],
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      calendarCells.push({
        date: d,
        dateStr: d.toISOString().split("T")[0],
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete weeks (up to 35 or 42 cells)
    const remaining = (7 - (calendarCells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      calendarCells.push({
        date: d,
        dateStr: d.toISOString().split("T")[0],
        isCurrentMonth: false,
      });
    }

    return calendarCells;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* ── TOP HEADER ── */}
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/inbox">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              <ArrowLeft className="size-3.5" />
              Back to Mail
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            <h1 className="font-bold text-sm tracking-tight">Calendar & Scheduling</h1>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-xs" onClick={handlePrevMonth} className="h-7 w-7">
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="font-bold text-xs min-w-[120px] text-center">{monthName}</span>
          <Button variant="outline" size="icon-xs" onClick={handleNextMonth} className="h-7 w-7">
            <ChevronRight className="size-3.5" />
          </Button>
          <Button variant="secondary" size="xs" onClick={handleToday} className="text-xs h-7 px-2">
            Today
          </Button>
        </div>

        <div>
          <Button size="sm" onClick={() => handleOpenCreateForDate(todayStr)} className="gap-1.5 h-8 text-xs font-semibold">
            <Plus className="size-3.5" />
            New Event
          </Button>
        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── MAIN CALENDAR GRID ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Day Headers (Sun - Sat) */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-border/60 overflow-y-auto">
            {monthData.map((cell) => {
              const isToday = cell.dateStr === todayStr;
              const dayEvents = events.filter((e) => e.startTime.startsWith(cell.dateStr));

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleOpenCreateForDate(cell.dateStr)}
                  className={`p-1.5 min-h-[90px] flex flex-col justify-between cursor-pointer transition-colors ${
                    cell.isCurrentMonth
                      ? "bg-card/20 hover:bg-muted/30"
                      : "bg-muted/10 opacity-40 hover:opacity-80"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-semibold size-5 flex items-center justify-center rounded-full ${
                        isToday ? "bg-primary text-primary-foreground font-bold" : "text-foreground/80"
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        style={{ borderLeftColor: ev.color }}
                        className="text-[10px] truncate px-1.5 py-0.5 rounded bg-muted/60 border-l-2 text-foreground font-medium flex items-center justify-between group"
                      >
                        <span className="truncate">{ev.title}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(ev.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-muted-foreground pl-1">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ── UPCOMING AGENDA SIDEBAR ── */}
        <aside className="w-80 border-l border-border bg-card/20 flex flex-col shrink-0">
          <div className="p-3 border-b border-border bg-card/40 flex items-center justify-between">
            <span className="text-xs font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              Upcoming Agenda
            </span>
            <Badge variant="outline" className="text-[10px]">
              {events.length} Events
            </Badge>
          </div>

          <ScrollArea className="flex-1 p-3">
            {events.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs space-y-1">
                <CalendarIcon className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                <p>No scheduled events</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {events.map((ev) => {
                  const evDate = new Date(ev.startTime);
                  return (
                    <Card key={ev.id} className="border-border/60 bg-card/60 p-3 space-y-1.5 hover:border-border transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs font-bold truncate text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                            {ev.title}
                          </h4>
                          <span className="text-[11px] text-muted-foreground block">
                            {evDate.toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                            {evDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="shrink-0 h-6 w-6 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>

                      {ev.location && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3 text-primary shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}

                      {ev.attendees && ev.attendees.length > 0 && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Users className="size-3 text-emerald-500 shrink-0" />
                          <span>{ev.attendees.length} attendee(s)</span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </aside>
      </div>

      {/* ── CREATE EVENT DIALOG ── */}
      {showDialog && (
        <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md border-border shadow-2xl z-50 overflow-hidden">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/40">
            <CardTitle className="text-sm font-semibold">Schedule New Event</CardTitle>
            <Button variant="ghost" size="icon-xs" onClick={() => setShowDialog(false)}>
              <X className="size-4 text-muted-foreground" />
            </Button>
          </CardHeader>
          <form onSubmit={handleCreateEvent}>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="evTitle" className="text-xs">Event Title *</Label>
                <Input
                  id="evTitle"
                  placeholder="Q4 Strategy Review"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 col-span-1">
                  <Label htmlFor="evDate" className="text-xs">Date</Label>
                  <Input
                    id="evDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <Label htmlFor="evStart" className="text-xs">Start Time</Label>
                  <Input
                    id="evStart"
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <Label htmlFor="evEnd" className="text-xs">End Time</Label>
                  <Input
                    id="evEnd"
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="evLocation" className="text-xs">Location / Conference Link</Label>
                <Input
                  id="evLocation"
                  placeholder="Room 402 or meet.google.com/xyz"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="evAttendees" className="text-xs">Attendees (Comma-separated emails)</Label>
                <Input
                  id="evAttendees"
                  placeholder="alice@corp.com, bob@corp.com"
                  value={eventAttendees}
                  onChange={(e) => setEventAttendees(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="evDesc" className="text-xs">Description</Label>
                <Textarea
                  id="evDesc"
                  rows={2}
                  placeholder="Agenda notes..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Color Tag</Label>
                <div className="flex gap-2 pt-0.5">
                  {["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEventColor(c)}
                      style={{ backgroundColor: c }}
                      className={`size-5 rounded-full transition-transform ${
                        eventColor === c ? "scale-125 ring-2 ring-foreground" : "opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 border-t border-border bg-muted/20 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowDialog(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="h-8 text-xs font-semibold">
                {submitting ? "Saving..." : "Schedule Event"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-primary/50 text-foreground px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-primary shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
