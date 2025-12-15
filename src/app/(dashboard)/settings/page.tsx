"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore, useUIStore } from "@/stores";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  CreditCard,
  Bell,
  Globe,
  Palette,
  Check,
  Crown,
} from "lucide-react";

const languages = [
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "ja", label: "日本語" },
];

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Asia/Seoul", label: "Seoul (KST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
];

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: [
      "3 scripts/month",
      "5 thumbnails/month",
      "Basic analytics",
      "Watermark on exports",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    features: [
      "20 scripts/month",
      "30 thumbnails/month",
      "60 min captions/month",
      "No watermark",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    popular: true,
    features: [
      "Unlimited scripts",
      "Unlimited thumbnails",
      "300 min captions/month",
      "Advanced analytics",
      "Competitor analysis",
      "Priority support",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "$49",
    features: [
      "Everything in Pro",
      "5 team members",
      "Unlimited captions",
      "API access",
      "Dedicated support",
    ],
  },
];

export default function SettingsPage() {
  const { user, setUser } = useUserStore();
  const { theme, setTheme } = useUIStore();

  const [name, setName] = useState(user?.name || "");
  const [language, setLanguage] = useState(user?.language || "en");
  const [timezone, setTimezone] = useState(user?.timezone || "America/New_York");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({
        name,
        language,
        timezone,
      })
      .eq("id", user.id);

    if (!error) {
      setUser({ ...user, name, language, timezone });
    }

    setIsSaving(false);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-foreground-secondary mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar size="xl">
                  {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                  <AvatarFallback>
                    {getInitials(user?.name || null, user?.email || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-xs text-foreground-tertiary mt-1">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input value={user?.email || ""} disabled />
                <p className="text-xs text-foreground-tertiary mt-1">
                  Contact support to change your email
                </p>
              </div>

              <Button onClick={handleSaveProfile} isLoading={isSaving}>
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Language
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Timezone
                  </label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveProfile} isLoading={isSaving}>
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-error/50">
            <CardHeader>
              <CardTitle className="text-error">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground-secondary mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold capitalize">
                      {user?.plan || "Free"}
                    </span>
                    {user?.plan === "pro" && (
                      <Crown className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <p className="text-sm text-foreground-secondary">
                    {user?.plan === "free"
                      ? "Upgrade to unlock more features"
                      : "Thanks for being a subscriber!"}
                  </p>
                </div>
                {user?.plan !== "free" && (
                  <Button variant="outline">Manage Subscription</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-primary ring-2 ring-primary/20"
                    : user?.plan === plan.id
                    ? "border-success"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-foreground-secondary">
                      /month
                    </span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-foreground-secondary"
                      >
                        <Check className="h-4 w-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={user?.plan === plan.id ? "outline" : "default"}
                    disabled={user?.plan === plan.id}
                  >
                    {user?.plan === plan.id ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                      theme === "dark"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-foreground-tertiary"
                    }`}
                  >
                    <div className="h-20 rounded bg-[#0F0F0F] mb-2" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                      theme === "light"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-foreground-tertiary"
                    }`}
                  >
                    <div className="h-20 rounded bg-white border border-gray-200 mb-2" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Bell className="h-5 w-5 inline mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: "email_updates",
                  label: "Email updates",
                  desc: "Receive tips and updates via email",
                },
                {
                  id: "script_complete",
                  label: "Script generation complete",
                  desc: "Get notified when AI finishes generating",
                },
                {
                  id: "weekly_report",
                  label: "Weekly analytics report",
                  desc: "Receive a summary of your channel performance",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-foreground-secondary">
                      {item.desc}
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
