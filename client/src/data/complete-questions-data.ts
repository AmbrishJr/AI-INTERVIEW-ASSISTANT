import { questionsData } from './questions-data';
import { additionalDomains } from './additional-domains';

// Type definitions for the questions structure
type QuestionType = 'Technical' | 'HR' | 'Other';
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Questions = {
  [key: string]: {
    [key in QuestionType]: {
      [key in Difficulty]: string[];
    };
  };
};

// Merge all domains into a complete questions dataset
export const completeQuestionsData: Questions = {
  ...questionsData,
  ...additionalDomains
};

// Utility function to get questions based on domain, type, and difficulty
export const getQuestions = (domain: string, questionType: QuestionType, difficulty: Difficulty): string[] => {
  try {
    const domainData = completeQuestionsData[domain];
    if (!domainData) {
      console.warn(`Domain "${domain}" not found`);
      return [];
    }
    
    const typeData = domainData[questionType];
    if (!typeData) {
      console.warn(`Question type "${questionType}" not found in domain "${domain}"`);
      return [];
    }
    
    const difficultyData = typeData[difficulty];
    if (!difficultyData) {
      console.warn(`Difficulty "${difficulty}" not found in domain "${domain}" for type "${questionType}"`);
      return [];
    }
    
    return difficultyData;
  } catch (error) {
    console.error('Error getting questions:', error);
    return [];
  }
};

// Utility function to shuffle questions randomly
export const shuffleQuestions = (questions: string[]) => {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Utility function to get a subset of questions (e.g., first 20)
export const getQuestionSubset = (questions: string[], count: number = 20) => {
  return questions.slice(0, Math.min(count, questions.length));
};

// Get all available domains
export const getAvailableDomains = () => {
  return Object.keys(completeQuestionsData);
};

// Get available question types for a domain
export const getAvailableQuestionTypes = (domain: string): QuestionType[] => {
  const domainData = completeQuestionsData[domain];
  return domainData ? (Object.keys(domainData) as QuestionType[]) : [];
};

// Get available difficulties for a domain and type
export const getAvailableDifficulties = (domain: string, questionType: QuestionType): Difficulty[] => {
  const domainData = completeQuestionsData[domain];
  if (!domainData) return [];
  
  const typeData = domainData[questionType];
  return typeData ? (Object.keys(typeData) as Difficulty[]) : [];
};

// AI Question Generation Engine Simulation
// This simulates AI-generated questions based on user-selected parameters using structured datasets
export const generateQuestions = (
  domain: string, 
  questionType: QuestionType, 
  difficulty: Difficulty, 
  count: number = 20
): string[] => {
  // Get the base questions from our structured dataset
  const baseQuestions = getQuestions(domain, questionType, difficulty);
  
  if (baseQuestions.length === 0) {
    // Fallback questions if no specific domain questions found
    return getFallbackQuestions(questionType, difficulty, count);
  }
  
  // Shuffle the questions to simulate AI randomization
  const shuffledQuestions = shuffleQuestions(baseQuestions);
  
  // Return the requested number of questions
  return getQuestionSubset(shuffledQuestions, count);
};

// Fallback questions when specific domain questions are not available
const getFallbackQuestions = (questionType: QuestionType, difficulty: Difficulty, count: number): string[] => {
  const fallbackQuestions: Record<QuestionType, Record<Difficulty, string[]>> = {
    Technical: {
      Easy: [
        "What is your experience with programming languages?",
        "Explain a technical concept you're familiar with.",
        "Describe a technical challenge you've overcome.",
        "What development tools do you prefer?",
        "How do you approach technical problem-solving?"
      ],
      Medium: [
        "Describe a complex technical project you've worked on.",
        "How do you approach system design challenges?",
        "What's your experience with technical architecture?",
        "How do you handle technical debt?",
        "Describe your approach to technical innovation."
      ],
      Hard: [
        "Design a technical solution for a complex business problem.",
        "How would you scale a technical system globally?",
        "Describe your approach to technical leadership.",
        "How do you handle technical trade-offs?",
        "What's your vision for technical innovation?"
      ]
    },
    HR: {
      Easy: [
        "Tell me about yourself.",
        "Why are you interested in this role?",
        "What are your strengths?",
        "How do you work in a team?",
        "Describe your work style."
      ],
      Medium: [
        "Describe a challenging work situation you've faced.",
        "How do you handle conflicts in the workplace?",
        "Tell me about a time you showed leadership.",
        "How do you approach professional development?",
        "Describe your ideal work environment."
      ],
      Hard: [
        "Describe your most complex professional achievement.",
        "How would you transform an organization's culture?",
        "What's your leadership philosophy?",
        "How do you drive innovation in teams?",
        "Describe your approach to strategic thinking."
      ]
    },
    Other: {
      Easy: [
        "Describe a creative solution you've developed.",
        "How do you approach problem-solving?",
        "What's an innovative idea you have?",
        "Describe a project you're proud of.",
        "How do you stay creative in your work?"
      ],
      Medium: [
        "Design a solution for a real-world problem.",
        "How would you approach social impact through your work?",
        "Describe an innovative approach to a common challenge.",
        "How do you balance creativity with practicality?",
        "What's your approach to sustainable innovation?"
      ],
      Hard: [
        "Design a solution for a global challenge.",
        "How would you drive systemic change through innovation?",
        "Describe your approach to transformative thinking.",
        "How would you address complex societal problems?",
        "What's your vision for future innovation?"
      ]
    }
  };
  
  const questions = fallbackQuestions[questionType]?.[difficulty] || fallbackQuestions.Technical.Easy;
  return getQuestionSubset(shuffleQuestions(questions), count);
};

// Export types for use in other components
export type { QuestionType, Difficulty, Questions };

export default completeQuestionsData;
