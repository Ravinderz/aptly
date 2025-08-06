/**
 * Society Health Scoring System
 * 
 * Calculates health scores for societies based on multiple factors
 * to help community managers prioritize their attention and resources.
 */

export interface SocietyHealthMetrics {
  // Engagement Metrics
  activeResidents: number;
  totalResidents: number; 
  monthlyLogins: number;
  communityParticipation: number; // percentage
  
  // Issue Management
  openIssues: number;
  avgResolutionTime: number; // hours
  overdueIssues: number;
  issueEscalationRate: number; // percentage
  
  // Financial Health
  paymentComplianceRate: number; // percentage
  outstandingDues: number;
  budgetUtilization: number; // percentage
  
  // Communication & Governance
  announcementEngagement: number; // percentage
  votingParticipation: number; // percentage
  feedbackResponseTime: number; // hours
  
  // Maintenance & Services
  maintenanceCompliance: number; // percentage
  serviceRating: number; // 1-5 scale
  facilityUtilization: number; // percentage
  
  // Satisfaction Metrics
  residentSatisfactionScore: number; // 1-5 scale
  complaintResolutionSatisfaction: number; // 1-5 scale
  overallNPS: number; // Net Promoter Score
}

export interface HealthScoreWeights {
  engagement: number;
  issueManagement: number;
  financial: number;
  communication: number;
  maintenance: number;
  satisfaction: number;
}

export interface HealthScoreResult {
  overall: number;
  status: 'healthy' | 'attention_needed' | 'critical';
  breakdown: {
    engagement: number;
    issueManagement: number;
    financial: number;
    communication: number;
    maintenance: number;
    satisfaction: number;
  };
  recommendations: string[];
  trends: {
    direction: 'improving' | 'declining' | 'stable';
    changePercentage: number;
    period: string;
  };
}

// Default weights for different aspects of society health
const DEFAULT_WEIGHTS: HealthScoreWeights = {
  engagement: 0.20,        // 20% - Community participation and activity
  issueManagement: 0.25,   // 25% - How well issues are managed
  financial: 0.20,         // 20% - Financial health and compliance
  communication: 0.15,     // 15% - Communication effectiveness
  maintenance: 0.10,       // 10% - Maintenance and service quality
  satisfaction: 0.10,      // 10% - Overall resident satisfaction
};

/**
 * Calculate engagement score based on resident activity
 */
function calculateEngagementScore(metrics: SocietyHealthMetrics): number {
  const {
    activeResidents,
    totalResidents,
    monthlyLogins,
    communityParticipation,
  } = metrics;

  // Avoid division by zero
  if (totalResidents === 0) return 0;

  // Active resident ratio (0-40 points)
  const activeRatio = (activeResidents / totalResidents) * 40;

  // Login frequency score (0-30 points)
  const expectedLogins = totalResidents * 4; // 4 logins per resident per month expected
  const loginScore = Math.min((monthlyLogins / expectedLogins) * 30, 30);

  // Community participation score (0-30 points)
  const participationScore = (communityParticipation / 100) * 30;

  return Math.min(activeRatio + loginScore + participationScore, 100);
}

/**
 * Calculate issue management score
 */
function calculateIssueManagementScore(metrics: SocietyHealthMetrics): number {
  const {
    openIssues,
    avgResolutionTime,
    overdueIssues,
    issueEscalationRate,
  } = metrics;

  // Penalty for too many open issues (starts at 100, reduced by excess issues)
  const maxAcceptableIssues = Math.max(metrics.totalResidents * 0.1, 5); // 10% of residents or min 5
  const openIssuesPenalty = Math.max(0, (openIssues - maxAcceptableIssues) * 2);
  let score = Math.max(0, 100 - openIssuesPenalty);

  // Resolution time penalty (target: 48 hours)
  const targetResolutionTime = 48;
  if (avgResolutionTime > targetResolutionTime) {
    const timePenalty = ((avgResolutionTime - targetResolutionTime) / targetResolutionTime) * 20;
    score -= Math.min(timePenalty, 30);
  }

  // Overdue issues penalty
  const overduePenalty = (overdueIssues / Math.max(openIssues, 1)) * 25;
  score -= overduePenalty;

  // Escalation rate penalty (target: <10%)
  if (issueEscalationRate > 10) {
    const escalationPenalty = (issueEscalationRate - 10) * 2;
    score -= Math.min(escalationPenalty, 20);
  }

  return Math.max(score, 0);
}

/**
 * Calculate financial health score
 */
function calculateFinancialScore(metrics: SocietyHealthMetrics): number {
  const {
    paymentComplianceRate,
    outstandingDues,
    budgetUtilization,
    totalResidents,
  } = metrics;

  // Payment compliance (0-50 points)
  const complianceScore = (paymentComplianceRate / 100) * 50;

  // Outstanding dues penalty
  const avgDuesPerResident = totalResidents > 0 ? outstandingDues / totalResidents : 0;
  const acceptableDues = 5000; // ₹5000 per resident acceptable
  const duesPenalty = avgDuesPerResident > acceptableDues ? 
    Math.min(((avgDuesPerResident - acceptableDues) / acceptableDues) * 30, 30) : 0;

  // Budget utilization score (0-20 points) - optimal range 70-90%
  let budgetScore = 0;
  if (budgetUtilization >= 70 && budgetUtilization <= 90) {
    budgetScore = 20;
  } else if (budgetUtilization < 70) {
    budgetScore = (budgetUtilization / 70) * 20;
  } else {
    budgetScore = Math.max(0, 20 - ((budgetUtilization - 90) / 10) * 20);
  }

  return Math.max(complianceScore - duesPenalty + budgetScore, 0);
}

/**
 * Calculate communication effectiveness score
 */
function calculateCommunicationScore(metrics: SocietyHealthMetrics): number {
  const {
    announcementEngagement,
    votingParticipation,
    feedbackResponseTime,
  } = metrics;

  // Announcement engagement (0-40 points)
  const engagementScore = (announcementEngagement / 100) * 40;

  // Voting participation (0-30 points)
  const votingScore = (votingParticipation / 100) * 30;

  // Feedback response time (0-30 points) - target: 24 hours
  const targetResponseTime = 24;
  let responseScore = 30;
  if (feedbackResponseTime > targetResponseTime) {
    const timePenalty = ((feedbackResponseTime - targetResponseTime) / targetResponseTime) * 30;
    responseScore = Math.max(0, 30 - timePenalty);
  }

  return engagementScore + votingScore + responseScore;
}

/**
 * Calculate maintenance and services score
 */
function calculateMaintenanceScore(metrics: SocietyHealthMetrics): number {
  const {
    maintenanceCompliance,
    serviceRating,
    facilityUtilization,
  } = metrics;

  // Maintenance compliance (0-40 points)
  const complianceScore = (maintenanceCompliance / 100) * 40;

  // Service rating (0-30 points) - scale 1-5 to 0-30
  const ratingScore = ((serviceRating - 1) / 4) * 30;

  // Facility utilization (0-30 points) - optimal range 40-80%
  let utilizationScore = 0;
  if (facilityUtilization >= 40 && facilityUtilization <= 80) {
    utilizationScore = 30;
  } else if (facilityUtilization < 40) {
    utilizationScore = (facilityUtilization / 40) * 30;
  } else {
    utilizationScore = Math.max(0, 30 - ((facilityUtilization - 80) / 20) * 30);
  }

  return complianceScore + ratingScore + utilizationScore;
}

/**
 * Calculate satisfaction score
 */
function calculateSatisfactionScore(metrics: SocietyHealthMetrics): number {
  const {
    residentSatisfactionScore,
    complaintResolutionSatisfaction,
    overallNPS,
  } = metrics;

  // Resident satisfaction (0-40 points) - scale 1-5 to 0-40
  const satisfactionScore = ((residentSatisfactionScore - 1) / 4) * 40;

  // Complaint resolution satisfaction (0-30 points) - scale 1-5 to 0-30
  const resolutionScore = ((complaintResolutionSatisfaction - 1) / 4) * 30;

  // NPS score (0-30 points) - scale -100 to 100 to 0-30
  const npsScore = ((overallNPS + 100) / 200) * 30;

  return satisfactionScore + resolutionScore + npsScore;
}

/**
 * Generate recommendations based on score breakdown
 */
function generateRecommendations(breakdown: HealthScoreResult['breakdown']): string[] {
  const recommendations: string[] = [];

  if (breakdown.engagement < 60) {
    recommendations.push("Increase resident engagement through community events and digital platform promotion");
  }

  if (breakdown.issueManagement < 60) {
    recommendations.push("Implement faster issue resolution processes and improve communication about progress");
  }

  if (breakdown.financial < 60) {
    recommendations.push("Focus on payment collection and financial planning - consider automated reminders");
  }

  if (breakdown.communication < 60) {
    recommendations.push("Enhance communication channels and encourage more participation in governance");
  }

  if (breakdown.maintenance < 60) {
    recommendations.push("Improve maintenance scheduling and facility management processes");
  }

  if (breakdown.satisfaction < 60) {
    recommendations.push("Conduct resident surveys and address key satisfaction pain points");
  }

  // General recommendations based on overall patterns
  const avgScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0) / 6;
  
  if (avgScore < 50) {
    recommendations.unshift("Critical attention needed - consider assigning additional management resources");
  } else if (avgScore < 70) {
    recommendations.unshift("Schedule regular check-ins with community manager for improvement planning");
  }

  return recommendations;
}

/**
 * Determine health status based on overall score
 */
function determineHealthStatus(score: number): HealthScoreResult['status'] {
  if (score >= 75) return 'healthy';
  if (score >= 50) return 'attention_needed';
  return 'critical';
}

/**
 * Calculate comprehensive society health score
 */
export function calculateSocietyHealthScore(
  metrics: SocietyHealthMetrics,
  weights: HealthScoreWeights = DEFAULT_WEIGHTS,
  previousScore?: number
): HealthScoreResult {
  // Calculate individual component scores
  const breakdown = {
    engagement: calculateEngagementScore(metrics),
    issueManagement: calculateIssueManagementScore(metrics),
    financial: calculateFinancialScore(metrics),
    communication: calculateCommunicationScore(metrics),
    maintenance: calculateMaintenanceScore(metrics),
    satisfaction: calculateSatisfactionScore(metrics),
  };

  // Calculate weighted overall score
  const overall = Math.round(
    breakdown.engagement * weights.engagement +
    breakdown.issueManagement * weights.issueManagement +
    breakdown.financial * weights.financial +
    breakdown.communication * weights.communication +
    breakdown.maintenance * weights.maintenance +
    breakdown.satisfaction * weights.satisfaction
  );

  // Determine health status
  const status = determineHealthStatus(overall);

  // Generate recommendations
  const recommendations = generateRecommendations(breakdown);

  // Calculate trends if previous score is available
  let trends: HealthScoreResult['trends'] = {
    direction: 'stable',
    changePercentage: 0,
    period: 'last_30_days',
  };

  if (previousScore !== undefined) {
    const change = overall - previousScore;
    const changePercentage = previousScore > 0 ? Math.round((change / previousScore) * 100) : 0;
    
    trends = {
      direction: change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable',
      changePercentage: Math.abs(changePercentage),
      period: 'last_30_days',
    };
  }

  return {
    overall,
    status,
    breakdown,
    recommendations,
    trends,
  };
}

/**
 * Get sample health metrics for testing
 */
export function getSampleHealthMetrics(): SocietyHealthMetrics {
  return {
    activeResidents: 120,
    totalResidents: 150,
    monthlyLogins: 480,
    communityParticipation: 65,
    openIssues: 8,
    avgResolutionTime: 36,
    overdueIssues: 2,
    issueEscalationRate: 5,
    paymentComplianceRate: 92,
    outstandingDues: 125000,
    budgetUtilization: 78,
    announcementEngagement: 45,
    votingParticipation: 38,
    feedbackResponseTime: 18,
    maintenanceCompliance: 88,
    serviceRating: 4.2,
    facilityUtilization: 62,
    residentSatisfactionScore: 4.1,
    complaintResolutionSatisfaction: 3.8,
    overallNPS: 25,
  };
}

/**
 * Utility function to format health score for display
 */
export function formatHealthScore(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

/**
 * Get color for health score display
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 75) return '#059669'; // Green
  if (score >= 50) return '#d97706'; // Yellow/Orange
  return '#dc2626'; // Red
}