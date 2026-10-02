import type { Difficulty, QuestionType } from "@/components/interview/difficulty-selector";

/** Built-in question bank for the quick /session page. */
export const QUICK_SESSION_QUESTIONS: Record<Difficulty, Record<QuestionType, string[]>> = {
  easy: {
    behavioral: [
      "Tell me about yourself and your background.",
      "Describe a time you worked in a team.",
      "What are your strengths?"
    ],
    technical: [
      "Explain what an API is.",
      "What is the difference between SQL and NoSQL?",
      "How do you debug code?"
    ],
    hr: [
      "Why do you want to work here?",
      "Where do you see yourself in 5 years?",
      "What motivates you?"
    ]
  },
  medium: {
    behavioral: [
      "Tell me about a time you overcame a major challenge.",
      "Describe a situation where you had to deal with conflicting priorities.",
      "Give an example of when you showed leadership."
    ],
    technical: [
      "Design a system to handle high traffic.",
      "Explain the difference between REST and GraphQL.",
      "How would you optimize a slow database query?"
    ],
    hr: [
      "How do you handle feedback?",
      "Describe your ideal work environment.",
      "Tell me about a time you failed."
    ]
  },
  hard: {
    behavioral: [
      "Tell me about your most complex project and your role in it.",
      "Describe a time you had to make a difficult decision with incomplete information.",
      "Give an example of when you had to adapt your approach mid-project."
    ],
    technical: [
      "Design a distributed system architecture for a social media platform.",
      "How would you build a real-time collaborative editor?",
      "Explain how you would scale a microservices architecture."
    ],
    hr: [
      "How do you balance innovation with shipping products?",
      "Tell me about a time you changed someone's mind.",
      "Describe your approach to mentoring junior developers."
    ]
  }
};
