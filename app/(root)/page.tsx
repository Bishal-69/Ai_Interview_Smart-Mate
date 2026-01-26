import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewByUserId,
  getLatestInterview,
} from "@/lib/actions/general.action";
import { redirect } from "next/navigation";

const Homepage = async () => {
  const user = await getCurrentUser();

  // Add check for user before querying
  if (!user || !user.id) {
    redirect("/sign-in");
  }

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewByUserId(user.id),
    getLatestInterview({ userId: user.id }), // Will return max 6 random
  ]);

  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterviews = (latestInterviews?.length ?? 0) > 0;

  return (
    <div className="space-y-12">
      {/* Hero Section with Enhanced Visuals */}
      <section className="card-cta relative group">
        {/* Animated background gradient orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/15 rounded-full blur-[140px] animate-pulse delay-1000" />

        <div className="flex flex-col gap-8 max-w-2xl z-10 relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-200/10 border border-primary-200/30 rounded-full w-fit backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-200"></span>
            </span>
            <span className="text-sm font-medium text-primary-200">
              AI-Powered Interview Platform
            </span>
          </div>

          {/* Main Heading with Gradient */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight max-sm:text-4xl">
            <span className="bg-gradient-to-r from-white via-primary-200 to-purple-400 bg-clip-text text-transparent">
              Master Your Interview Skills
            </span>
            <br />
            <span className="text-white/90">With AI-Powered Practice</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-light-100/80 leading-relaxed max-w-xl">
            Experience realistic interview simulations powered by advanced AI.
            Get real-time feedback, improve your responses, and land your dream
            job.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 max-sm:flex-col max-sm:w-full">
            <Button asChild className="btn-primary group/btn">
              <Link href="/Interview" className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 transition-transform group-hover/btn:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                Start an Interview
              </Link>
            </Button>
            <Button asChild className="btn-secondary">
              <Link href="#your-interviews" className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View My Progress
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-4 max-sm:gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary-200">10K+</span>
              <span className="text-sm text-light-100/60">
                Interviews Completed
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary-200">95%</span>
              <span className="text-sm text-light-100/60">Success Rate</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary-200">4.9/5</span>
              <span className="text-sm text-light-100/60">User Rating</span>
            </div>
          </div>
        </div>

        {/* Robot Image with Enhanced Effects */}
        <div className="relative max-sm:hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-200/20 to-purple-500/20 rounded-full blur-3xl" />
          <Image
            src="/robot.png"
            alt="AI Interview Assistant"
            width={450}
            height={450}
            className="relative drop-shadow-2xl animate-float"
          />
        </div>
      </section>

      {/* Your Interviews Section */}
      <section id="your-interviews" className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-bold">Your Interviews</h2>
            <p className="text-light-100/60">
              Track your progress and review past performances
            </p>
          </div>
          {hasPastInterviews && (
            <Button asChild className="btn-secondary max-sm:hidden">
              <Link href="/Interview">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Interview
              </Link>
            </Button>
          )}
        </div>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                {...interview}
                key={interview.id}
                currentUserId={user.id}
                isOwner={true}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-8 card-border">
              <div className="card flex flex-col items-center gap-6 max-w-md text-center p-12">
                <div className="w-20 h-20 rounded-full bg-primary-200/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-primary-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold">No interviews yet</h3>
                <p className="text-light-100/60">
                  Start your first AI-powered interview to improve your skills
                  and track your progress.
                </p>
                <Button asChild className="btn-primary mt-4">
                  <Link href="/Interview">Start Your First Interview</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Available Interviews Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-bold">Available Interviews</h2>
            <p className="text-light-100/60">
              Choose from our curated interview challenges
            </p>
          </div>
        </div>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            latestInterviews?.map((interview) => (
              <InterviewCard
                {...interview}
                key={interview.id}
                currentUserId={user.id}
                isOwner={false}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-8 card-border">
              <div className="card flex flex-col items-center gap-6 max-w-md text-center p-12">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold">
                  No interviews available
                </h3>
                <p className="text-light-100/60">
                  Check back soon for new interview opportunities, or generate a
                  custom interview.
                </p>
                <Button asChild className="btn-primary mt-4">
                  <Link href="/Interview">Generate Custom Interview</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Homepage;
