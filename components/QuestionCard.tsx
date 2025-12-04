import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/lib/types";
import Link from "next/link";

interface QuestionCardProps {
  question: Question;
  isSolved: boolean;
}

export function QuestionCard({ question, isSolved }: QuestionCardProps) {
  return (
    <Link href={`/dashboard/${question.year}/${question.id}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>
              {question.year} - Q{question.question_number}
            </span>
            {isSolved && (
              <span className="text-green-500 text-sm font-medium">
                ✓ Solved
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {question.content}
          </p>
          <div className="flex gap-2 mt-4">
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{question.category}</span>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{question.difficulty}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
