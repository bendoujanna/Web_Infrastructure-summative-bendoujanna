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


###### Deployment architecture

  1. Backend deployment

         On both Web01 and Web02, only the Flask backend code is deployed, configured to listen internally on port 5000.

     a. Gunicorn Service Setup: A systemd service (taskora.service) is configured to run the Gunicorn WSGI server.

         -Goal: Serve the API routes.

         -Key Detail: The application does not serve static files or the root (/) route, as this is delegated to Nginx on Lb01.


     b. Deployment Steps: Copy the file into both servers, install dependencies, configure .env, and start/enable the taskora.service.

 2. Load balancer configuration
    
    On the Lb01 server, Nginx is configured to handle all incoming traffic on port **8080**.

    a. Frontend placement:
    
        The HTML, CSS, and JavaScript files are placed in /var/www/taskora on Lb01.

    b. Upstream Definition: The upstream block defines the two backend servers for Round-Robin load balancing:

        upstream taskora_backend {
        server [IP_WEB01]:5000;
        server [IP_WEB02]:5000;
        }

    c. Nginx Server Block (/etc/nginx/sites-available/taskora): The configuration is split into three main parts:

        
    
        -Root Location (/): Serves index.html directly from /var/www/taskora.

        -Static Location (/static): Serves all CSS/JS files directly, without hitting the backend.

        -API Location (/tasks): Reverse proxies the request to the taskora_backend upstream pool for load distribution.


###### Challenges encountered and solutions

1. Serving static files
   
        - Initial attempts to let Flask serve static files led to path conflicts and a redirection loop (HTTP to HTTPS) due to prior HAProxy configuration, resulting in a blank page. Only the html was loaded in the browser
   
        - The solution was to delegate the entire frontend delivery to Nginx (Lb01). Nginx now serves the static files directly from /var/www/taskora/, resolving all path and protocol issues.


###### Security and credits

1. Secure API Key Handling

   The Todoist API Key is handled securely:

        -It is stored in a dedicated .env file or as an environment variable on the servers.
        
        -The .env file is listed in the .gitignore file and is never uploaded to the public GitHub repository.
        
        -The Flask application accesses the key exclusively via os.getenv().

2. Credits

   - Primary API: Todoist API
   - API Documentation : https://developer.todoist.com/api/v1/#section/Developing-with-Todoist
   - Libraries/Tools: Flask, Gunicorn, Nginx

   
3. Languages: Python, JavaScript, HTML and css    


**Video link** 



     

        
     
       
    
    
