document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'http://127.0.0.1:5000'; // Flask backend
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section');

    const taskTableBody = document.getElementById('task-table-body');
    const searchBar = document.getElementById('search-bar');
    const statusButtons = {
        all: document.getElementById('status-all'),
        pending: document.getElementById('status-pending'),
        done: document.getElementById('status-done')
    };
    const sortDueDate = document.getElementById('sort-due-date');

    const upcomingCount = document.getElementById('upcoming-count');
    const overdueCount = document.getElementById('overdue-count');
    const completedCount = document.getElementById('completed-count');

    let tasks = [];
    let completedTasks = [];
    let currentFilters = {status: 'all', search: ''};
    let currentSort = {dueDate: 'near-far'};

    // Show message function
    function showMessage(text, type = "success") {
        const messageBox = document.getElementById("message");
        messageBox.textContent = text;

        if (type === "success") {
            messageBox.style.background = "#d4edda";  
            messageBox.style.color = "#155724";
        } else {
            messageBox.style.background = "#f8d7da";   
            messageBox.style.color = "#721c24";
        }

        messageBox.style.display = "block";

        setTimeout(() => {
            messageBox.style.display = "none";
        }, 3000);
    }

    //  Section switching 
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const target = link.dataset.target;
            sections.forEach(sec => {
                if (sec.id === target) {
                    sec.classList.add('active-section');
                    sec.classList.remove('hidden-section');
                } else {
                    sec.classList.remove('active-section');
                    sec.classList.add('hidden-section');
                }
            });
        });
    });

    //  Fetch tasks 
    async function fetchTasks() {
        // Fetch open tasks
        const resOpen = await fetch(`${BASE_URL}/tasks`);
        const openTasks = await resOpen.json();

        // Fetch completed tasks
        const resCompleted = await fetch(`${BASE_URL}/tasks/completed-week`);
        const completedTasksData = await resCompleted.json();

        // Transform completed tasks to match structure
        const completedTasks = completedTasksData.map(t => ({
            id: t.id,
            content: t.content,
            due: t.due ? t.due : null,
            completed: true
        }));

        // Merge open and completed tasks
        tasks = [...openTasks, ...completedTasks];
        updateDashboardCards();
        renderTasks();
    }

    //  Fetch completed tasks 
    async function fetchCompletedTasks() {
        const res = await fetch(`${BASE_URL}/tasks/completed-week`);
        completedTasks = await res.json();
    }

    // Update dashboard cards 
    function updateDashboardCards() {
        const now = new Date();
        let upcoming = 0, overdue = 0;

        // Count upcoming + overdue
        tasks.forEach(t => {
            const dueDate = t.due ? new Date(t.due.date) : null;
            if (dueDate) {
                if (dueDate < now) overdue++;
                else upcoming++;
            }
        });

        // Count completed
        const completed = tasks.filter(t => t.completed).length;

        upcomingCount.textContent = upcoming;
        overdueCount.textContent = overdue;
        completedCount.textContent = completed;
    }


    //  Render tasks table
    function renderTasks() {
        let filtered = tasks.filter(t => {
            let match = true;
            if (currentFilters.status === 'pending') match = !t.completed;
            else if (currentFilters.status === 'done') match = t.completed;
            if (currentFilters.search) match = match && t.content.toLowerCase().includes(currentFilters.search.toLowerCase());
            return match;
        });

        // Sort by due date
        filtered.sort((a, b) => {
            const dateA = a.due ? new Date(a.due.date) : null;
            const dateB = b.due ? new Date(b.due.date) : null;
            if (!dateA) return 1;
            if (!dateB) return -1;
            if (sortDueDate.value === 'near-far') return dateA - dateB;
            else return dateB - dateA;
        });

        // Render table rows
        taskTableBody.innerHTML = '';
        filtered.forEach(t => {
            const due = t.due ? new Date(t.due.date).toLocaleDateString() : '';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${t.completed ? 'Done' : 'Pending'}</td>
                <td>${t.content}</td>
                <td>${due}</td>
                <td>
                    ${!t.completed ? `<button class="mark-done-btn" data-id="${t.id}">Mark Done</button>` : ''}
                    ${!t.completed ? `<button class="delete-btn" data-id="${t.id}">Delete</button>` : ''}
                </td>

            `;
            taskTableBody.appendChild(row);
        });

        attachRowEvents();
    }

    // Attach row button events 
    function attachRowEvents() {
        // Mark done
        document.querySelectorAll('.mark-done-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const taskId = btn.dataset.id;
                const response = await fetch(`${BASE_URL}/tasks/close/${taskId}`, { method: 'POST' });
                if (response.ok) showMessage("Task marked as done!");
                else showMessage("Failed to mark task as done.", "error");
                await fetchTasks();
            });
        });

        // Delete
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const taskId = btn.dataset.id;
                const response = await fetch(`${BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
                if (response.ok) showMessage("Task deleted successfully!");
                else showMessage("Failed to delete task.", "error");
                await fetchTasks();
            });
        });
    }


    //  Filters 
    searchBar.addEventListener('input', () => {
        currentFilters.search = searchBar.value;
        renderTasks();
    });

    Object.entries(statusButtons).forEach(([key, btn]) => {
        btn.addEventListener('click', () => {
            currentFilters.status = key;
            Object.values(statusButtons).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks();
        });
    });

    sortDueDate.addEventListener('change', () => {
        currentSort.dueDate = sortDueDate.value;
        renderTasks();
    });

    // Add task form
    document.getElementById('add-task-form').addEventListener('submit', async e => {
        e.preventDefault();
        const content = document.getElementById('task-title').value;
        const due_string = document.getElementById('task-due').value;

        try {
            const response = await fetch(`${BASE_URL}/tasks/add`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({content, due_string})
            });

            if (response.ok) {
                showMessage("Task added successfully!"); 
            } else {
                showMessage("Failed to add task.", "error"); 
            }

            e.target.reset();
            await fetchTasks();
        } catch (error) {
            showMessage("An error occurred while adding the task.", "error");
            console.error(error);
        }
    });


    //  Initial fetch
    fetchTasks();


});
