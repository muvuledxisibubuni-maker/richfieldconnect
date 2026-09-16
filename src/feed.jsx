import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { containsProfanity, censorText } from "@/lib/utils";
import { Send, Heart, AlertTriangle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "student", label: "Students" },
  { value: "recruiter", label: "Recruiters" },
  { value: "administrator", label: "Administrators" },
  { value: "general", label: "General" },
];

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [yearFilter, setYearFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [warning, setWarning] = useState("");
  const [posting, setPosting] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Post.list("-created_date", 50);
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handlePost = async () => {
    if (!content.trim()) return;
    if (containsProfanity(content)) {
      setWarning("⚠️ Your post contains vulgar language. Please revise it before posting.");
      return;
    }
    setWarning("");
    setPosting(true);
    try {
      const post = await base44.entities.Post.create({
        author_name: user?.full_name || user?.email || "Anonymous",
        author_id: user?.id,
        author_role: user?.role || "student",
        content: censorText(content),
        category,
        year_filter: yearFilter,
        faculty_filter: facultyFilter,
      });
      setPosts([post, ...posts]);
      setContent("");
    } catch (e) {
      setWarning(e.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (post) => {
    try {
      const updated = await base44.entities.Post.update(post.id, { likes: (post.likes || 0) + 1 });
      setPosts(posts.map((p) => (p.id === post.id ? updated : p)));
    } catch (e) { console.error(e); }
  };

  const filtered = posts.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (yearFilter !== "all" && p.year_filter !== "all" && p.year_filter !== yearFilter) return false;
    if (facultyFilter !== "all" && p.faculty_filter !== "all" && p.faculty_filter !== facultyFilter) return false;
    return true;
  });

  const roleBadge = (r) => ({
    student: "bg-[#0A1A3F] text-white",
    recruiter: "bg-[#C8102E] text-white",
    administrator: "bg-purple-600 text-white",
    alumni: "bg-emerald-600 text-white",
    general: "bg-gray-200 text-gray-700",
  }[r] || "bg-gray-200 text-gray-700");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1A3F]">Community Feed</h1>
        <p className="text-muted-foreground text-sm">Posts are categorized — choose a category to filter.</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setCategory("all")} className={cn("px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap", category === "all" ? "bg-[#0A1A3F] text-white" : "bg-white border")}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCategory(c.value)} className={cn("px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap", category === c.value ? "bg-[#0A1A3F] text-white" : "bg-white border")}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <Textarea value={content} onChange={(e) => { setContent(e.target.value); setWarning(""); }} placeholder="Share something with the community..." className="border-0 resize-none focus-visible:ring-0" rows={3} />
        {warning && (
          <div className="flex items-center gap-2 text-sm text-[#C8102E] mt-2">
            <AlertTriangle className="w-4 h-4" /> {warning}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="text-xs rounded-md border px-2 py-1.5">
            <option value="all">All Years</option>
            <option value="first">First Year</option>
            <option value="second">Second Year</option>
            <option value="third">Third Year</option>
          </select>
          <select value={facultyFilter} onChange={(e) => setFacultyFilter(e.target.value)} className="text-xs rounded-md border px-2 py-1.5">
            <option value="all">All Faculties</option>
            <option value="IT">IT</option>
            <option value="Business Studies">Business Studies</option>
          </select>
          <Button onClick={handlePost} disabled={posting || !content.trim()} size="sm" className="ml-auto bg-[#C8102E] hover:bg-[#C8102E]/90">
            <Send className="w-4 h-4 mr-1" /> Post
          </Button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No posts yet. Be the first to share!</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A1A3F] flex items-center justify-center text-white font-semibold shrink-0">
                  {(post.author_name || "A").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{post.author_name}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", roleBadge(post.author_role))}>
                      {post.author_role}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button onClick={() => handleLike(post)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#C8102E]">
                      <Heart className="w-4 h-4" /> {post.likes || 0}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
