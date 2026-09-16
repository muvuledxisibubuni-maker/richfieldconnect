import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, BriefcaseBusiness, Zap } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";

const EXPERIENCE_LEVELS = [
  { value: "all", label: "All Levels" },
  { value: "entry", label: "Entry Level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expFilter, setExpFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showPost, setShowPost] = useState(false);
  const [applyJob, setApplyJob] = useState(null);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Job.list("-created_date", 50);
      setJobs(data.filter((j) => j.is_active !== false));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadJobs(); }, []);

  const filtered = jobs.filter((j) => {
    if (expFilter !== "all" && j.experience_level !== expFilter) return false;
    if (search && !(j.title + " " + j.company).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const exclusive = filtered.filter((j) => j.is_exclusive);
  const regular = filtered.filter((j) => !j.is_exclusive);

  const isRecruiter = user?.role === "recruiter";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1A3F]">Jobs</h1>
          <p className="text-muted-foreground text-sm">Opportunities in Rands. Filter by experience level.</p>
        </div>
        {isRecruiter && (
          <Button onClick={() => setShowPost(true)} className="bg-[#C8102E] hover:bg-[#C8102E]/90">
            <BriefcaseBusiness className="w-4 h-4 mr-1" /> Post Job
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border text-sm" />
        <select value={expFilter} onChange={(e) => setExpFilter(e.target.value)} className="text-sm rounded-lg border px-3 py-2">
          {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No jobs found.</div>
      ) : (
        <div className="space-y-6">
          {exclusive.length > 0 && (
            <div>
              <h2 className="font-bold text-[#C8102E] flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" /> Exclusive Opportunities
              </h2>
              <div className="space-y-4">
                {exclusive.map((job) => (
                  <JobCard key={job.id} job={job} exclusive onApply={() => setApplyJob(job)} />
                ))}
              </div>
            </div>
          )}
          <div>
            {exclusive.length > 0 && <h2 className="font-bold text-[#0A1A3F] mb-3">All Jobs</h2>}
            <div className="space-y-4">
              {regular.map((job) => (
                <JobCard key={job.id} job={job} onApply={() => setApplyJob(job)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {showPost && <PostJobModal user={user} onClose={() => setShowPost(false)} onPosted={loadJobs} />}
      {applyJob && <ApplyModal job={applyJob} user={user} onClose={() => setApplyJob(null)} />}
    </div>
  );
}

function PostJobModal({ user, onClose, onPosted }) {
  const [form, setForm] = useState({ title: "", company: user?.company_name || "", description: "", location: "", salary_zar: "", experience_level: "entry", job_type: "full-time", skills_required: "", is_exclusive: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true); setError("");
    try {
      await base44.entities.Job.create({
        ...form,
        salary_zar: Number(form.salary_zar) || 0,
        is_exclusive: !!form.is_exclusive,
        skills_required: form.skills_required.split(",").map((s) => s.trim()).filter(Boolean),
        recruiter_id: user.id,
        category: "student",
      });
      onPosted(); onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#0A1A3F]">Post a Job</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-3 p-2 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="space-y-3">
          <Input placeholder="Job title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
          <Input placeholder="Company" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} />
          <Textarea placeholder="Job description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} />
            <Input placeholder="Salary (ZAR)" type="number" value={form.salary_zar} onChange={(e) => setForm({...form, salary_zar: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.experience_level} onChange={(e) => setForm({...form, experience_level: e.target.value})} className="rounded-md border px-3 py-2 text-sm">
              {EXPERIENCE_LEVELS.slice(1).map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <select value={form.job_type} onChange={(e) => setForm({...form, job_type: e.target.value})} className="rounded-md border px-3 py-2 text-sm">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <Input placeholder="Skills required (comma-separated)" value={form.skills_required} onChange={(e) => setForm({...form, skills_required: e.target.value})} />
          <label className="flex items-center gap-2 text-sm font-medium text-[#0A1A3F]">
            <input type="checkbox" checked={!!form.is_exclusive} onChange={(e) => setForm({ ...form, is_exclusive: e.target.checked })} />
            Exclusive opportunity
          </label>
          <Button onClick={submit} disabled={saving} className="w-full bg-[#C8102E] hover:bg-[#C8102E]/90">
            {saving ? "Posting..." : "Post Job"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ApplyModal({ job, user, onClose }) {
  const [skills, setSkills] = useState((user?.skills || []).join(", "));
  const [graduationDate, setGraduationDate] = useState("");
  const [badges, setBadges] = useState((user?.badges || []).join(", "));
  const [coverLetter, setCoverLetter] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true); setError("");
    try {
      await base44.entities.Application.create({
        job_id: job.id,
        job_title: job.title,
        applicant_id: user.id,
        applicant_name: user.full_name || user.email,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        graduation_date: graduationDate,
        badges: badges.split(",").map((s) => s.trim()).filter(Boolean),
        cover_letter: coverLetter,
      });
      if (job.recruiter_id) {
        await base44.entities.Notification.create({
          user_id: job.recruiter_id,
          title: "New Application",
          body: `${user.full_name || user.email} applied for ${job.title}`,
          type: "job",
          link: "/jobs",
        });
      }
      onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#0A1A3F]">Apply: {job.title}</h2>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-3 p-2 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="space-y-3">
          <div>
            <Label>What skills do you have?</Label>
            <Input placeholder="e.g. JavaScript, Python, SQL" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
          <div>
            <Label>When did you graduate? (or expected)</Label>
            <Input type="date" value={graduationDate} onChange={(e) => setGraduationDate(e.target.value)} />
          </div>
          <div>
            <Label>What badges do you have?</Label>
            <Input placeholder="e.g. Top Coder, Dean's List" value={badges} onChange={(e) => setBadges(e.target.value)} />
          </div>
          <div>
            <Label>Cover Letter</Label>
            <Textarea placeholder="Write your cover letter..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} />
          </div>
          <Button onClick={submit} disabled={saving} className="w-full bg-[#0A1A3F] hover:bg-[#0A1A3F]/90">
            {saving ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </div>
    </div>
  );
}
