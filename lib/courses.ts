export type QuestionBank = {
  id: string;
  name: string;
  file: string;
  vendor: "ad-astra" | "quro";
  /** Baked in at build time; avoids parsing large JSON just for counts. */
  questionCount: number;
};

export type Course = {
  id: string;
  name: string;
  code: string;
  department: string;
  banks: QuestionBank[];
};

export const COURSES: Course[] = [
  {
    id: "cos325",
    name: "Machine Learning",
    code: "COS 325",
    department: "Computer Science",
    banks: [
      {
        id: "python_mcq",
        name: "Python MCQ",
        file: "./question-bank/cos325/python_mcq.json",
        vendor: "quro",
        questionCount: 1182,
      },
    ],
  },
  {
    id: "gst317",
    name: "Fundamentals of Christian Faith",
    code: "GST 317",
    department: "General Studies",
    banks: [
      {
        id: "chapter_1",
        name: "Chapter 1",
        file: "./question-bank/gst317/chapter_1.json",
        vendor: "quro",
        questionCount: 90,
      },
      {
        id: "chapter_2",
        name: "Chapter 2",
        file: "./question-bank/gst317/chapter_2.json",
        vendor: "quro",
        questionCount: 50,
      },
      {
        id: "chapter_3",
        name: "Chapter 3",
        file: "./question-bank/gst317/chapter_3.json",
        vendor: "quro",
        questionCount: 30,
      },
      {
        id: "chapter_4",
        name: "Chapter 4",
        file: "./question-bank/gst317/chapter_4.json",
        vendor: "quro",
        questionCount: 50,
      },
      {
        id: "chapter_5",
        name: "Chapter 5",
        file: "./question-bank/gst317/chapter_5.json",
        vendor: "quro",
        questionCount: 50,
      },
      {
        id: "chapter_6",
        name: "Chapter 6",
        file: "./question-bank/gst317/chapter_6.json",
        vendor: "quro",
        questionCount: 50,
      },
      {
        id: "chapter_7",
        name: "Chapter 7",
        file: "./question-bank/gst317/chapter_7.json",
        vendor: "quro",
        questionCount: 50,
      },
      {
        id: "chapter_8",
        name: "Chapter 8",
        file: "./question-bank/gst317/chapter_8.json",
        vendor: "quro",
        questionCount: 50,
      },
    ],
  },
  {
    id: "gst220",
    name: "Origins and Science",
    code: "GST 220",
    department: "General Studies",
    banks: [
      {
        id: "practice_bank",
        name: "Practice bank",
        file: "./question-bank/gst220/practice_bank.json",
        vendor: "quro",
        questionCount: 110,
      },
      {
        id: "mid_semester",
        name: "Mid Semester",
        file: "./question-bank/gst220/mid_semester.json",
        vendor: "quro",
        questionCount: 50,
      },
    ]
  },
  {
    id: "gst212",
    name: "Philosophy, Logic and Human Existence",
    code: "GST 212",
    department: "General Studies",
    banks: [
      {
        id: "mid_semester",
        name: "Midsemester",
        file: "./question-bank/gst212/mid_semester.json",
        vendor: "quro",
        questionCount: 84,
      },
      {
        id: "bank12",
        name: "Chapter 1",
        file: "./question-bank/gst212/bank12.json",
        vendor: "quro",
        questionCount: 424,
      },
      {
        id: "philosophy_2",
        name: "Chapter 2",
        file: "./question-bank/gst212/philosophy_2.json",
        vendor: "quro",
        questionCount: 82,
      },
      {
        id: "philosophy_3",
        name: "Chapter 3",
        file: "./question-bank/gst212/philosophy_3.json",
        vendor: "quro",
        questionCount: 606,
      },
      {
        id: "bank1",
        name: "Comprehensive Test on Propositions, Arguments, and Reasoning",
        file: "./question-bank/gst212/bank1.json",
        vendor: "ad-astra",
        questionCount: 84,
      },
      {
        id: "bank2",
        name: "QUESTIONS ON CATEGORICAL PROPOSITIONS",
        file: "./question-bank/gst212/bank2.json",
        vendor: "ad-astra",
        questionCount: 65,
      },
      {
        id: "bank3",
        name: "CHAPTER 3 - MAJOR BRANCHES OF PHILOSOPHY",
        file: "./question-bank/gst212/bank3.json",
        vendor: "ad-astra",
        questionCount: 26,
      },
      {
        id: "bank4",
        name: "CHAPTER 6 - LOGIC AND ITS RELEVANCE",
        file: "./question-bank/gst212/bank4.json",
        vendor: "ad-astra",
        questionCount: 49,
      },
      {
        id: "bank5",
        name: "THEROTICAL UNDERSTANDING OF CATEGORICAL PREPOSITION",
        file: "./question-bank/gst212/bank5.json",
        vendor: "ad-astra",
        questionCount: 25,
      },
      {
        id: "bank6",
        name: "Chapter 1",
        file: "./question-bank/gst212/bank6.json",
        vendor: "ad-astra",
        questionCount: 32,
      },
      {
        id: "bank7",
        name: "Chapter 2",
        file: "./question-bank/gst212/bank7.json",
        vendor: "ad-astra",
        questionCount: 12,
      },
      {
        id: "bank8",
        name: "Chapter 3",
        file: "./question-bank/gst212/bank8.json",
        vendor: "ad-astra",
        questionCount: 26,
      },
      {
        id: "bank9",
        name: "Chapter 4",
        file: "./question-bank/gst212/bank9.json",
        vendor: "ad-astra",
        questionCount: 15,
      },
      {
        id: "bank10",
        name: "Chapter 5",
        file: "./question-bank/gst212/bank10.json",
        vendor: "ad-astra",
        questionCount: 15,
      },
      {
        id: "bank11",
        name: "Chapter 6&7",
        file: "./question-bank/gst212/bank11.json",
        vendor: "ad-astra",
        questionCount: 59,
      }
    ],
  },
  {
    id: "gst200",
    name: "Communication in French",
    code: "GST 200",
    department: "General Studies",
    banks: [
      {
        id: "mid_semester",
        name: "Midsemester",
        file: "./question-bank/gst200/mid_semester.json",
        vendor: "quro",
        questionCount: 12,
      },
      {
        id: "french_main",
        name: "Question Bank for French",
        file: "./question-bank/gst200/french_main.json",
        vendor: "quro",
        questionCount: 100,
      },
      {
        id: "french_bank2",
        name: "Question Bank 2 for French",
        file: "./question-bank/gst200/french_bank2.json",
        vendor: "quro",
        questionCount: 100,
      },
    ]
  },
  {
    id: "mth202",
    name: "Elementary Differential Equations",
    code: "MTH 202",
    department: "Mathematics",
    banks: [
      {
        id: "25_26_midsemester",
        name: "25/26 Midsemester",
        file: "./question-bank/mth202/25_26_midsemester.json",
        vendor: "quro",
        questionCount: 15,
      },
      {
        id: "24_25_midsemester",
        name: "24/25 Midsemester",
        file: "./question-bank/mth202/24_25_midsemester.json",
        vendor: "quro",
        questionCount: 10,
      },
    ]
  },
  {
    id: "ift212",
    name: "Computer Architecture and Organisation",
    code: "IFT 212",
    department: "Computer Science",
    banks: [
      {
        id: "25_26_exam_a",
        name: "25/26 Final Exam A",
        file: "./question-bank/ift212/25_26_exam_a.json",
        vendor: "quro",
        questionCount: 30,
      },
      {
        id: "25_26_exam_b",
        name: "25/26 Final Exam B",
        file: "./question-bank/ift212/25_26_exam_b.json",
        vendor: "quro",
        questionCount: 40,
      }
    ]
  },
];

export function courseBanksPath(courseId: string): string {
  return `/courses/${courseId}`;
}

export function quizSessionPath(courseId: string, bankId: string): string {
  return `/courses/${courseId}/${bankId}`;
}

export function getCourseById(courseId: string): Course | undefined {
  return COURSES.find((c) => c.id === courseId);
}

export function getCourseAndBank(
  courseId: string,
  bankId: string,
): { course: Course; bank: QuestionBank } | undefined {
  const course = getCourseById(courseId);
  if (!course) return undefined;
  const bank = course.banks.find((b) => b.id === bankId);
  if (!bank) return undefined;
  return { course, bank };
}
