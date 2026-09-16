import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { value: "all", label: "All" },
  { value: "workshop", label: "Workshops" },
  { value: "career fair", label: "Career Fairs" },
  { value: "networking", label: "Networking" },
  { value: "hackathon", label: "Hackathons" },
];

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  const load = async () => {
    try {
      const data = await base44.entities.Event.list("event_date", 50);
      setEvents(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const visibleEvents = events.filter((ev) => typeFilter === "all" || ev.event_type === typeFilter);

  const rsvp = async (ev) => {
    const list = ev.rsvp_list || [];
    if (list.includes(user.id)) {
      const updated = await base44.entities.Event.update(ev.id, { rsvp_list: list.filter((id) => id !== user.id) });
      setEvents(events.map((e) => (e.id === ev.id ? updated : e)));
    } else {
      const updated = await base44.entities.Event.update(ev.id, { rsvp_list: [...list, user.id] });
      setEvents(events.map((e) => (e.id === ev.id ? updated : e)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1A3F]">Events</h1>
        <p className="text-muted-foreground text-sm">RSVP to upcoming events and grow your network.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border font-medium",
              typeFilter === t.value ? "bg-[#C8102E] text-white border-[#C8102E]" : "bg-white text-[#0A1A3F]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading events...</div>
      ) : visibleEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleEvents.map((ev) => {
            const rsvped = (ev.rsvp_list || []).includes(user?.id);
            const count = (ev.rsvp_list || []).length;
            return (
              <div key={ev.id} className="bg-white rounded-xl p-5 shadow-sm border">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg bg-[#C8102E]/10 flex flex-col items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5 text-[#C8102E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#0A1A3F]">{ev.title}</h3>
                      {ev.event_type && ev.event_type !== "other" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A1A3F]/10 text-[#0A1A3F] font-medium capitalize">{ev.event_type}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{ev.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{new Date(ev.event_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.location}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {count} going</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => rsvp(ev)} className={cn("w-full mt-4", rsvped ? "bg-emerald-600 hover:bg-emerald-600/90" : "bg-[#0A1A3F] hover:bg-[#0A1A3F]/90")} size="sm">
                  {rsvped ? (<><Check className="w-4 h-4 mr-1" /> Going</>) : "RSVP"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
