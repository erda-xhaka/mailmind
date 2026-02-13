import { Calendar as CalIcon, Clock, MapPin, Users } from "lucide-react";

const events = [
  { id: 1, title: "Team Sync", time: "9:00 AM - 9:30 AM", location: "Google Meet", attendees: 5, color: "bg-category-meetings" },
  { id: 2, title: "Client Call - Acme Corp", time: "11:00 AM - 12:00 PM", location: "Zoom", attendees: 3, color: "bg-category-work" },
  { id: 3, title: "Lunch with Alex", time: "12:30 PM - 1:30 PM", location: "Downtown Cafe", attendees: 2, color: "bg-category-personal" },
  { id: 4, title: "Sprint Planning", time: "2:00 PM - 3:00 PM", location: "Conference Room B", attendees: 8, color: "bg-category-important" },
  { id: 5, title: "1:1 with Manager", time: "4:00 PM - 4:30 PM", location: "Google Meet", attendees: 2, color: "bg-category-meetings" },
];

const CalendarPage = () => (
  <div>
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-bold">Calendar</h1>
      <p className="text-muted-foreground text-sm mt-1">Today's schedule · Detected from emails</p>
    </div>
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="glass-card p-5 hover:border-primary/30 transition-all flex items-center gap-4">
          <div className={`w-1 h-12 rounded-full ${event.color}`} />
          <div className="flex-1">
            <h3 className="font-medium text-sm">{event.title}</h3>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.attendees}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CalendarPage;
