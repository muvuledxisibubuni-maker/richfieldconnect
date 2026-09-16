import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Newspaper, Briefcase, Users, CalendarDays, FileText, Code2, TrendingUp } from "lucide-react";

export default function Analytics() {
  const [stats, setStats] = useState({ posts: 0, jobs: 0, members: 0, events: 0, applications: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [posts, jobs, users, events, apps, projects] = await Promise.all([
          base44.entities.Post.list(),
          base44.entities.Job.list(),
          base44.entities.User.list(),
          base44.entities.Event.list(),
          base44.entities.Application.list(),
          base44.entities.Project.list(),
        ]);
        setStats({
          posts: posts.length,
          jobs: jobs.length,
          members: users.length,
          events: events.length,
          applications: apps.length,
          projects: projects.length,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const cards = [
    { label: "Posts", value: stats.posts, icon: Newspaper, color: "bg-[#0A1A3F]" },
    { label: "Jobs", value: stats.jobs, icon: Briefcase, color: "bg-[#C8102E]" },
    { label: "Members", value: stats.members, icon: Users, color: "bg-[#0A1A3F]" },
    { label: "Events", value: stats.events, icon: CalendarDays, color: "bg-[#C8102E]" },
    { label: "Applications", value: stats.applications, icon: FileText, color: "bg-[#0A1A3F]" },
    { label: "Projects", value: stats.projects, icon: Code2, color: "bg-[#C8102E]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1A3F]">Analytics</h1>
        <p className="text-muted-foreground text-sm">Platform overview and engagement metrics.</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border">
                <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#0A1A3F]">{c.value}</div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#C8102E]" />
          <h2 className="font-bold text-[#0A1A3F]">Engagement Summary</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total platform activity</span>
            <span className="font-bold text-[#0A1A3F]">{stats.posts + stats.jobs + stats.events + stats.applications + stats.projects} items</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg. posts per member</span>
            <span className="font-bold text-[#0A1A3F]">{stats.members ? (stats.posts / stats.members).toFixed(1) : 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Application rate</span>
            <span className="font-bold text-[#0A1A3F]">{stats.jobs ? (stats.applications / stats.jobs).toFixed(1) : 0} per job</span>
          </div>
        </div>
      </div>
    </div>
  );
}
