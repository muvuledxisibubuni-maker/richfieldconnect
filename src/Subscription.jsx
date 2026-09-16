import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const PREMIUM_BENEFITS = [
  "Unlimited AI CV generation",
  "Priority mentor booking",
  "Access to exclusive events",
  "Advanced analytics dashboard",
  "Unlimited CodeHub projects",
  "Direct alumni network access",
];

export default function Subscription() {
  const { user, checkUserAuth } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const isPremium = user?.subscription_plan === "premium";

  const upgrade = async () => {
    setUpgrading(true);
    try {
      await base44.auth.updateMe({ subscription_plan: "premium" });
      await checkUserAuth();
    } catch (e) { console.error(e); }
    finally { setUpgrading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#0A1A3F]">Upgrade Your Plan</h1>
        <p className="text-muted-foreground text-sm mt-1">Unlock premium features to boost your career.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free plan */}
        <div className={cn("bg-white rounded-xl p-6 shadow-sm border-2", !isPremium ? "border-[#0A1A3F]" : "border-transparent")}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-bold text-[#0A1A3F]">Free</h2>
          </div>
          <div className="text-3xl font-bold text-[#0A1A3F]">R0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Basic feed access</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Browse jobs & events</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 1 AI CV generation</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Network with students</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Message admins</li>
          </ul>
          <div className="mt-6">
            {isPremium ? (
              <Button variant="outline" className="w-full" disabled>Current: Premium</Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>Current Plan</Button>
            )}
          </div>
        </div>

        {/* Premium plan */}
        <div className={cn("bg-gradient-to-br from-[#0A1A3F] to-[#0A1A3F]/90 text-white rounded-xl p-6 shadow-lg border-2", isPremium ? "border-[#C8102E]" : "border-transparent")}>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-[#C8102E] fill-[#C8102E]" />
            <h2 className="font-bold">Premium</h2>
          </div>
          <div className="text-3xl font-bold">R49<span className="text-sm font-normal text-white/60">/month</span></div>
          <ul className="mt-4 space-y-2 text-sm">
            {PREMIUM_BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C8102E]" /> {b}</li>
            ))}
          </ul>
          <div className="mt-6">
            {isPremium ? (
              <Button className="w-full bg-[#C8102E] hover:bg-[#C8102E]/90" disabled>
                <Star className="w-4 h-4 mr-1 fill-white" /> Premium Active
              </Button>
            ) : (
              <Button onClick={upgrade} disabled={upgrading} className="w-full bg-[#C8102E] hover:bg-[#C8102E]/90">
                {upgrading ? "Upgrading..." : "Upgrade Now"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Payments are processed securely. Cancel anytime.
      </p>
    </div>
  );
}
