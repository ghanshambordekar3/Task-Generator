import React, { useState, useEffect } from 'react';
import './App.css';
import html2pdf from 'html2pdf.js';

function App() {
  const [form, setForm] = useState({ goal: '', users: '', constraints: '', template: 'web', risks: '' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [health, setHealth] = useState(null);
  const [showStatus, setShowStatus] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/history`)
      .then(res => res.json())
      .then(setHistory)
      .catch(console.error);
    
    fetch(`${API_URL}/api/health`)
      .then(res => res.json())
      .then(setHealth)
      .catch(() => setHealth({ backend: 'error', database: 'error', llm: 'error' }));
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.goal.trim() || !form.users.trim()) {
      alert('Goal and Users are required fields');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to generate tasks');
        return;
      }
      
      const data = await res.json();
      setResult(data);
      setFlipped(true);
    } catch (err) {
      alert('Failed to connect to backend. Please ensure the server is running.');
    }
  };

  const updateTask = (id, text) => {
    setResult(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, text } : t)
    }));
    setEditingTask(null);
  };

  const moveTask = (id, direction) => {
    setResult(prev => {
      const tasks = [...prev.tasks];
      const idx = tasks.findIndex(t => t.id === id);
      if ((direction === 'up' && idx > 0) || (direction === 'down' && idx < tasks.length - 1)) {
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        [tasks[idx], tasks[newIdx]] = [tasks[newIdx], tasks[idx]];
      }
      return { ...prev, tasks };
    });
  };

  const exportMarkdown = () => {
    let md = `# Feature: ${form.goal}\n\n## User Stories\n`;
    result.userStories.forEach(s => md += `- ${s}\n`);
    md += `\n## Tasks\n`;
    const grouped = result.tasks.reduce((acc, t) => {
      if (!acc[t.group]) acc[t.group] = [];
      acc[t.group].push(t);
      return acc;
    }, {});
    Object.entries(grouped).forEach(([group, tasks]) => {
      md += `\n### ${group}\n`;
      tasks.forEach(t => md += `- [ ] ${t.text}\n`);
    });
    if (result.risks) md += `\n## Risks/Unknowns\n${result.risks}\n`;
    return md;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportMarkdown());
    alert('Copied to clipboard!');
  };

  const downloadMarkdown = () => {
    const blob = new Blob([exportMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${Date.now()}.md`;
    a.click();
  };

  const downloadPDF = () => {
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '12px';
    element.style.lineHeight = '1.6';
    element.style.textAlign = 'justify';
    
    let html = '<h1 style="font-size: 18px; margin-bottom: 15px; text-align: left;">Feature: ' + form.goal + '</h1>';
    
    html += '<h2 style="font-size: 14px; margin-top: 20px; margin-bottom: 10px; text-align: left;">User Stories</h2>';
    html += '<ul style="margin-left: 20px;">';
    result.userStories.forEach(story => {
      html += '<li style="margin-bottom: 8px;">' + story + '</li>';
    });
    html += '</ul>';
    
    html += '<h2 style="font-size: 14px; margin-top: 20px; margin-bottom: 10px; text-align: left;">Tasks</h2>';
    
    const grouped = result.tasks.reduce((acc, t) => {
      if (!acc[t.group]) acc[t.group] = [];
      acc[t.group].push(t);
      return acc;
    }, {});
    
    Object.entries(grouped).forEach(([group, tasks]) => {
      html += '<h3 style="font-size: 12px; margin-top: 15px; margin-bottom: 8px; font-weight: bold; text-align: left;">' + group + '</h3>';
      html += '<ul style="margin-left: 20px; list-style-type: none;">';
      tasks.forEach(task => {
        html += '<li style="margin-bottom: 6px;">[ ] ' + task.text + '</li>';
      });
      html += '</ul>';
    });
    
    if (result.risks) {
      html += '<h2 style="font-size: 14px; margin-top: 20px; margin-bottom: 10px; text-align: left;">Risks/Unknowns</h2>';
      html += '<p style="margin-bottom: 8px;">' + result.risks + '</p>';
    }
    
    element.innerHTML = html;
    
    const opt = {
      margin: 15,
      filename: 'tasks-' + Date.now() + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const resetForm = () => {
    setForm({ goal: '', users: '', constraints: '', template: 'web', risks: '' });
  };

  return (
    <div className="App">
      <style>{`
        body {
          background: #f0f2f5;
          font-family: 'Poppins', sans-serif;
          margin: 0;
        }
        .App {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
        }
        .flipper {
          display: grid;
          grid-template-columns: 1fr;
          perspective: 1000px;
        }
        .front, .back {
          grid-area: 1 / 1;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          width: 100%;
          box-sizing: border-box;
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          backface-visibility: hidden;
        }
        .front {
          opacity: 1;
          transform: scale(1) translateY(0);
          z-index: 2;
        }
        .back {
          opacity: 0;
          transform: scale(0.9) translateY(40px);
          z-index: 1;
          pointer-events: none;
        }
        .flipper.flipped .front {
          opacity: 0;
          transform: scale(0.9) translateY(-40px);
          pointer-events: none;
        }
        .flipper.flipped .back {
          opacity: 1;
          transform: scale(1) translateY(0);
          z-index: 2;
          pointer-events: auto;
        }
        input, select, textarea {
          border: 2px solid #eee;
          border-radius: 10px;
          padding: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 15px;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #23a6d5;
          box-shadow: 0 10px 20px rgba(35, 166, 213, 0.15);
          transform: scale(1.02);
          outline: none;
        }
        select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
          background-repeat: no-repeat;
          background-position: right 15px center;
          background-size: 16px;
          padding-right: 45px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #444;
        }
        button {
          background: linear-gradient(45deg, #2193b0, #6dd5ed);
          border: none;
          border-radius: 8px;
          color: white;
          padding: 10px 20px;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        button[type="submit"] {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(33, 147, 176, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(33, 147, 176, 0); }
          100% { box-shadow: 0 0 0 0 rgba(33, 147, 176, 0); }
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(33, 147, 176, 0.3);
        }
        .actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .refresh-btn {
          background: transparent;
          color: #aaa;
          border: 2px solid #eee;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          padding: 0;
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease, border-color 0.3s ease, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .refresh-btn:hover {
          color: #dadee0;
          border-color: #cdd2d4;
          transform: rotate(360deg);
        }
        .task {
          background: white;
          border-radius: 10px;
          padding: 15px;
          margin: 10px 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          transition: 0.2s;
          border-left: 4px solid #23a6d5;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .task:hover {
          transform: scale(1.01);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .task button {
          padding: 5px 10px;
          margin-left: 5px;
          font-size: 12px;
          border-radius: 4px;
        }
        .history h2 {
          margin-top: 15px;
          margin-bottom: 10px;
        }
        .history-item {
          background: rgba(255,255,255,0.5);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
          transition: 0.2s;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0px;
        }
        .history-item:hover {
          background: white;
          transform: translateX(5px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .history-item {
          margin-bottom: 0px;
        }
        .back-btn {
          background: white;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 30px;
          margin-bottom: 20px;
          padding: 10px 25px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          width: auto;
          font-weight: 500;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .back-btn:hover {
          background: #23a6d5;
          color: white;
          border-color: #23a6d5;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(35, 166, 213, 0.4);
        }
        .arrow {
          display: inline-block;
          transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .back-btn:hover .arrow {
          transform: translateX(-5px) scale(1.2);
        }
        .result {
          animation: slideUpFade 0.6s ease-out forwards;
        }
        .result li {
          text-align: justify;
        }
        .copyright {
          text-align: center;
          margin-top: 30px;
          color: #888;
          font-size: 14px;
        }
        .status-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: white;
          border: 2px solid #ddd;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: all 0.3s ease;
        }
        .status-btn:hover {
          transform: scale(1.1) rotate(90deg);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .status-panel {
          position: fixed;
          bottom: 80px;
          right: 20px;
          background: white;
          border-radius: 10px;
          padding: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
          min-width: 200px;
        }
        .status-item {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 14px;
        }
        .status-healthy { color: #28a745; }
        .status-error { color: #dc3545; }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className={`flipper ${flipped ? 'flipped' : ''}`}>
        <div className="front">
          <h1>Tasks Generator</h1>
          
          <form onSubmit={handleSubmit}>
            <label>Goal</label>
            <input value={form.goal} 
              onChange={e => setForm({...form, goal: e.target.value})} required />
            <label>Users</label>
            <input value={form.users}
              onChange={e => setForm({...form, users: e.target.value})} required />
            <label>Constraints</label>
            <input value={form.constraints}
              onChange={e => setForm({...form, constraints: e.target.value})} />
            <label>Template</label>
            <select value={form.template} onChange={e => setForm({...form, template: e.target.value})}>
              <option value="web">Web App</option>
              <option value="mobile">Mobile App</option>
              <option value="internal">Internal Tool</option>
            </select>
            <label>Risks/Unknowns</label>
            <textarea value={form.risks}
              onChange={e => setForm({...form, risks: e.target.value})} />
            <div className="actions">
              <button type="submit" style={{flex: 1}}>Generate Tasks</button>
              <button type="button" className="refresh-btn" onClick={resetForm} title="Reset Form">↻</button>
            </div>
          </form>

          {history.length > 0 && (
            <div className="history">
              <h2>Last 5 Specs</h2>
              {history.map(spec => (
                <div key={spec.id} className="history-item" onClick={() => {
                  setForm(spec.input);
                  setResult(spec.output);
                  setFlipped(true);
                }}>
                  <strong>{spec.input.goal}</strong>
                  <small>{new Date(spec.timestamp).toLocaleString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="back">
          {result && (
            <div className="result">
              <button className="back-btn" onClick={() => setFlipped(false)}>
                <span className="arrow">❮</span> Back to Generator
              </button>
              <h2>User Stories</h2>
              <ul>{result.userStories.map((s, i) => <li key={i}>{s}</li>)}</ul>
              
              <h2>Tasks</h2>
              {Object.entries(result.tasks.reduce((acc, t) => {
                if (!acc[t.group]) acc[t.group] = [];
                acc[t.group].push(t);
                return acc;
              }, {})).map(([group, tasks]) => (
                <div key={group} className="group">
                  <h3>{group}</h3>
                  {tasks.map(t => (
                    <div key={t.id} className="task">
                      {editingTask === t.id ? (
                        <input value={t.text} onChange={e => updateTask(t.id, e.target.value)}
                          onBlur={() => setEditingTask(null)} autoFocus />
                      ) : (
                        <span onDoubleClick={() => setEditingTask(t.id)}>{t.text}</span>
                      )}
                      <div>
                        <button onClick={() => moveTask(t.id, 'up')}>▲</button>
                        <button onClick={() => moveTask(t.id, 'down')}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {result.risks && (
                <div className="risks">
                  <h2>Risks/Unknowns</h2>
                  <p>{result.risks}</p>
                </div>
              )}

              <div className="export">
                <button onClick={copyToClipboard}>Copy Markdown</button>
                <button onClick={downloadMarkdown}>Download Markdown</button>
                <button onClick={downloadPDF} className="pdf-btn">Download PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="copyright">
        © 2026 Ghansham Bordekar. All Rights Reserved.
      </div>
      
      <button className="status-btn" onClick={() => setShowStatus(!showStatus)} title="System Status">
        ⚙️
      </button>
      
      {showStatus && health && (
        <div className="status-panel">
          <h3 style={{margin: '0 0 10px 0', fontSize: '16px'}}>System Status</h3>
          <div className="status-item">
            <span>Backend:</span>
            <span className={health.backend === 'healthy' ? 'status-healthy' : 'status-error'}>
              {health.backend === 'healthy' ? '✓' : '✗'}
            </span>
          </div>
          <div className="status-item">
            <span>Database:</span>
            <span className={health.database.includes('healthy') ? 'status-healthy' : 'status-error'}>
              {health.database.includes('healthy') ? '✓' : '✗'}
            </span>
          </div>
          <div className="status-item">
            <span>LLM:</span>
            <span className="status-healthy">N/A</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
