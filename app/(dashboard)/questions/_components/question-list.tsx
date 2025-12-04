"use client";

import { useState, useMemo } from "react";
import { Question } from "@/lib/types";
import { QuestionCard } from "@/components/QuestionCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface QuestionListProps {
  initialQuestions: Question[];
  years: string[];
  categories: string[];
  solvedQuestionIds: Set<string>;
}

export function QuestionList({
  initialQuestions,
  years,
  categories,
  solvedQuestionIds,
}: QuestionListProps) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuestions = useMemo(() => {
    return initialQuestions.filter((question) => {
      const yearMatch =
        selectedYear === "all" || question.year === selectedYear;
      const categoryMatch =
        selectedCategory === "all" || question.category === selectedCategory;
      const difficultyMatch =
        selectedDifficulty === "all" ||
        question.difficulty === selectedDifficulty;
      const searchTermMatch =
        searchTerm === "" ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase());

      return (
        yearMatch && categoryMatch && difficultyMatch && searchTermMatch
      );
    });
  }, [
    initialQuestions,
    selectedYear,
    selectedCategory,
    selectedDifficulty,
    searchTerm,
  ]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search question content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedDifficulty}
          onValueChange={setSelectedDifficulty}
        >
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              isSolved={solvedQuestionIds.has(question.id)}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">
            No questions found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
}
