import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Trophy } from "lucide-react";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import Leaderboard from "@/components/challenges/Leaderboard";
import BadgesPanel from "@/components/challenges/BadgesPanel";

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [ch, bd] = await Promise.all([
        base44.entities.SkillChallenge.list("-created_date", 50),
        base44.entities.Badge.filter({ student_id: user?.id }),
      ]);
      setChallenges(ch);
      setBadges(bd);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleJoin = async (ch) => {
    const list = ch.participants || [];
    const names = ch.participant_names || [];
    if (list.includes(user.id)) {
      const idx = list.indexOf(user.id);
      const updated = await base44.entities.SkillChallenge.update(ch.id, {
        participants: list.filter((_, i) => i !== idx),
        participant_names: names.filter((_, i) => i !== idx),
      });
      setChallenges(challenges.map((x) => (x.id === ch.id ? updated : x)));
      const mine = badges.find((b) => b.name === ch.badge_name);
      if (mine) {
        await base44.entities.Badge.delete(mine.id);
        setBadges(badges.filter((b) => b.id !== mine.id));
      }
    } else {
      const updated = await base44.entities.SkillChallenge.update(ch.id, {
        participants: [...list, user.id],
        participant_names: [...names, user.full_name || user.email],
      });
      setChallenges(challenges.map((x) => (x.id === ch.id ? updated : x)));
      if (ch.badge_name && !badges.some((b) => b.name === ch.badge_name)) {
        const badge = await base44.entities.Badge.create({
          name: ch.badge_name,
          description: `Earned from the "${ch.title}" skill challenge`,
          student_id: user.id,
        });
        setBadges([...badges, badge]);
      }
    }
  };

  const scores = {};
  const leaderboard = [];
  challenges.forEach((ch) => {
    (ch.participant_names || []).forEach((name, i) => {
      const id = ch.participants?.[i] || name;
      if (!scores[id]) {
        scores[id] = { id, name, points: 0, challenges: 0 };
        leaderboard.push(scores[id]);
      }
      scores[id].points += ch.points || 10;
      scores[id].challenges += 1;
    });
  });
  leaderboard.sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1A3F] flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#C8102E]" /> Skill Challenges
        </h1>
        <p className="text-muted-foreground text-sm">Join challenges, earn badges and climb the leaderboard.</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading challenges...</div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No challenges yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((ch) => (
              <ChallengeCard
                key={ch.id}
                challenge={ch}
                joined={(ch.participants || []).includes(user?.id)}
                onToggle={() => toggleJoin(ch)}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BadgesPanel badges={badges} />
            <Leaderboard entries={leaderboard.slice(0, 10)} currentUserId={user?.id} />
          </div>
        </>
      )}
    </div>
  );
}
