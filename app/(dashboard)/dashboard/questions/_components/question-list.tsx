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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, List, BrainCircuit, X } from "lucide-react";
import { formatYearDisplay } from "@/lib/yearFormatter";

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

  const resetFilters = () => {
    setSelectedYear("all");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSearchTerm("");
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Filter Questions
            </span>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部年份</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {formatYearDisplay(year)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <List className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
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
                <BrainCircuit className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部难度</SelectItem>
                <SelectItem value="easy">简单</SelectItem>
                <SelectItem value="normal">普通</SelectItem>
                <SelectItem value="hard">困难</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <div className="text-sm text-muted-foreground mb-4">
          Showing <span className="font-bold text-foreground">{filteredQuestions.length}</span> of <span className="font-bold text-foreground">{initialQuestions.length}</span> questions.
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
            <div className="col-span-full text-center py-16">
              <p className="text-lg font-medium text-muted-foreground">
                No questions found.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
