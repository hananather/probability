// Utility functions for quiz functionality

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate quiz grade based on percentage
 */
export function getGrade(percentage) {
  if (percentage >= 95) return 'A+';
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'B+';
  if (percentage >= 80) return 'B';
  if (percentage >= 75) return 'C+';
  if (percentage >= 70) return 'C';
  if (percentage >= 65) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Get performance message based on score
 */
export function getPerformanceMessage(percentage) {
  if (percentage === 100) return "Perfect Score! Outstanding work!";
  if (percentage >= 95) return "Excellent! You've mastered this material!";
  if (percentage >= 90) return "Great job! Strong understanding demonstrated.";
  if (percentage >= 85) return "Very good! You're doing well.";
  if (percentage >= 80) return "Good work! Keep it up.";
  if (percentage >= 75) return "Nice effort! Room for improvement.";
  if (percentage >= 70) return "You passed! Consider reviewing missed topics.";
  if (percentage >= 60) return "Almost there! More practice needed.";
  return "Don't give up! Review the material and try again.";
}

/**
 * Get color scheme based on performance
 */
export function getPerformanceColor(percentage) {
  if (percentage >= 90) return {
    bg: 'bg-green-900/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    accent: 'green'
  };
  if (percentage >= 75) return {
    bg: 'bg-teal-900/20',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    accent: 'teal'
  };
  if (percentage >= 60) return {
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    accent: 'blue'
  };
  if (percentage >= 50) return {
    bg: 'bg-orange-900/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    accent: 'orange'
  };
  return {
    bg: 'bg-red-900/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    accent: 'red'
  };
}

/**
 * Analyze quiz performance by topic
 */
export function analyzeTopicPerformance(questions, answers) {
  const topicStats = {};
  
  questions.forEach((question, index) => {
    const topic = question.topic || 'General';
    if (!topicStats[topic]) {
      topicStats[topic] = {
        total: 0,
        correct: 0,
        questions: []
      };
    }
    
    topicStats[topic].total++;
    topicStats[topic].questions.push(index + 1);
    
    if (answers[index]?.isCorrect) {
      topicStats[topic].correct++;
    }
  });
  
  // Calculate percentages and identify weak areas
  const results = Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    percentage: Math.round((stats.correct / stats.total) * 100),
    correct: stats.correct,
    total: stats.total,
    questions: stats.questions
  }));
  
  results.sort((a, b) => a.percentage - b.percentage);
  
  return {
    byTopic: results,
    weakestTopics: results.filter(r => r.percentage < 70),
    strongestTopics: results.filter(r => r.percentage >= 90)
  };
}

/**
 * Calculate estimated time per question
 */
export function calculateTimePerQuestion(timeSpent, totalQuestions) {
  const avgSeconds = Math.floor(timeSpent / totalQuestions);
  return formatTime(avgSeconds);
}

/**
 * Get study recommendations based on performance
 */
export function getStudyRecommendations(topicAnalysis, percentage) {
  const recommendations = [];
  
  if (percentage < 70) {
    recommendations.push({
      priority: 'high',
      message: 'Review all chapter materials before retaking the quiz',
      icon: '📚'
    });
  }
  
  topicAnalysis.weakestTopics.forEach(topic => {
    recommendations.push({
      priority: 'high',
      message: `Focus on ${topic.topic} (${topic.percentage}% correct)`,
      icon: '🎯',
      questions: topic.questions
    });
  });
  
  if (percentage >= 70 && percentage < 90) {
    recommendations.push({
      priority: 'medium',
      message: 'Practice more problems from the textbook exercises',
      icon: '✏️'
    });
  }
  
  if (percentage >= 90) {
    recommendations.push({
      priority: 'low',
      message: 'Excellent work! Consider helping others or moving to advanced topics',
      icon: '🌟'
    });
  }
  
  return recommendations;
}

/**
 * Check if user should get a badge/achievement
 */
export function checkAchievements(stats, percentage) {
  const achievements = [];
  
  if (percentage === 100) {
    achievements.push({
      name: 'Perfect Score',
      description: 'Scored 100% on a quiz',
      icon: '🏆',
      rarity: 'legendary'
    });
  }
  
  if (stats.totalAttempts === 1 && percentage >= 90) {
    achievements.push({
      name: 'First Try Master',
      description: 'Scored 90%+ on first attempt',
      icon: '⭐',
      rarity: 'epic'
    });
  }
  
  if (stats.totalAttempts >= 3 && percentage > stats.bestScore) {
    achievements.push({
      name: 'Persistent Learner',
      description: 'Improved score through multiple attempts',
      icon: '📈',
      rarity: 'rare'
    });
  }
  
  if (stats.averageTime < 60 && percentage >= 80) {
    achievements.push({
      name: 'Speed Demon',
      description: 'Completed quiz in under 1 minute per question with 80%+',
      icon: '⚡',
      rarity: 'rare'
    });
  }
  
  return achievements;
}

/**
 * Export quiz data for sharing or analysis
 */
export function exportQuizData(quizData, answers, results) {
  return {
    timestamp: new Date().toISOString(),
    quiz: {
      chapter: quizData.title,
      totalQuestions: quizData.questions.length,
      passingScore: quizData.passingScore
    },
    results: {
      score: results.score,
      percentage: results.percentage,
      timeSpent: results.timeSpent,
      passed: results.percentage >= quizData.passingScore
    },
    detailedAnswers: quizData.questions.map((q, i) => ({
      question: q.question,
      topic: q.topic,
      userAnswer: answers[i]?.answer,
      correct: answers[i]?.isCorrect,
      correctAnswer: q.correct
    }))
  };
}