"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  Settings,
  Home,
  KeyRound,
  Activity,
  Brain,
  Layers,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/access-codes", label: "Access Codes", icon: KeyRound },
  { href: "/admin/user-activity", label: "Activity", icon: Activity },
  { href: "/admin/retention", label: "Retention", icon: Brain },
  { href: "/admin/retention/users", label: "RL Users", icon: Layers },
  { href: "/admin/retention/segments", label: "Segments", icon: BarChart3 },
  { href: "/admin/retention/config", label: "Policy Config", icon: Sliders },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-56 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/rumi_logo.png"
              alt="Rumi"
              width={303}
              height={101}
              className="h-[20px] w-auto"
            />
            <span className="text-sm font-bold text-yellow-400">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-800 text-yellow-400 border-r-2 border-yellow-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          {/* External link to full retention dashboard */}
          {process.env.NEXT_PUBLIC_RETENTION_DASHBOARD_URL && (
            <a
              href={process.env.NEXT_PUBLIC_RETENTION_DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Full Dashboard
            </a>
          )}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-700 text-gray-400 hover:text-yellow-400 hover:border-yellow-400"
            >
              Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
