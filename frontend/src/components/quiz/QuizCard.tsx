"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import type { QuizItem, QuizResult } from "@/lib/api";
import { submitAnswer } from "@/lib/api";

interface QuizCardProps {
  quiz: QuizItem;
  index: number;
  total: number;
}

export default function QuizCard({ quiz, index, total }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (answer: string) => {
    if (result) return; // 已提交
    setSelected(answer);
    setLoading(true);
    try {
      const res = await submitAnswer(quiz.id, answer);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getOptionLabel = (idx: number) => String.fromCharCode(65 + idx); // A, B, C, D

  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: "var(--accent-blue-dim)", color: "var(--accent-blue)" }}>
          {index + 1}/{total}
        </span>
        <span className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
          {quiz.question_type === "choice" ? "选择题" : quiz.question_type === "true_false" ? "判断题" : "填空题"}
        </span>
      </div>

      <p className="text-base mb-5 font-medium">{quiz.question}</p>

      {/* 选择题 */}
      {quiz.question_type === "choice" && quiz.options && (
        <div className="space-y-2">
          {quiz.options.map((opt, idx) => {
            const label = getOptionLabel(idx);
            const isSelected = selected === label;
            const isCorrect = result && result.correct_answer === label;
            const isWrong = result && isSelected && !result.correct;

            return (
              <button
                key={idx}
                onClick={() => handleSubmit(label)}
                disabled={!!result}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-left text-sm transition-all"
                style={{
                  backgroundColor: isCorrect ? "rgba(0,212,170,0.1)" : isWrong ? "rgba(255,107,107,0.1)" : "var(--bg-tertiary)",
                  border: `1px solid ${isCorrect ? "var(--accent-green)" : isWrong ? "var(--accent-red)" : "var(--border-color)"}`,
                  color: isCorrect ? "var(--accent-green)" : isWrong ? "var(--accent-red)" : "var(--text-primary)",
                }}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: isCorrect ? "var(--accent-green)" : isWrong ? "var(--accent-red)" : "var(--border-hover)",
                        color: isCorrect || isWrong ? "var(--bg-primary)" : "var(--text-muted)",
                      }}>
                  {label}
                </span>
                {opt}
                {isCorrect && <CheckCircle className="w-4 h-4 ml-auto" />}
                {isWrong && <XCircle className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </div>
      )}

      {/* 判断题 */}
      {quiz.question_type === "true_false" && (
        <div className="flex gap-3">
          {["对", "错"].map((opt) => {
            const isSelected = selected === opt;
            const isCorrect = result && result.correct_answer === opt;
            const isWrong = result && isSelected && !result.correct;

            return (
              <button
                key={opt}
                onClick={() => handleSubmit(opt)}
                disabled={!!result}
                className="flex-1 p-3 rounded-lg text-center font-medium transition-all"
                style={{
                  backgroundColor: isCorrect ? "rgba(0,212,170,0.1)" : isWrong ? "rgba(255,107,107,0.1)" : "var(--bg-tertiary)",
                  border: `1px solid ${isCorrect ? "var(--accent-green)" : isWrong ? "var(--accent-red)" : "var(--border-color)"}`,
                  color: isCorrect ? "var(--accent-green)" : isWrong ? "var(--accent-red)" : "var(--text-primary)",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* 填空题 */}
      {quiz.question_type === "fill" && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入答案..."
            className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: `1px solid ${result ? (result.correct ? "var(--accent-green)" : "var(--accent-red)") : "var(--border-color)"}`,
              color: "var(--text-primary)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !result) {
                handleSubmit((e.target as HTMLInputElement).value);
              }
            }}
            disabled={!!result}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (input) handleSubmit(input.value);
            }}
            disabled={!!result || loading}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}
          >
            提交
          </button>
        </div>
      )}

      {/* 结果反馈 */}
      {result && (
        <div className="mt-4 p-4 rounded-lg"
             style={{ backgroundColor: result.correct ? "rgba(0,212,170,0.05)" : "rgba(255,107,107,0.05)" }}>
          <div className="flex items-center gap-2 mb-2">
            {result.correct ? (
              <CheckCircle className="w-5 h-5" style={{ color: "var(--accent-green)" }} />
            ) : (
              <XCircle className="w-5 h-5" style={{ color: "var(--accent-red)" }} />
            )}
            <span className="font-medium" style={{ color: result.correct ? "var(--accent-green)" : "var(--accent-red)" }}>
              {result.correct ? "回答正确!" : `正确答案: ${result.correct_answer}`}
            </span>
          </div>
          {result.explanation && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{result.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
