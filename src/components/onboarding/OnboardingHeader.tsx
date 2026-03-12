import heroImage from "@/assets/onboarding-hero.png";
import { CalendarDays, Building2 } from "lucide-react";

interface OnboardingHeaderProps {
  employeeName: string;
  role: string;
  department: string;
  startDate: string;
  completedTasks: number;
  totalTasks: number;
}

export default function OnboardingHeader({
  employeeName,
  role,
  department,
  startDate,
  completedTasks,
  totalTasks,
}: OnboardingHeaderProps) {
  const progress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-hero shadow-primary">
      {/* Hero image */}
      <img
        src={heroImage}
        alt="Onboarding illustration"
        className="absolute right-0 top-0 h-full w-1/2 object-cover object-left opacity-20 pointer-events-none select-none"
      />

      <div className="relative z-10 px-8 py-10 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Welcome text */}
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber/20 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-amber uppercase">Onboarding in Progress</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Welcome aboard, {employeeName}! 👋
            </h1>
            <p className="mt-2 text-base text-primary-foreground/70">
              Let's get you set up and ready to make an impact.
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm text-primary-foreground/70">
                <Building2 className="h-4 w-4 text-amber" />
                <span>{role} · {department}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-primary-foreground/70">
                <CalendarDays className="h-4 w-4 text-amber" />
                <span>Start Date: {startDate}</span>
              </div>
            </div>
          </div>

          {/* Right: Progress ring */}
          <div className="flex flex-shrink-0 flex-col items-center gap-3">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="hsl(38 90% 52%)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-primary-foreground">{progress}%</span>
                <span className="text-xs text-primary-foreground/60">Complete</span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70">
              {completedTasks}/{totalTasks} tasks done
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
