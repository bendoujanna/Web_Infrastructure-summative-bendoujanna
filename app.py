from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file


app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

# Load Todoist API token from environment
TODOIST_TOKEN = os.getenv("TODOIST_API_KEY")

if not TODOIST_TOKEN:
    raise ValueError("ERROR: Missing Todoist API key. Set TODOIST_API_KEY in your environment.")

HEADERS = {
    "Authorization": f"Bearer {TODOIST_TOKEN}",
    "Content-Type": "application/json"
}

# Fetch all tasks from Todoist REST API
def fetch_todoist_tasks():
    url = "https://api.todoist.com/rest/v2/tasks"
    response = requests.get(url, headers=HEADERS)
    return response.json()

# ROUTES

# GET all tasks
@app.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = fetch_todoist_tasks()
    return jsonify(tasks), 200

# GET upcoming tasks 
@app.route("/tasks/upcoming", methods=["GET"])
def upcoming_tasks():
    tasks = fetch_todoist_tasks()
    now = datetime.now()
    upcoming = [
        t for t in tasks 
        if t.get("due") and datetime.fromisoformat(t["due"]["date"]) >= now
    ]
    return jsonify(upcoming), 200

# GET overdue tasks
@app.route("/tasks/overdue", methods=["GET"])
def overdue_tasks():
    tasks = fetch_todoist_tasks()
    now = datetime.now()
    overdue = [
        t for t in tasks 
        if t.get("due") and datetime.fromisoformat(t["due"]["date"]) < now
    ]
    return jsonify(overdue), 200

# GET completed tasks in the last 7 days
@app.route("/tasks/completed-week", methods=["GET"])
def completed_week():
    url = "https://api.todoist.com/sync/v9/completed/get_all"
    params = {
        "since": (datetime.now() - timedelta(days=7)).isoformat()
    }
    response = requests.get(url, headers=HEADERS, params=params)
    completed_tasks = response.json().get("items", [])
    return jsonify(completed_tasks), 200


# POST: Add a new task
@app.route("/tasks/add", methods=["POST"])
def add_task():
    data = request.json
    url = "https://api.todoist.com/rest/v2/tasks"
    response = requests.post(url, headers=HEADERS, json=data)
    return jsonify(response.json()), response.status_code

# POST: Close (mark as done)
@app.route("/tasks/close/<task_id>", methods=["POST"])
def close_task(task_id):
    url = f"https://api.todoist.com/rest/v2/tasks/{task_id}/close"
    response = requests.post(url, headers=HEADERS)
    
    if response.status_code == 204:
        return jsonify({"message": "Task marked as completed"}), 200

    return jsonify({"error": "Unable to close task"}), 400
 

#  Remove a task
@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    url = f"https://api.todoist.com/rest/v2/tasks/{task_id}"
    response = requests.delete(url, headers=HEADERS)
    
    if response.status_code == 204:
        return jsonify({"message": "Task deleted"}), 200
    return jsonify({"error": "Unable to delete task"}), 400


# SERVER ENTRY POINT
if __name__ == "__main__":
    
    app.run(debug=True, host="0.0.0.0", port=5000)
