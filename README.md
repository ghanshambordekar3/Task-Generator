# Tasks Generator

A mini planning tool to generate user stories and engineering tasks from feature ideas.

## Features

### ✅ Implemented
- Fill form with goal, users, constraints, template type, and risks
- Generate user stories and engineering tasks dynamically
- Edit tasks (double-click to edit)
- Reorder tasks (↑↓ buttons)
- Group tasks by category (Design, Setup, Development, Backend, Testing, Deployment)
- Export as markdown (copy to clipboard or download)
- Export as PDF (A4 format with justified text)
- View last 5 generated specs with history
- Risk/unknowns section
- System status page (backend, database, LLM health)
- Input validation and error handling
- Responsive UI with smooth animations

### ❌ Not Implemented
- Drag-and-drop task reordering (uses buttons instead)
- Persistent storage (uses in-memory storage)
- User authentication
- Real LLM integration (uses rule-based generation)
- Task grouping into custom phases
- Collaborative editing

## Setup & Run

### Prerequisites
- Python 3.7+
- Node.js 14+
- npm or yarn

### Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs on http://localhost:5000

### Frontend (React)
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

## Usage
1. Fill in the form with your feature details:
   - **Goal**: What you want to build
   - **Users**: Who will use it
   - **Constraints**: Any limitations or requirements
   - **Template**: Web App, Mobile App, or Internal Tool
   - **Risks/Unknowns**: Potential challenges (optional)
2. Click "Generate Tasks"
3. Review generated user stories and tasks
4. Double-click any task to edit
5. Use ↑↓ buttons to reorder tasks
6. Export using:
   - **Copy Markdown**: Copy to clipboard
   - **Download Markdown**: Save as .md file
   - **Download PDF**: Save as formatted PDF (A4)
7. Click on history items to reload previous specs
8. Click ⚙️ button (bottom-right) to view system status

## Project Structure
```
Task_Generator/
├── backend/
│   ├── app.py              # Flask API
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   └── index.js       # Entry point
│   ├── package.json       # Node dependencies
│   └── .env              # Environment config
├── README.md             # This file
├── AI_NOTES.md          # AI usage documentation
├── ABOUTME.md           # Developer information
└── PROMPTS_USED.md      # Development prompts
```

## API Endpoints

### POST /api/generate
Generate user stories and tasks
- **Body**: `{ goal, users, constraints, template, risks }`
- **Response**: `{ userStories: [], tasks: [], risks: "" }`

### GET /api/history
Get last 5 generated specs
- **Response**: Array of spec objects

### GET /api/health
Check system health
- **Response**: `{ backend, database, llm, timestamp }`

## Technologies Used

### Backend
- Flask 3.0.0
- Flask-CORS 4.0.0
- Python uuid, datetime

### Frontend
- React 19.2.4
- html2pdf.js 0.14.0
- CSS3 with animations

## Notes
- Uses in-memory storage (data lost on server restart)
- Rule-based task generation (no LLM API calls)
- Designed for single-user local development
- PDF export requires modern browser with canvas support
