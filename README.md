# OMR Exam Dashboard

A modern React + Vite application for managing OMR (Optical Mark Recognition) exam answer keys. Teachers can select a quiz, drag-and-drop answer options, enter numeric answers, bulk-import from text, and undo/redo changes.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── main.jsx                        # React entry point
├── App.jsx                         # Root component + routing between steps
├── index.css                       # Global styles + CSS variables
│
├── data/
│   └── quizzes.js                  # Mock quiz data, tag colours, bot responses
│
├── context/
│   └── AnswerKeyContext.jsx         # Global saved-answers state (React Context)
│
├── hooks/
│   ├── useDragDrop.js              # useDrag / useDrop — HTML5 drag API hooks
│   └── useAnswerKeyHistory.js      # Undo/redo state + Ctrl+Z/Y keyboard handler
│
├── utils/
│   └── validation.js               # validateMCQAnswer, validateAllQuestions,
│                                   # isValidNumeric, parseBulkImport
│
└── components/
    ├── ui/                         # Generic, reusable primitives
    │   ├── Button.jsx              # Multi-variant button
    │   ├── Badge.jsx               # Coloured status badge
    │   ├── ProgressBar.jsx         # Animated progress bar
    │   ├── Modal.jsx               # Backdrop modal with Escape-key support
    │   └── index.js
    │
    ├── TopBar/                     # Sticky header + breadcrumb + avatar
    │   ├── TopBar.jsx
    │   └── index.js
    │
    ├── QuizSelector/               # Step-1 quiz list
    │   ├── QuizSelector.jsx
    │   └── index.js
    │
    ├── TagSidebar/                 # Left panel — draggable A/B/C/D tags
    │   ├── TagSidebar.jsx
    │   ├── DraggableTag.jsx        # Single draggable option pill
    │   └── index.js
    │
    ├── AnswerKeySetup/             # Centre panel — question editor
    │   ├── AnswerKeySetup.jsx      # Orchestrator (header, progress, question list)
    │   ├── QuestionRow.jsx         # Single question row with drop target
    │   ├── MCQInput.jsx            # A / B / C / D clickable buttons
    │   ├── NumericInput.jsx        # Multi-answer numeric input + quick values
    │   ├── TagDropZone.jsx         # Drop-target pill showing assigned tag
    │   └── index.js
    │
    ├── BulkImportDialog/           # Modal for pasting answers in bulk
    │   ├── BulkImportDialog.jsx
    │   └── index.js
    │
    └── AIChatbot/                  # Right panel — help chatbot
        ├── AIChatbot.jsx
        └── index.js
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Quiz selection** | Choose from a list of OMR-configured quizzes |
| **MCQ input** | Click A / B / C / D buttons to set answer |
| **Drag & drop tags** | Drag coloured option pills from the left sidebar onto any MCQ row |
| **Numeric input** | Add multiple accepted answers; quick-value buttons; remove chips |
| **Undo / Redo** | Full history stack; `Ctrl+Z` / `Ctrl+Y` keyboard shortcuts |
| **Bulk import** | Paste answers in `1:A`, `1,A`, `1 A`, or sequential format |
| **Validation** | Required-field and format checks before save |
| **Progress bar** | Live count of answered questions |
| **AI chatbot** | Canned contextual help + quick-action chips |
| **Global context** | Saved answers persisted across quiz re-opens |

---

## 🛠 Tech Stack

- **React 18** — UI library
- **Vite 5** — build tool & dev server
- **lucide-react** — icon set
- **HTML5 Drag and Drop API** — no external DnD library needed

---

## 🔌 Extending the App

### Connect a real API
Replace the mock data in `src/data/quizzes.js` with API calls (e.g. `fetch`, React Query, SWR).

### Add routing
Install `react-router-dom` and wrap `<App>` with `<BrowserRouter>`. Each step (quiz list, setup) becomes its own route.

### Persist answers
Swap the in-memory `AnswerKeyContext` for a backend call inside `saveAnswers()`.

### Add more question types
Extend the `type` union in `QuestionRow` and add a new input component alongside `MCQInput` / `NumericInput`.
