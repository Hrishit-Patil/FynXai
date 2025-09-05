# FynXai – Developing XAI Framework for Credit Scoring and Lending Decisions

## 📌 Project Overview

FynXai is a **responsible and transparent Explainable AI (XAI) framework** for the financial sector.  
It automates **credit scoring and loan approval decisions** by analyzing financial and identity documents, while providing **interpretable justifications** to ensure fairness, accountability, and trust in lending practices.

---

## 🛠 Tech Stack

### 🔹 Frontend

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Radix-based UI components)
- [React Router](https://reactrouter.com/)
- [TanStack React Query](https://tanstack.com/query/latest)

### 🔹 Backend

- **Python** (Flask / FastAPI / Django – depending on implementation)
- **OCR**: Tesseract / EasyOCR
- **NLP**: spaCy / HuggingFace Transformers
- **ML Models**: Scikit-learn, Regression-based models
- **Explainability**: SHAP, LIME

---

## 📂 Project Structure

```
.
├── backend/                    # Python backend (OCR, NLP, ML, XAI)
│   ├── venv/                   # Virtual environment (ignored in git)
│   └── requirements.txt
├── frontend/                   # React frontend (UI + Dashboard)
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

- **Node.js** (v18 or higher) for frontend
- **Python** (v3.8 or higher) for backend
- **Git** for cloning the repository
- Ensure you have a package manager like `npm` or `pnpm` installed

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/fynxai.git
cd fynxai
```

### 3️⃣ Backend Setup (Python)

```bash
cd backend

# Create and activate virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server (example, adjust based on your framework)
python app.py
```

_Note_: Ensure your backend server is configured to run (e.g., Flask, FastAPI, or Django). Update `app.py` or equivalent based on your setup.

### 4️⃣ Frontend Setup (Vite + React + TS + Tailwind + shadcn-ui)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

By default, Vite starts on 👉 [http://localhost:5173](http://localhost:5173)

### 5️⃣ Adding shadcn/ui Components

To add new `shadcn/ui` components to the project:

```bash
# Example: Add a Button component
npx shadcn-ui@latest add button

# Example: Add an Accordion component
npx shadcn-ui@latest add accordion
```

- Components are installed in `src/components/ui/` and are fully typed for TypeScript.
- Use the `shadcn-ui` CLI to browse available components: [https://ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components).

---

## 📜 License

This project is licensed under the **MIT License** – you are free to use and adapt it.
