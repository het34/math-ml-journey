# ∑ Math ML Journey

> A living portfolio of every exercise from **Mathematical Foundations of Machine Learning** (Udemy).  
> Push a notebook → GitHub Action syncs it → Vercel deploys it. Fully automatic.

**Live site:** `https://math-ml-journey.vercel.app`  
**Course:** [Mathematical Foundations of ML — Udemy](https://www.udemy.com/course/machine-learning-data-science-foundations-masterclass/)

---

## How it works

```
You (Colab)  →  GitHub  →  GitHub Action  →  Vercel  →  Live site
```

1. Complete an exercise in Google Colab
2. Fill in the metadata cell at the top (name, topic, level, description, tags)
3. `File → Save a copy in GitHub` — that's your only job
4. The GitHub Action wakes up automatically, parses your notebook, creates a history log, updates the exercise manifest
5. Vercel detects the new commit and redeploys the site in ~30 seconds

---

## Project structure

```
math-ml-journey/
│
├── .github/
│   └── workflows/
│       └── sync-exercises.yml        ← GitHub Action (write once, never touch again)
│
├── scripts/
│   └── sync_exercises.py             ← parses notebooks, writes history + manifest
│
├── notebooks/
│   ├── linear-algebra/               ← your .ipynb files go here
│   ├── calculus/
│   └── numpy-pytorch-tensorflow/
│
├── data/
│   └── exercises.json                ← auto-maintained master list (DO NOT edit manually)
│
├── history/
│   └── 2025-03-14_10-30_vectors.json ← one file per push, forever
│
├── app/
│   ├── page.tsx                      ← exercise list page
│   └── exercises/[slug]/
│       └── page.tsx                  ← exercise detail page
│
├── components/
│   ├── Navbar.tsx
│   ├── ExerciseCard.tsx
│   └── ExerciseList.tsx
│
├── lib/
│   └── exercises.ts                  ← reads data/exercises.json at build time
│
└── types/
    └── index.ts                      ← TypeScript interfaces
```

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/het34/math-ml-journey.git
cd math-ml-journey
npm install
npm run dev
```

### 2. Connect to Vercel

```bash
npm i -g vercel
vercel
```

Follow the prompts. Every push to `main` will auto-deploy.

### 3. Start your first exercise

Open the template notebook:

```
notebooks/linear-algebra/01_vectors_TEMPLATE.ipynb
```

Copy it into Colab, do your exercise, fill in the metadata cell at the top, then:

```
File → Save a copy in GitHub → pick your repo → notebooks/linear-algebra/01_my_exercise.ipynb
```

Done. The rest is automatic.

---

## Notebook metadata format

Every notebook **must** have this as its first cell (Raw type):

```
# @name: Vectors and Dot Products
# @topic: Linear Algebra
# @level: Beginner
# @description: Understanding vector operations and geometric intuition behind dot products.
# @tags: numpy, vectors, dot-product, linear-algebra
```

| Field         | Required | Options                                    |
|---------------|----------|--------------------------------------------|
| `@name`       | ✅ Yes   | Any string                                 |
| `@topic`      | ✅ Yes   | Linear Algebra, Calculus, NumPy, PyTorch…  |
| `@level`      | ✅ Yes   | `Beginner` / `Intermediate` / `Advanced`   |
| `@description`| ✅ Yes   | One sentence summary                       |
| `@tags`       | Optional | Comma-separated list                       |

> ⚠️ If `@name` is missing, the Action will skip the notebook silently.

---

## History files

Every push creates a timestamped JSON in `history/`:

```json
{
  "name": "Vectors and Dot Products",
  "topic": "Linear Algebra",
  "level": "Beginner",
  "description": "...",
  "tags": ["numpy", "vectors"],
  "snippet": "import numpy as np\n...",
  "notebookPath": "notebooks/linear-algebra/01_vectors.ipynb",
  "notebookUrl": "https://colab.research.google.com/github/...",
  "pushedAt": "2025-03-14T10:30:00Z",
  "commitSha": "a3f9c12"
}
```

This gives you a full audit trail of your learning — every push, every update, forever.

---

## Before pushing — checklist

- [ ] Metadata cell is the **first cell** in the notebook
- [ ] `@name` is filled in
- [ ] `Runtime → Run all` (so outputs are saved)
- [ ] `File → Save a copy in GitHub`

---

## Tech stack

| Layer       | Tool                  |
|-------------|-----------------------|
| Exercises   | Google Colab          |
| Automation  | GitHub Actions + Python |
| Frontend    | Next.js 14 + TypeScript |
| Styling     | Tailwind CSS          |
| Hosting     | Vercel (free tier)    |

---

*Built by [Het Tamboli](https://github.com/het34)*
