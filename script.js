document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const taskCount = document.getElementById('taskCount');

    // Current filter
    let currentFilter = 'all';

    // Load tasks from local storage
    loadTasks();

    // Add task event
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Filter tasks events
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });

    // Clear completed tasks event
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // Add task function
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            showAlert('Please enter a task', 'error');
            return;
        }

        const tasks = getTasks();
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        tasks.push(newTask);
        saveTasks(tasks);
        taskInput.value = '';
        renderTasks();
        showAlert('Task added successfully', 'success');
    }

    // Render tasks based on filter
    function renderTasks() {
        const tasks = getTasks();
        const filteredTasks = filterTasks(tasks, currentFilter);
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks found. Add a new task to get started!</p>
                </div>
            `;
        } else {
            taskList.innerHTML = '';
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskItem.dataset.id = task.id;
                
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button class="edit-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                taskList.appendChild(taskItem);
            });
        }

        // Add event listeners to new elements
        addTaskEventListeners();
        updateTaskCount();
    }

    // Add event listeners to task elements
    function addTaskEventListeners() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskStatus);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editTask);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });
    }

    // Toggle task completion status
    function toggleTaskStatus(e) {
        const taskId = parseInt(e.target.closest('.task-item').dataset.id);
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = e.target.checked;
            saveTasks(tasks);
            renderTasks();
        }
    }

    // Edit task
    function editTask(e) {
        const taskItem = e.target.closest('.task-item');
        const taskId = parseInt(taskItem.dataset.id);
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            const newText = prompt('Edit your task:', tasks[taskIndex].text);
            if (newText !== null && newText.trim() !== '') {
                tasks[taskIndex].text = newText.trim();
                saveTasks(tasks);
                renderTasks();
                showAlert('Task updated successfully', 'success');
            }
        }
    }

    // Delete task
    function deleteTask(e) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            const tasks = getTasks().filter(task => task.id !== taskId);
            saveTasks(tasks);
            renderTasks();
            showAlert('Task deleted successfully', 'success');
        }
    }

    // Clear completed tasks
    function clearCompletedTasks() {
        const tasks = getTasks().filter(task => !task.completed);
        saveTasks(tasks);
        renderTasks();
        showAlert('Completed tasks cleared', 'success');
    }

    // Filter tasks
    function filterTasks(tasks, filter) {
        switch (filter) {
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            default:
                return tasks;
        }
    }

    // Update task count
    function updateTaskCount() {
        const tasks = getTasks();
        const activeCount = tasks.filter(task => !task.completed).length;
        const totalCount = tasks.length;
        
        if (totalCount === 0) {
            taskCount.textContent = 'No tasks';
        } else if (activeCount === 0 && totalCount > 0) {
            taskCount.textContent = `${totalCount} task${totalCount !== 1 ? 's' : ''} (all completed)`;
        } else {
            taskCount.textContent = `${activeCount} of ${totalCount} task${totalCount !== 1 ? 's' : ''} remaining`;
        }
    }

    // Get tasks from local storage
    function getTasks() {
        const tasksJSON = localStorage.getItem('tasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    }

    // Save tasks to local storage
    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load tasks on page load
    function loadTasks() {
        renderTasks();
    }

    // Show alert message
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
});