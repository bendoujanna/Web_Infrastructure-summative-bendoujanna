# TaskOra

## Project overview

    TaskOra is a web-based dashboard designed to provide a interface for task management. 
    It integrates with the Todoist API to allow users to read, organize, and create new tasks directly from the application. 
    TaskOra is deployed on a three-tier architecture.

### Core Purpose and API Integration

  The application's core strength lies in its effective use of the Todoist API.
    
    **Real-time Data Fetching (GET):**
    
    TaskOra makes authenticated requests to the Todoist API to fetch a user's current tasks, projects. This ensures the data presented is always up-to-date.
    
    **Creating tasks (POST):**

    Add new tasks directly from the TaskOra dashboard

    
    **Secure Credential Handling:**
    API keys are managed securely on the backend using environment variables (.env) and are never exposed to the public frontend, maintaining a high security standard for sensitive information.

#### Key Features and User Experience

  **Data Retrieval:**
    
    -Secure connection to the Todoist account to fetch all active and relevant tasks.

  **Intuitive UI:**
    
    -Tasks are presented in a clear, easy-to-read table format, enhancing user experience.

  **User Interaction:**

    -Add tasks (Title, description, due date)
    -Mark tasks as done 
    -Filter tasks based on specific criteria (All/Pending/Done)
    -Search bar 
    -Sort data (Nearest/farthest) by due date
    -Delete tasks 
    -See the upcoming tasks, the overdue tasks and the tasks completed this week

  **Error handling**

    -Robust mechanisms are in place to gracefully manage potential issues, such as API downtime or invalid responses

##### Local setup and running 
  
  **Prerequisites**
  
    -Python 3.8+
    
    -An active API key (provided by todoist)

  **Configuration steps**

  1. Clone the repo

         git clone [repo link]

  2. Create and activate the virtual ennvironment

         python3 -m venv venv
     
         source venv/bin/activate

  3. Install dependencies

         pip install -r requirements.txt

  4. Configure API key

     Create a file named .env in the project root directory and securely insert your API key (this file is excluded via .gitignore):

         TODOIST_API_KEY='YOUR_REAL_API_KEY_HERE'

  5. Run the flask Application

         python3 app.py


# Deployment architecture


     
       
    
    
