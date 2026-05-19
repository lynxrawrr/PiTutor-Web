"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createQuestion, createQuiz, createQuizCategory, deleteQuiz } from "@/lib/actions/quiz.actions";
import { COURSE_CATEGORIES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error";

type DraftQuestion = {
  prompt: string;
  explanation: string;
  options: string[];
  correctIndex: number;
};

const defaultOptions = ["", "", "", ""];

type QuizBuilderFormProps = {
  initialData?: {
    id: string;
    title: string;
    description: string;
    categoryName: string;
    categoryDescription: string;
    timeLimit: number;
    questions: DraftQuestion[];
  };
};

export function QuizBuilderForm({ initialData }: QuizBuilderFormProps) {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState(initialData?.categoryName ?? "");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit ?? 15);
  
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    initialData?.questions ?? [
      {
        prompt: "",
        explanation: "",
        options: [...defaultOptions],
        correctIndex: 0,
      }
    ]
  );
  
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addQuestion() {
    setQuestions([...questions, {
      prompt: "",
      explanation: "",
      options: [...defaultOptions],
      correctIndex: 0,
    }]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: keyof DraftQuestion, value: string | number | string[]) {
    setQuestions(questions.map((q, i) => i === index ? { ...q, [field]: value } : q));
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        if (initialData?.id) {
          await deleteQuiz(initialData.id);
        }

        const category = await createQuizCategory({
          name: categoryName,
          description: "", // Removed category description
        });
        const quiz = await createQuiz({
          categoryId: category.id,
          title,
          description,
          timeLimit,
        });
        
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await createQuestion({
            quizId: quiz.id,
            prompt: q.prompt,
            explanation: q.explanation,
            order: i + 1,
            options: q.options.map((option, index) => ({
              text: option,
              isCorrect: index === q.correctIndex,
            })),
          });
        }
        
        toast.success(initialData?.id ? "Quiz berhasil diperbarui!" : "Quiz berhasil dibuat!");
        router.push("/dashboard/admin/quizzes");
        router.refresh();
      } catch (error) {
        const msg = formatZodError(error);
        setMessage(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-slate-600">Kategori</span>
          <select
            required
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-600/5"
          >
            <option value="">Pilih Kategori</option>
            {COURSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        
        <label className="block">
          <span className="text-sm font-bold text-slate-600">Judul quiz</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500 transition focus:ring-4 focus:ring-blue-600/5"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-600">
            Deskripsi quiz
          </span>
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 min-h-40 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-blue-500 transition focus:ring-4 focus:ring-blue-600/5"
            placeholder="Tuliskan deskripsi lengkap kuis di sini..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-600">Batas Waktu (Menit)</span>
          <input
            required
            type="number"
            min={1}
            value={timeLimit}
            onChange={(event) => setTimeLimit(Number(event.target.value))}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500 transition focus:ring-4 focus:ring-blue-600/5"
          />
        </label>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="p-5 border border-slate-200 rounded-2xl relative bg-slate-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-slate-700">Soal {qIndex + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="size-5" />
                </button>
              )}
            </div>
            <label className="block">
              <span className="text-sm font-bold text-slate-600">Pertanyaan</span>
              <textarea
                required
                value={q.prompt}
                onChange={(event) => updateQuestion(qIndex, 'prompt', event.target.value)}
                className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-blue-500"
              />
            </label>

            <div className="space-y-3 mt-4">
              <span className="text-sm font-bold text-slate-600">
                Opsi jawaban
              </span>
              {q.options.map((option, optIndex) => (
                <label
                  key={optIndex}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <input
                    type="radio"
                    name={`correct-option-${qIndex}`}
                    checked={q.correctIndex === optIndex}
                    onChange={() => updateQuestion(qIndex, 'correctIndex', optIndex)}
                    className="size-4 accent-blue-600"
                  />
                  <input
                    required
                    value={option}
                    onChange={(event) => updateOption(qIndex, optIndex, event.target.value)}
                    className="h-10 min-w-0 flex-1 bg-transparent outline-none"
                    placeholder={`Opsi ${String.fromCharCode(65 + optIndex)}`}
                  />
                </label>
              ))}
            </div>

            <label className="block mt-4">
              <span className="text-sm font-bold text-slate-600">Pembahasan</span>
              <textarea
                value={q.explanation}
                onChange={(event) => updateQuestion(qIndex, 'explanation', event.target.value)}
                className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-blue-500"
              />
            </label>
          </div>
        ))}

        <Button type="button" variant="secondary" onClick={addQuestion} className="w-full border-dashed border-2 rounded-2xl">
          <Plus className="size-4 mr-2" /> Tambah Soal
        </Button>

        {message ? (
          <div className="flex items-start gap-2 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            {message}
          </div>
        ) : null}

        <Button type="submit" size="lg" className="w-full rounded-2xl shadow-xl shadow-blue-600/20" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-5" />
          )}
          {initialData ? "Simpan Perubahan" : "Simpan Quiz"}
        </Button>
      </div>
    </form>
  );
}
