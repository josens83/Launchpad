"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";
import {
  Home,
  FolderKanban,
  FileText,
  Image,
  Video,
  Search,
  BarChart3,
  Settings,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Crown,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Ideas", href: "/ideas", icon: Lightbulb },
  { name: "Scripts", href: "/scripts", icon: FileText },
  { name: "Thumbnails", href: "/thumbnails", icon: Image },
  { name: "Editor", href: "/editor", icon: Video },
  { name: "SEO Tools", href: "/seo", icon: Search },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background-secondary border-r border-border transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Youtube className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">CreatorHub</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebarCollapsed}
            className={cn(sidebarCollapsed && "mx-auto")}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upgrade CTA */}
        {!sidebarCollapsed && (
          <div className="px-4 py-4">
            <div className="rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-warning" />
                <span className="font-semibold text-sm">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-foreground-secondary mb-3">
                Unlock unlimited scripts, thumbnails, and advanced features.
              </p>
              <Button size="sm" className="w-full">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="border-t border-border py-4">
          <ul className="space-y-1 px-2">
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
