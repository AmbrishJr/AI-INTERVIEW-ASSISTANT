import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Briefcase, Target, Zap, Users } from "lucide-react";

interface PracticeSetupProps {
  onSubmit: (setupData: {
    selectedDomain: string;
    experienceLevel: string;
    difficulty: string;
    questionType: string;
  }) => void;
}

const domains = [
  "Artificial Intelligence",
  "Data Science", 
  "Web Development",
  "Mobile App Development",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "Machine Learning",
  "UI/UX Design",
  "Software Engineering",
  "Blockchain",
  "IoT"
];

const experienceLevels = [
  "Student",
  "Fresher", 
  "1-3 Years",
  "3-5 Years",
  "5+ Years"
];

const difficulties = [
  "Easy",
  "Medium", 
  "Hard"
];

const questionTypes = [
  "Technical",
  "HR",
  "Other"
];

export default function PracticeSetup({ onSubmit }: PracticeSetupProps) {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!selectedDomain || !experienceLevel || !difficulty || !questionType) {
      setError("Please fill in all fields before proceeding.");
      return;
    }
    setError("");
    onSubmit({
      selectedDomain,
      experienceLevel,
      difficulty,
      questionType
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Practice Interview Setup
          </h1>
          <p className="text-muted-foreground text-lg">
            Customize your practice session with domain-specific questions tailored to your experience level
          </p>
        </div>

        {/* Setup Form */}
        <Card className="bg-card/60 backdrop-blur-md border-border p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Domain Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-foreground font-medium">
                <Briefcase className="w-4 h-4" />
                Domain of Interest
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full p-3 rounded-lg bg-card/10 border border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="" className="bg-card">Select your domain</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain} className="bg-card">
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-foreground font-medium">
                <Users className="w-4 h-4" />
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full p-3 rounded-lg bg-card/10 border border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="" className="bg-card">Select experience level</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level} className="bg-card">
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-foreground font-medium">
                <Target className="w-4 h-4" />
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 rounded-lg bg-card/10 border border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="" className="bg-card">Select difficulty</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff} className="bg-card">
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-foreground font-medium">
                <Zap className="w-4 h-4" />
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full p-3 rounded-lg bg-card/10 border border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="" className="bg-card">Select question type</option>
                {questionTypes.map((type) => (
                  <option key={type} value={type} className="bg-card">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-destructive-foreground text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg"
            >
              Start Practice Session
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-card/5 backdrop-blur-md border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-medium">12+ Domains</h3>
                <p className="text-muted-foreground text-sm">Industry-specific questions</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card/5 backdrop-blur-md border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-medium">3 Difficulty Levels</h3>
                <p className="text-muted-foreground text-sm">Tailored to your experience</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card/5 backdrop-blur-md border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground font-medium">AI-Powered</h3>
                <p className="text-muted-foreground text-sm">Dynamic question generation</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
