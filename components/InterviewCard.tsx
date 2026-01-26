"use client";
import React from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  getFeedbackByInterviewId,
  deleteInterview,
} from "@/lib/actions/general.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InterviewCardProps {
  id?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  currentUserId?: string; // NEW
  isOwner?: boolean; // NEW
}

interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

const InterviewCard = ({
  id,
  userId,
  role,
  type,
  techstack,
  createdAt,
  currentUserId, // NEW
  isOwner = false, // NEW
}: InterviewCardProps) => {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [cover, setCover] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false); // NEW

  // Fetch feedback on client to avoid SSR mismatch
  React.useEffect(() => {
    const fetchFeedback = async () => {
      // MODIFIED: Check current user's feedback OR owner's feedback
      const userIdToFetch = currentUserId || userId;

      if (userIdToFetch && id) {
        const data = await getFeedbackByInterviewId({
          interviewId: id,
          userId: userIdToFetch,
        });
        setFeedback(data);
      }
    };
    fetchFeedback();

    // Set random cover only once on client
    setCover(getRandomInterviewCover());
  }, [id, userId, currentUserId]);

  // NEW: Delete handler
  const handleDelete = async () => {
    if (!id || !isOwner) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this interview? This action cannot be undone.",
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await deleteInterview(id);

      if (result.success) {
        toast.success("Interview deleted successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete interview");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const normalizedType = /mix/gi.test(type) ? "Mixed" : "Technical";

  // Use a fixed fallback date to avoid Date.now() mismatch
  const fallbackDate =
    feedback?.createdAt || createdAt || "2024-01-01T00:00:00Z";
  const formattedDate = dayjs(fallbackDate).format("MMM D, YYYY");

  const getScoreColor = (score: number | undefined) => {
    if (!score) return "text-light-400";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-orange-400";
  };

  const scoreColor = getScoreColor(feedback?.totalScore);

  return (
    <div className="card-border w-[380px] max-sm:w-full min-h-[420px] group hover:scale-[1.02] transition-all duration-300">
      <div className="card-interview relative">
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

        {/* NEW: Delete Button - Only show for owner */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-destructive-100/10 hover:bg-destructive-100/20 border border-destructive-100/30 transition-all duration-200 group/delete"
            title="Delete interview"
          >
            {isDeleting ? (
              <svg
                className="w-5 h-5 text-destructive-100 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-destructive-100 group-hover/delete:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        )}

        {/* Type Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="px-4 py-2 rounded-xl backdrop-blur-md bg-dark-200/80 border border-primary-200/30">
            <p className="badge-text text-primary-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-200 rounded-full animate-pulse"></span>
              {normalizedType}
            </p>
          </div>
        </div>

        <div className="relative z-10">
          {/* Interview Avatar with Glow */}
          <div className="relative w-fit">
            <div className="absolute inset-0 bg-primary-200/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            {cover && (
              <Image
                src={cover}
                alt="Interview Cover"
                width={100}
                height={100}
                className="relative rounded-full object-cover size-[100px] border-2 border-primary-200/50 group-hover:border-primary-200 transition-colors duration-300"
              />
            )}
          </div>

          {/* Title */}
          <h3 className="mt-6 capitalize text-2xl font-bold bg-gradient-to-r from-white to-light-100 bg-clip-text text-transparent">
            {role} Interview
          </h3>

          {/* Metadata */}
          <div className="flex flex-row gap-6 mt-4">
            {/* Date */}
            <div className="flex flex-row gap-2 items-center group/date">
              <div className="w-8 h-8 rounded-lg bg-primary-200/10 flex items-center justify-center group-hover/date:bg-primary-200/20 transition-colors">
                <Image
                  src="/calendar.svg"
                  alt="calendar"
                  width={18}
                  height={18}
                  className="opacity-80"
                />
              </div>
              <p className="text-sm text-light-100/80">{formattedDate}</p>
            </div>

            {/* Score */}
            <div className="flex flex-row gap-2 items-center group/score">
              <div className="w-8 h-8 rounded-lg bg-primary-200/10 flex items-center justify-center group-hover/score:bg-primary-200/20 transition-colors">
                <span className="text-lg">📊</span>
              </div>
              <p className={`text-sm font-bold ${scoreColor}`}>
                {feedback?.totalScore || "---"}/100
              </p>
            </div>
          </div>

          {/* Tech Stack Pills */}
          {techstack && techstack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {techstack.slice(0, 4).map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs font-medium bg-primary-200/10 text-primary-200 rounded-full border border-primary-200/30 backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
              {techstack.length > 4 && (
                <span className="px-3 py-1 text-xs font-medium bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/30">
                  +{techstack.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mt-5 p-4 rounded-xl bg-dark-300/50 border border-light-800/30 backdrop-blur-sm">
            <p className="line-clamp-3 text-sm text-light-100/70 leading-relaxed">
              {feedback?.finalAssessment ||
                "Ready to test your skills? Take this interview and receive detailed AI-powered feedback to improve your performance."}
            </p>
          </div>

          {/* Progress Bar for completed interviews */}
          {feedback?.totalScore && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-light-100/60">Performance</span>
                <span className={`font-bold ${scoreColor}`}>
                  {feedback.totalScore}%
                </span>
              </div>
              <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-200 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${feedback.totalScore}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-row justify-between mt-auto relative z-10">
          <Button asChild className="btn-primary w-full group/btn">
            <Link
              href={feedback ? `/Interview/${id}/feedback` : `/Interview/${id}`}
              className="flex items-center justify-center gap-2"
            >
              {feedback ? (
                <>
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  View Feedback
                  <svg
                    className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              ) : (
                <>
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
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Start Interview
                  <svg
                    className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
