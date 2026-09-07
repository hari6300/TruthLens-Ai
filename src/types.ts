export type CredibilityRating = 'VERIFIED_REAL' | 'LIKELY_REAL' | 'UNCERTAIN' | 'MISLEADING' | 'HIGHLY_DECEPTIVE';

export type DeepfakeVerdict = 'AUTHENTIC' | 'SUSPECTED_EDIT' | 'SYNTHETIC_AI' | 'HIGH_RISK_DEEPFAKE';

export type ContentCategory = 'SOCIAL_LINK' | 'IMAGE_DEEPFAKE' | 'VOICE_CLONE' | 'VIDEO_DEEPFAKE' | 'TEXT_DISINFO';

export interface ClaimVerification {
  claim: string;
  verdict: 'TRUE' | 'FALSE' | 'UNVERIFIED' | 'MISLEADING';
  explanation: string;
  sourceCitation?: string;
}

export interface ForensicArtifact {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'visual' | 'audio' | 'temporal' | 'metadata' | 'textual' | 'contextual';
  description: string;
  confidenceScore: number; // 0 - 100
}

export interface LinkAnalysisResult {
  id: string;
  timestamp: string;
  url: string;
  platform: string;
  title: string;
  authorHandle?: string;
  credibilityScore: number; // 0 - 100
  rating: CredibilityRating;
  clickbaitScore: number; // 0 - 100
  emotionalChargeScore: number; // 0 - 100
  domainTrustScore: number; // 0 - 100
  summary: string;
  keyClaims: ClaimVerification[];
  missingContext: string[];
  biasOrientation: 'Left-leaning' | 'Right-leaning' | 'Centrist/Neutral' | 'Sensationalist' | 'Unknown';
  detectedAnomalies: string[];
  recommendedAction: string;
  flagCount: number;
}

export interface DeepfakeAnalysisResult {
  id: string;
  timestamp: string;
  mediaType: 'image' | 'audio' | 'video';
  title: string;
  fileName?: string;
  previewUrl?: string;
  deepfakeProbability: number; // 0 - 100
  verdict: DeepfakeVerdict;
  confidence: number; // 0 - 100
  primaryModelDetected?: string; // e.g. "FLUX.1 / Midjourney v6" or "ElevenLabs / VoiceClone" or "Sora / Lipsync Deepfake"
  artifacts: ForensicArtifact[];
  technicalMetrics: {
    spectralInconsistency?: number; // 0 - 100
    facialLandmarkDistortion?: number; // 0 - 100
    lightingShadowCoherence?: number; // 0 - 100
    eyeBlinkingFrequency?: number; // 0 - 100
    vocalPitchVariation?: number; // 0 - 100
    compressionArtifactMismatch?: number; // 0 - 100
  };
  executiveSummary: string;
  forensicBreakdown: string[];
  suggestedCrossChecks: string[];
  flagCount: number;
  easyExplanation?: {
    simplifiedText: string;
    keyTakeaway: string;
    whyItMatters: string;
    bulletPoints: string[];
    audioScript: string;
    audioBase64?: string;
  };
}

export interface FlaggedItem {
  id: string;
  timestamp: string;
  contentTitle: string;
  contentUrl?: string;
  contentType: ContentCategory;
  userReason: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'PENDING_REVIEW' | 'FLAGGED_HIGH_RISK' | 'DEBUNKED' | 'VERIFIED_SAFE';
  flaggedBy: string;
  upvotes: number;
  downvotes: number;
  aiVerificationScore?: number;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  textContent?: string;
}

export interface DashboardStats {
  totalAnalyzed: number;
  flaggedCount: number;
  verifiedCount: number;
  averageCredibilityScore: number;
  highRiskDeepfakesCount: number;
  breakdownByCategory: {
    socialLinks: number;
    imageDeepfakes: number;
    voiceClones: number;
    videoDeepfakes: number;
  };
  threatDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  recentTrends: {
    date: string;
    totalScans: number;
    flaggedThreats: number;
    averageRisk: number;
  }[];
}

export interface SampleCase {
  id: string;
  type: 'link' | 'image' | 'audio' | 'video';
  title: string;
  subtitle: string;
  sourceUrl?: string;
  previewImage?: string;
  description: string;
  expectedScore: number;
  expectedVerdict: string;
  sampleInput: any;
}

export interface RecentSearchItem {
  id: string;
  query: string;
  title: string;
  trustScore: number; // 0 - 100
  rating?: string;
  type: 'link' | 'news' | 'deepfake' | 'query';
  timestamp: string;
  url?: string;
  category?: string;
  details?: string;
}
