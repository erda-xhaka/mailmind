import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar as CalIcon, Plus, ChevronLeft, ChevronRight, MapPin, Clock, Users, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isAfter, startOfDay, endOfDay, endOfISOWeek, startOfISOWeek, addWeeks } from "date-fns";
import { sq } from "date-fns/locale/sq";

interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string | null;
  description: string | null;
  category: string | null;
  participants: string[] | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "Akademike", label: "Akademike", color: "bg-blue-500" },
  { value: "Punë", label: "Punë", color: "bg-green-500" },
  { value: "Personale", label: "Personale", color: "bg-purple-500" },
  { value: "Shëndetësi", label: "Shëndetësi", color: "bg-red-500" },
  { value: "Udhëtime", label: "Udhëtime", color: "bg-orange-500" },
];

const TIME_FILTERS = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "next_week", label: "Next Week" },
  { value: "this_month", label: "This Month" },
  { value: "next_month", label: "Next Month" },
];

const getCategoryColor = (cat: string | null) =>
  CATEGORIES.find((c) => c.value === cat)?.color ?? "bg-muted-foreground";

const getCategoryDot = (cat: string | null) => {
  const map: Record<string, string> = {
    Akademike: "bg-blue-500",
    Punë: "bg-green-500",
    Personale: "bg-purple-500",
    Shëndetësi: "bg-red-500",
    Udhëtime: "bg-orange-500",
  };
  return map[cat ?? ""] ?? "bg-primary";
};

const emptyForm = {
  title: "",
  start_date: "",
  start_time: "09:00",
  end_date: "",
  end_time: "10:00",
  location: "",
  description: "",
  category: "Punë",
  participantInput: "",
  participants: [] as string[],
};

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: true });
    if (!error && data) setEvents(data as unknown as CalendarEvent[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) { days.push(day); day = addDays(day, 1); }
    return days;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      const key = format(new Date(e.start_date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate[format(selectedDate, "yyyy-MM-dd")] || [];
  }, [selectedDate, eventsByDate]);

  // Upcoming events with filters
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    let filtered = events.filter((e) => isAfter(new Date(e.start_date), startOfDay(now)) || isSameDay(new Date(e.start_date), now));

    if (timeFilter !== "all") {
      const today = startOfDay(now);
      const todayEnd = endOfDay(now);
      const weekStart = startOfISOWeek(now);
      const weekEnd = endOfISOWeek(now);
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const nextWeekStart = startOfISOWeek(addWeeks(now, 1));
      const nextWeekEnd = endOfISOWeek(addWeeks(now, 1));
      const nextMonthStart = startOfMonth(addMonths(now, 1));
      const nextMonthEnd = endOfMonth(addMonths(now, 1));

      filtered = filtered.filter((e) => {
        const d = new Date(e.start_date);
        switch (timeFilter) {
          case "today": return d >= today && d <= todayEnd;
          case "this_week": return d >= weekStart && d <= weekEnd;
          case "next_week": return d >= nextWeekStart && d <= nextWeekEnd;
          case "this_month": return d >= monthStart && d <= monthEnd;
          case "next_month": return d >= nextMonthStart && d <= nextMonthEnd;
          default: return true;
        }
      });
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    return filtered;
  }, [events, timeFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthEvents = events.filter((e) => {
      const d = new Date(e.start_date);
      return d >= monthStart && d <= monthEnd;
    });
    const byCat: Record<string, number> = {};
    let totalHours = 0;
    monthEvents.forEach((e) => {
      byCat[e.category || "Uncategorized"] = (byCat[e.category || "Uncategorized"] || 0) + 1;
      totalHours += (new Date(e.end_date).getTime() - new Date(e.start_date).getTime()) / 3600000;
    });
    return { total: monthEvents.length, byCat, totalHours: Math.round(totalHours * 10) / 10 };
  }, [events, currentMonth]);

  // Form handlers
  const openCreateForm = (date?: Date) => {
    const d = date || new Date();
    setEditingEvent(null);
    setForm({
      ...emptyForm,
      start_date: format(d, "yyyy-MM-dd"),
      end_date: format(d, "yyyy-MM-dd"),
    });
    setFormOpen(true);
  };

  const openEditForm = (event: CalendarEvent) => {
    setEditingEvent(event);
    const sd = new Date(event.start_date);
    const ed = new Date(event.end_date);
    setForm({
      title: event.title,
      start_date: format(sd, "yyyy-MM-dd"),
      start_time: format(sd, "HH:mm"),
      end_date: format(ed, "yyyy-MM-dd"),
      end_time: format(ed, "HH:mm"),
      location: event.location || "",
      description: event.description || "",
      category: event.category || "Punë",
      participantInput: "",
      participants: Array.isArray(event.participants) ? event.participants : [],
    });
    setDetailOpen(false);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Titulli është i detyrueshëm", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const startDatetime = `${form.start_date}T${form.start_time}:00`;
    const endDatetime = `${form.end_date}T${form.end_time}:00`;

    const payload = {
      user_id: user.id,
      title: form.title.trim(),
      start_date: startDatetime,
      end_date: endDatetime,
      location: form.location || null,
      description: form.description || null,
      category: form.category,
      participants: form.participants.length > 0 ? form.participants : null,
    };

    let error;
    if (editingEvent) {
      const { error: e } = await supabase.from("calendar_events").update(payload).eq("id", editingEvent.id);
      error = e;
    } else {
      const { error: e } = await supabase.from("calendar_events").insert(payload);
      error = e;
    }

    if (error) {
      toast({ title: "Gabim gjatë ruajtjes", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingEvent ? "Eventi u përditësua" : "Eventi u krijua" });
      setFormOpen(false);
      fetchEvents();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!viewingEvent) return;
    const { error } = await supabase.from("calendar_events").delete().eq("id", viewingEvent.id);
    if (error) {
      toast({ title: "Gabim gjatë fshirjes", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Eventi u fshi" });
      setDeleteConfirmOpen(false);
      setDetailOpen(false);
      fetchEvents();
    }
  };

  const addParticipant = () => {
    const email = form.participantInput.trim();
    if (email && !form.participants.includes(email)) {
      setForm({ ...form, participants: [...form.participants, email], participantInput: "" });
    }
  };

  const removeParticipant = (email: string) => {
    setForm({ ...form, participants: form.participants.filter((p) => p !== email) });
  };

  const dayNames = ["Hë", "Ma", "Më", "En", "Pr", "Sh", "Di"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">📅 Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your events</p>
        </div>
        <Button onClick={() => openCreateForm()} className="gap-2">
          <Plus className="h-4 w-4" /> Create New Event
        </Button>
      </div>

      {/* Month View */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-heading text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const hasEvents = !!eventsByDate[key];
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const inMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(day)}
                className={`relative flex flex-col items-center justify-center py-2 rounded-lg text-sm transition-all
                  ${!inMonth ? "text-muted-foreground/30" : ""}
                  ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                  ${isToday && !isSelected ? "ring-1 ring-primary" : ""}
                `}
              >
                <span>{format(day, "d")}</span>
                {hasEvents && (
                  <div className="flex gap-0.5 mt-0.5">
                    {eventsByDate[key].slice(0, 3).map((e, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${getCategoryDot(e.category)}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-base font-semibold">
              {format(selectedDate, "EEEE, d MMMM yyyy")}
            </h3>
            <Button variant="outline" size="sm" onClick={() => openCreateForm(selectedDate)} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Event
            </Button>
          </div>
          {selectedDateEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No events scheduled for this date</p>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => { setViewingEvent(e); setDetailOpen(true); }}
                  className="w-full text-left glass-card p-3 hover:border-primary/30 transition-all flex items-center gap-3"
                >
                  <div className={`w-1 h-10 rounded-full ${getCategoryDot(e.category)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(e.start_date), "HH:mm")} – {format(new Date(e.end_date), "HH:mm")}
                      {e.location && ` · ${e.location}`}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{e.category}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TIME_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.color}`} />
                  {c.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(timeFilter !== "all" || categoryFilter !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setTimeFilter("all"); setCategoryFilter("all"); }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="font-heading text-lg font-semibold mb-3">📌 Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <CalIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((e) => (
              <button
                key={e.id}
                onClick={() => { setViewingEvent(e); setDetailOpen(true); }}
                className="w-full text-left glass-card p-4 hover:border-primary/30 transition-all flex items-center gap-4"
              >
                <div className={`w-1 h-12 rounded-full ${getCategoryDot(e.category)}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{e.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(e.start_date), "MMM d, HH:mm")}</span>
                    {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">{e.category}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="glass-card p-5">
        <h3 className="font-heading text-base font-semibold mb-3">📊 Monthly Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total events</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{stats.totalHours}h</p>
            <p className="text-xs text-muted-foreground">Hours scheduled</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{Object.keys(stats.byCat).length}</p>
            <p className="text-xs text-muted-foreground">Categories used</p>
          </div>
        </div>
        {Object.keys(stats.byCat).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(stats.byCat).map(([cat, count]) => (
              <Badge key={cat} variant="secondary" className="gap-1">
                <span className={`w-2 h-2 rounded-full ${getCategoryDot(cat)}`} />
                {cat}: {count}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update event details below" : "Fill in the details to create a new event"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label>Start time</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>End date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div>
                <Label>End time</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Optional" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" rows={3} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${c.color}`} />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Participants</Label>
              <div className="flex gap-2">
                <Input
                  value={form.participantInput}
                  onChange={(e) => setForm({ ...form, participantInput: e.target.value })}
                  placeholder="email@example.com"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addParticipant}>Add</Button>
              </div>
              {form.participants.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.participants.map((p) => (
                    <Badge key={p} variant="secondary" className="gap-1">
                      {p}
                      <button onClick={() => removeParticipant(p)}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Anulo</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingEvent ? "Save Changes" : "Krijo Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getCategoryDot(viewingEvent?.category ?? null)}`} />
              {viewingEvent?.title}
            </DialogTitle>
            <DialogDescription>Event details</DialogDescription>
          </DialogHeader>
          {viewingEvent && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(viewingEvent.start_date), "EEEE, d MMM yyyy, HH:mm")} –{" "}
                  {format(new Date(viewingEvent.end_date), "HH:mm")}
                </span>
              </div>
              {viewingEvent.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{viewingEvent.location}</span>
                </div>
              )}
              <div>
                <Badge variant="secondary">{viewingEvent.category}</Badge>
              </div>
              {viewingEvent.description && (
                <p className="text-muted-foreground">{viewingEvent.description}</p>
              )}
              {viewingEvent.participants && (viewingEvent.participants as string[]).length > 0 && (
                <div>
                  <p className="flex items-center gap-1 text-muted-foreground mb-1"><Users className="h-4 w-4" /> Participants:</p>
                  <div className="flex flex-wrap gap-1">
                    {(viewingEvent.participants as string[]).map((p) => (
                      <Badge key={p} variant="outline">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" className="gap-1" onClick={() => viewingEvent && openEditForm(viewingEvent)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="destructive" className="gap-1" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmo fshirjen</DialogTitle>
            <DialogDescription>
              A jeni i sigurt që doni të fshini eventin "{viewingEvent?.title}"? Ky veprim nuk mund të kthehet mbrapa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Anulo</Button>
            <Button variant="destructive" onClick={handleDelete}>Fshi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
