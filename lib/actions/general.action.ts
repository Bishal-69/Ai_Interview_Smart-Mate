"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  return interview.data() as Interview | null;
}

// MODIFIED: Added shuffle and limit to 6
export async function getLatestInterview(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .get(); // Removed .limit() to get all, then shuffle

  // NEW: Shuffle and limit to 6
  const allInterviews = interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];

  const shuffled = allInterviews.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(6, shuffled.length));
}

export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

// NEW: Delete interview function
export async function deleteInterview(interviewId: string) {
  try {
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    
    if (!interviewDoc.exists) {
      return {
        success: false,
        message: "Interview not found"
      };
    }

    const feedbackQuery = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    const batch = db.batch();
    
    feedbackQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    batch.delete(db.collection("interviews").doc(interviewId));
    
    await batch.commit();

    console.log(`✅ Deleted interview ${interviewId} and ${feedbackQuery.docs.length} feedback documents`);

    return {
      success: true,
      message: "Interview deleted successfully"
    };
  } catch (error) {
    console.error("❌ Error deleting interview:", error);
    return {
      success: false,
      message: "Failed to delete interview"
    };
  }
}

// ============================================
// ML MODEL INTEGRATION
// ============================================

interface MLModelResponse {
  ml_score: number;
}

async function getMLPrediction(
  interviewData: string,
  role: string = "Software Engineer",
  level: string = "Mid-level"
): Promise<MLModelResponse> {
  try {
    const ML_API_URL = process.env.ML_MODEL_API_URL || "http://localhost:8000";
    
    console.log("🔵 Calling ML Model API at:", ML_API_URL);
    
    const response = await fetch(`${ML_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interview_data: interviewData,
        role: role,
        level: level,
      }),
    });

    if (!response.ok) {
      console.error("❌ ML API error:", response.status);
      throw new Error(`ML API returned status ${response.status}`);
    }
 
    const data = await response.json();
    console.log("✅ ML Model response:", data);
    return { ml_score: data.ml_score };
  } catch (error) {
    console.error("⚠️ ML Model API unavailable:", error);
    return { ml_score: 0 };
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  try {
    console.log("🔍 DEBUG: Transcript Analysis");
    console.log("  Total messages:", transcript.length);
    console.log("  First 3 messages:", transcript.slice(0, 3));
    console.log("  Last 3 messages:", transcript.slice(-3));
    
    const userMessages = transcript.filter(msg => msg.role === "user");
    const assistantMessages = transcript.filter(msg => msg.role === "assistant");
    
    console.log("  User messages:", userMessages.length);
    console.log("  Assistant messages:", assistantMessages.length);
    
    const userTranscriptOnly = userMessages
      .map(msg => msg.content)
      .join(" ");
    
    console.log("  User transcript length:", userTranscriptOnly.length);
    console.log("  User transcript (first 200 chars):", userTranscriptOnly.substring(0, 200));
    
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    console.log("🟢 Calling Gemini API...");

    const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
      Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    console.log("✅ Gemini Score:", totalScore);

    console.log("🟢 Calling ML Model...");
    
    const interview = await getInterviewById(interviewId);
    const actualRole = interview?.role || "Software Engineer";
    const actualLevel = interview?.level || "Mid-level";
    
    console.log("📤 Sending to ML Model:");
    console.log("  Transcript length for ML:", userTranscriptOnly.length);
    console.log("  First 150 chars:", userTranscriptOnly.substring(0, 150));
    
    const mlResult = await getMLPrediction(userTranscriptOnly, actualRole, actualLevel);
    const mlScore = mlResult.ml_score;

    const difference = Math.abs(totalScore - mlScore);
    let agreementLevel = "unavailable";
    let confidence = "ML validation unavailable";

    if (mlScore > 0) {
      const bothVeryLow = totalScore < 40 && mlScore < 40;
      const bothVeryHigh = totalScore > 85 && mlScore > 85;
      
      if (bothVeryLow) {
        if (difference <= 8) {
          agreementLevel = "Critical Concern";
          confidence = "Both systems detect major issues ⚠️";
        } else {
          agreementLevel = "Divergent Low Scores";
          confidence = "Review Required ⚠️";
        }
      } else if (bothVeryHigh) {
        if (difference <= 5) {
          agreementLevel = "Excellent Consensus";
          confidence = "High Confidence ✓✓";
        } else {
          agreementLevel = "Strong Performance";
          confidence = "Reliable Assessment ✓";
        }
      } else {
        if (difference <= 5) {
          agreementLevel = "Strong Agreement";
          confidence = "High Confidence ✓✓";
        } else if (difference <= 10) {
          agreementLevel = "Good Agreement";
          confidence = "Acceptable ✓";
        } else if (difference <= 15) {
          agreementLevel = "Moderate Agreement";
          confidence = "Review Recommended ~";
        } else {
          agreementLevel = "Divergent Scores";
          confidence = "Human Review Required !";
        }
      }
    }

    console.log("📊 Score Comparison:");
    console.log("  Gemini Score:", totalScore);
    console.log("  ML Score:", mlScore);
    console.log("  Difference:", difference);
    console.log("  Agreement:", agreementLevel);

    const feedbackData = {
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString(),
      
      ml_score: mlScore,
      gemini_score: totalScore,
      agreement_level: agreementLevel,
      difference: difference,
      confidence: confidence,
      
      debug_transcript_length: transcript.length,
      debug_user_responses: userMessages.length,
    };

    const feedbackRef = await db.collection('feedback').add(feedbackData);

    console.log("✅ Feedback saved with ID:", feedbackRef.id);

    return {
      success: true,
      feedbackId: feedbackRef.id
    };

  } catch(e) {
    console.error('❌ Error saving Feedback:', e);
    return { success: false };
  }
}


export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const feedbackQuery = await db.collection('feedback')
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();
  
  if (feedbackQuery.empty) return null;

  const feedbackDoc = feedbackQuery.docs[0];
  const feedbackData = feedbackDoc.data();
  
  return { 
    id: feedbackDoc.id, 
    ...feedbackData,
    ml_score: feedbackData.ml_score || 0,
    gemini_score: feedbackData.gemini_score || feedbackData.totalScore || 0,
    agreement_level: feedbackData.agreement_level || "unavailable",
    difference: feedbackData.difference || 0,
    confidence: feedbackData.confidence || "",
  } as Feedback;
}