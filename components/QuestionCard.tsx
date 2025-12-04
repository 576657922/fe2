import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/lib/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookCopy, BrainCircuit, CalendarDays, CheckCircle2 } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  isSolved: boolean;
}

const difficultyVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
  easy: "default",
  normal: "secondary",
  hard: "destructive",
};

export function QuestionCard({ question, isSolved }: QuestionCardProps) {
  return (
    <Link href={`/dashboard/questions/${question.year}/${question.id}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-200 group-hover:shadow-lg group-hover:border-primary">
        <CardHeader>
          <CardTitle className="text-lg leading-tight flex justify-between items-start">
            <span className="flex-1 pr-4">
              {question.year} - Q{question.question_number}
            </span>
            {isSolved && (
               <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Solved
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {question.content}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 pt-4 border-t">
          <Badge variant="outline" className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {question.year}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <BookCopy className="h-3 w-3" />
            {question.category}
          </Badge>
          <Badge variant={difficultyVariantMap[question.difficulty] || "secondary"}>
             <BrainCircuit className="h-3 w-3 mr-1" />
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}

