"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores";
import { Button, Card, Input } from "@/components/ui";
import {
  Youtube,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const niches = [
  "Gaming",
  "Tech",
  "Education",
  "Lifestyle",
  "Fitness",
  "Cooking",
  "Travel",
  "Music",
  "Business",
  "Comedy",
  "Reviews",
  "Vlogs",
];

const experienceLevels = [
  {
    id: "beginner",
    title: "Complete Beginner",
    description: "I've never made a YouTube video before",
    icon: "🌱",
  },
  {
    id: "intermediate",
    title: "Some Experience",
    description: "I've made a few videos but want to grow",
    icon: "🌿",
  },
  {
    id: "advanced",
    title: "Experienced Creator",
    description: "I have an active channel and want better tools",
    icon: "🌳",
  },
];

const goals = [
  { id: "first_video", label: "Create my first video" },
  { id: "100_subs", label: "Reach 100 subscribers" },
  { id: "1000_subs", label: "Reach 1,000 subscribers" },
  { id: "monetize", label: "Get monetized (YPP)" },
  { id: "full_time", label: "Go full-time creator" },
  { id: "better_content", label: "Improve content quality" },
];

const frequencies = [
  { id: "daily", label: "Daily", description: "7+ videos/week" },
  { id: "weekly", label: "Weekly", description: "1-2 videos/week" },
  { id: "biweekly", label: "Bi-weekly", description: "2 videos/month" },
  { id: "monthly", label: "Monthly", description: "1 video/month" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useUserStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [channelName, setChannelName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string | null>(null);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 1:
        return channelName.trim().length > 0;
      case 2:
        return selectedNiche !== null;
      case 3:
        return experience !== null;
      case 4:
        return selectedGoals.length > 0;
      case 5:
        return frequency !== null;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    const supabase = createClient();

    // Save channel info
    await supabase.from("channels").insert({
      user_id: user?.id,
      channel_name: channelName,
      niche: selectedNiche,
    });

    // Update user profile
    await supabase
      .from("users")
      .update({
        onboarding_completed: true,
      })
      .eq("id", user?.id);

    completeOnboarding();
    router.push("/dashboard");
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-background-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Youtube className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">CreatorHub</span>
            </div>
          </div>

          {/* Step Content */}
          <Card className="p-8">
            {/* Step 1: Channel Name */}
            {step === 1 && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Youtube className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to CreatorHub!
                </h2>
                <p className="text-foreground-secondary mb-8">
                  Let&apos;s set up your channel. What&apos;s your channel name?
                </p>
                <Input
                  placeholder="e.g., TechWithJohn"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="text-center text-lg"
                />
                <p className="text-sm text-foreground-tertiary mt-2">
                  Don&apos;t worry, you can change this later
                </p>
              </div>
            )}

            {/* Step 2: Niche Selection */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">
                  What&apos;s your content niche?
                </h2>
                <p className="text-foreground-secondary text-center mb-8">
                  This helps us personalize your experience
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {niches.map((niche) => (
                    <button
                      key={niche}
                      onClick={() => setSelectedNiche(niche.toLowerCase())}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center transition-all",
                        selectedNiche === niche.toLowerCase()
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-foreground-tertiary"
                      )}
                    >
                      <span className="font-medium">{niche}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Experience Level */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">
                  What&apos;s your experience level?
                </h2>
                <p className="text-foreground-secondary text-center mb-8">
                  We&apos;ll tailor our guidance to your needs
                </p>
                <div className="space-y-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setExperience(level.id)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-4",
                        experience === level.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-foreground-tertiary"
                      )}
                    >
                      <span className="text-3xl">{level.icon}</span>
                      <div>
                        <p className="font-medium">{level.title}</p>
                        <p className="text-sm text-foreground-secondary">
                          {level.description}
                        </p>
                      </div>
                      {experience === level.id && (
                        <Check className="ml-auto h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Goals */}
            {step === 4 && (
              <div>
                <div className="flex justify-center mb-4">
                  <Target className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">
                  What are your goals?
                </h2>
                <p className="text-foreground-secondary text-center mb-8">
                  Select all that apply
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        selectedGoals.includes(goal.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-foreground-tertiary"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {selectedGoals.includes(goal.id) ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-foreground-tertiary" />
                        )}
                        <span className="font-medium">{goal.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Upload Frequency */}
            {step === 5 && (
              <div>
                <div className="flex justify-center mb-4">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">
                  How often will you upload?
                </h2>
                <p className="text-foreground-secondary text-center mb-8">
                  We&apos;ll help you stay on track
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {frequencies.map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => setFrequency(freq.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center transition-all",
                        frequency === freq.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-foreground-tertiary"
                      )}
                    >
                      <p className="font-medium">{freq.label}</p>
                      <p className="text-sm text-foreground-secondary">
                        {freq.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      i + 1 === step
                        ? "bg-primary"
                        : i + 1 < step
                        ? "bg-primary/50"
                        : "bg-background-tertiary"
                    )}
                  />
                ))}
              </div>

              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  isLoading={isLoading}
                  disabled={!canProceed()}
                  leftIcon={<Rocket className="h-4 w-4" />}
                >
                  Get Started
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
