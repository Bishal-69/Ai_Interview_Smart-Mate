"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Brain,
  Code,
  Users,
  GitMerge,
} from "lucide-react";

interface InterviewSetupFormProps {
  userId: string;
}

const InterviewSetupForm = ({ userId }: InterviewSetupFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    level: "Entry-level",
    techstack: "",
    type: "Mixed",
    amount: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userid: userId,
        }),
      });

      const data = await response.json();

      if (data.success || data.sucess) {
        // Note: API has typo "sucess"
        alert("✅ Interview created successfully!");
        router.push("/");
        router.refresh();
      } else {
        alert("❌ Failed to create interview. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseInt(value) : value,
    }));
  };

  const interviewTypeOptions = [
    {
      value: "Mixed",
      label: "Mixed (Both Technical & Behavioral)",
      icon: Brain,
      description: "Best overall preparation",
    },
    {
      value: "Technical",
      label: "Technical Only",
      icon: Code,
      description: "Coding & problem solving",
    },
    {
      value: "Behavioral",
      label: "Behavioral Only",
      icon: Users,
      description: "Soft skills & experience",
    },
  ];

  return (
    <>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="card-border">
        <div className="card p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Job Role */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-light-100">
                Job Role <span className="text-primary-200">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-light-100/40">
                  <GitMerge className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g., Frontend Developer, Data Scientist, Backend Engineer"
                  className="w-full pl-12 pr-4 py-4 bg-dark-300/50 border border-light-800/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200/50 focus:border-primary-200/50 text-light-100 placeholder-light-100/40 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-light-100">
                Experience Level <span className="text-primary-200">*</span>
              </label>
              <div className="relative">
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-dark-300/50 border border-light-800/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200/50 focus:border-primary-200/50 text-light-100 appearance-none cursor-pointer transition-all duration-300"
                  required
                >
                  <option value="Entry-level">Entry-level (0-2 years)</option>
                  <option value="Mid-level">Mid-level (3-5 years)</option>
                  <option value="Senior-level">Senior-level (5+ years)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-light-100/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-light-100">
                Tech Stack <span className="text-primary-200">*</span>
              </label>
              <textarea
                name="techstack"
                value={formData.techstack}
                onChange={handleChange}
                placeholder="e.g., React, TypeScript, Node.js, MongoDB, AWS"
                rows={3}
                className="w-full px-4 py-4 bg-dark-300/50 border border-light-800/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200/50 focus:border-primary-200/50 resize-none text-light-100 placeholder-light-100/40 transition-all duration-300"
                required
              />
              <p className="text-xs text-light-100/50 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Separate multiple technologies with commas
              </p>
            </div>

            {/* Interview Type - Enhanced Cards */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-light-100">
                Interview Focus <span className="text-primary-200">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviewTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.type === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: option.value })
                      }
                      className={`relative px-5 py-6 rounded-xl border-2 transition-all duration-300 text-center group ${
                        isSelected
                          ? "border-primary-200 bg-primary-200/10 shadow-lg shadow-primary-200/20"
                          : "border-light-800/30 bg-dark-300/30 hover:border-light-800/50 hover:bg-dark-300/50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={`p-3 rounded-lg transition-colors ${
                            isSelected
                              ? "bg-primary-200/20"
                              : "bg-dark-300/50 group-hover:bg-dark-300"
                          }`}
                        >
                          <Icon
                            className={`w-7 h-7 ${isSelected ? "text-primary-200" : "text-light-100/40"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-semibold mb-1 ${isSelected ? "text-primary-200" : "text-light-100"}`}
                          >
                            {option.value}
                          </div>
                          <div className="text-xs text-light-100/50">
                            {option.description}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-primary-200">
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Number of Questions - Enhanced Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-light-100">
                  Number of Questions{" "}
                  <span className="text-primary-200">*</span>
                </label>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary-200 to-purple-400 bg-clip-text text-transparent">
                  {formData.amount}
                </span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="3"
                  max="15"
                  className="w-full h-2 bg-dark-300 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(34 211 238) 0%, rgb(34 211 238) ${((formData.amount - 3) / 12) * 100}%, rgb(30 41 59) ${((formData.amount - 3) / 12) * 100}%, rgb(30 41 59) 100%)`,
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-light-100/50">
                  <span>3</span>
                  <span>15</span>
                </div>
              </div>

              <p className="text-xs text-light-100/50 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Choose between 3-15 questions (recommended: 5-10)
              </p>
            </div>

            {/* Submit Button - Enhanced */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-6 text-base font-semibold relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-200/20 to-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                {loading ? (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating Interview Questions...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    Generate Interview
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
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
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default InterviewSetupForm;
