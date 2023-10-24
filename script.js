class Todo {
    constructor() {
        this.tasks = this.getTasksFromLocalStorage() || [];
        this.term = "";
        this.draw();
    }

    draw() {
        const container = document.getElementById('todo-list');
        container.innerHTML = "";
        
        const filteredTasks = this.getFilteredTasks();
    
        filteredTasks.forEach(task => {
            const formattedDate = task.deadline !== '---' ? new Date(task.deadline).toISOString().split('T')[0] : 'ASAP';
            let highlightedName = task.name;
            if (this.term.length > 0) {
                const re = new RegExp(this.term, "gi");
                highlightedName = task.name.replace(re, match => `<mark>${match}</mark>`);
            }
    
            const taskDiv = document.createElement('div');
            taskDiv.onclick = () => this.editMode(task.id);
            // taskDiv.innerHTML = `<span><input type="checkbox" ${task.isCompleted ? 'checked' : ''} onclick="todo.toggleTaskCompletion('${task.id}'); event.stopPropagation();"> ${highlightedName}</span> <span>${formattedDate}</span>
            //     <button onclick="todo.removeTask('${task.id}')">X</button>`;
            // container.appendChild(taskDiv);
            if (this.currentEditingTask && this.currentEditingTask.id === task.id) {
                const editDiv = document.createElement('div');
                editDiv.innerHTML = `
                    <input type="text" id="edit-task-name" value="${this.currentEditingTask.name}">
                    <span><input type="date" id="edit-task-date" value="${this.currentEditingTask.deadline === '---' ? '' : this.currentEditingTask.deadline}">
                    <button onclick="todo.saveEdit()">Zapisz</button></span>
                    <button onclick="todo.cancelEdit()">X</button>
                `;
                //editDiv.onclick = () => this.cancelEdit();
                container.appendChild(editDiv);
            }else{
                taskDiv.innerHTML = `<span><input type="checkbox" ${task.isCompleted ? 'checked' : ''} onclick="todo.toggleTaskCompletion('${task.id}'); event.stopPropagation();"> ${highlightedName}</span> <span>${formattedDate}</span>
                <button onclick="todo.removeTask('${task.id}')">X</button>`;
                container.appendChild(taskDiv);
            }
        });
        
    }
    

    addTask() {
        const currentDate = Date.now();
        const taskName = document.getElementById('task').value;
        const deadline = document.getElementById('deadline').value;

        if (taskName.length < 3 || taskName.length > 255 || (deadline && Date.parse(deadline) <= currentDate)) {
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            deadline: deadline || '---'
        };
        
        this.tasks.push(newTask);
        this.saveTasksToLocalStorage();
        this.draw();
    }
    editMode(taskId) {
        this.currentEditingTask = this.tasks.find(t => t.id === taskId);
        this.draw();
    }
    
    removeTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasksToLocalStorage();
        this.draw();
    }
    saveEdit() {
        const currentDate = Date.now();
        const nameInput = document.getElementById('edit-task-name');
        const dateInput = document.getElementById('edit-task-date');
        
        
        if (nameInput.value.length < 3 || nameInput.value.length > 255 || (dateInput.value && Date.parse(dateInput.value) <= currentDate)) {
            return;
        }
        this.currentEditingTask.name = nameInput.value;
        this.currentEditingTask.deadline = dateInput.value || '---';
        this.currentEditingTask = null;
        this.saveTasksToLocalStorage();
        this.draw();
    }
    
    cancelEdit() {
        this.currentEditingTask = null;
        this.draw();
    }
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.isCompleted = !task.isCompleted;
            this.saveTasksToLocalStorage();
            this.draw();
        }
    }
    
    getFilteredTasks() {
        if (this.term.length < 2) {
            return this.tasks;
        }
        return this.tasks.filter(task => task.name.toLowerCase().includes(this.term.toLowerCase()));
    }
    

    getTasksFromLocalStorage() {
        const tasks = localStorage.getItem('todo-tasks');
        return tasks ? JSON.parse(tasks) : null;
    }

    saveTasksToLocalStorage() {
        localStorage.setItem('todo-tasks', JSON.stringify(this.tasks));
    }
}

const todo = new Todo();

document.getElementById('search').addEventListener('input', (e) => {
    todo.term = e.target.value;
    todo.draw();
});

document.body.addEventListener('click', function(event) {
    if (todo.currentEditingTask && !event.target.closest('#todo-list')) {
        todo.saveEdit();
    }
}, true);
