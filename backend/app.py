from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

specs_history = []

def generate_tasks(goal, users, constraints, template, risks):
    # Extract key verbs/actions from goal for dynamic stories
    goal_words = goal.lower().split()
    action_verbs = ['create', 'build', 'develop', 'implement', 'design', 'generate', 'manage', 'track', 'monitor', 'analyze']
    
    # Find primary action or use goal as-is
    primary_action = next((word for word in goal_words if word in action_verbs), None)
    
    # Generate dynamic user stories based on goal context
    if primary_action:
        user_stories = [
            f"As a {users}, I want to {goal} so that I can accomplish my tasks efficiently",
            f"As a {users}, I want to receive real-time feedback while {primary_action}ing so that I can track progress",
            f"As a {users}, I want to modify and organize the {primary_action}ed content so that it fits my workflow"
        ]
    else:
        user_stories = [
            f"As a {users}, I want to {goal} so that I can achieve better results",
            f"As a {users}, I want clear status indicators and notifications so that I stay informed",
            f"As a {users}, I want flexible editing and organization options so that I can work my way"
        ]
    
    base_tasks = [
        {"id": str(uuid.uuid4()), "text": f"Design UI mockups for {template} template", "group": "Design", "order": 0},
        {"id": str(uuid.uuid4()), "text": f"Set up {template} project structure", "group": "Setup", "order": 1},
        {"id": str(uuid.uuid4()), "text": f"Implement core feature: {goal}", "group": "Development", "order": 2},
        {"id": str(uuid.uuid4()), "text": f"Add input validation considering: {constraints}", "group": "Development", "order": 3},
        {"id": str(uuid.uuid4()), "text": f"Create API endpoints for {goal}", "group": "Backend", "order": 4},
        {"id": str(uuid.uuid4()), "text": "Implement error handling and loading states", "group": "Development", "order": 5},
        {"id": str(uuid.uuid4()), "text": f"Write unit tests for {goal} functionality", "group": "Testing", "order": 6},
        {"id": str(uuid.uuid4()), "text": f"Test with target users: {users}", "group": "Testing", "order": 7},
        {"id": str(uuid.uuid4()), "text": "Deploy to staging environment", "group": "Deployment", "order": 8},
        {"id": str(uuid.uuid4()), "text": "Monitor and gather user feedback", "group": "Deployment", "order": 9}
    ]
    
    return {"userStories": user_stories, "tasks": base_tasks, "risks": risks}

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    
    # Input validation
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    goal = data.get('goal', '').strip()
    users = data.get('users', '').strip()
    
    if not goal:
        return jsonify({"error": "Goal is required"}), 400
    if not users:
        return jsonify({"error": "Users field is required"}), 400
    
    result = generate_tasks(
        goal,
        users,
        data.get('constraints', ''),
        data.get('template', 'web'),
        data.get('risks', '')
    )
    
    spec = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "input": data,
        "output": result
    }
    
    specs_history.insert(0, spec)
    if len(specs_history) > 5:
        specs_history.pop()
    
    return jsonify(result)

@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify(specs_history)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "backend": "healthy",
        "database": "healthy (in-memory)",
        "llm": "not used (rule-based generation)",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
