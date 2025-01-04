const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');

let completedTasks = 0;
let totalTasks = 0;

const API_BASE_URL = "http://localhost:8080/api/v1/todo";

// Fetch existing tasks from the backend when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetch(`${API_BASE_URL}/getall`)
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch todos");
      return response.json();
    })
    .then(data => {
      data.forEach(todo => {
        addTodoItem(todo.todoName, todo.completed, todo.id, false); // Using `id` instead of `_id`
      });
    })
    .catch(error => console.error('Error fetching todos:', error));
});

// Add Button Click Listener
addBtn.addEventListener('click', () => {
  const todoText = todoInput.value.trim();
  if (todoText) {
    saveTodoToBackend(todoText, false);
    todoInput.value = '';
  } else {
    alert("Please enter a task!");
  }
});

// Function to Add a To-Do Item to the DOM
function addTodoItem(text, isCompleted = false, id = null, saveToBackend = false) {
  totalTasks++;
  if (isCompleted) completedTasks++;
  updateStats();

  const todoItem = document.createElement('li');
  todoItem.classList.add('todo-item');
  if (isCompleted) todoItem.classList.add('completed');
  if (id) todoItem.dataset.id = id;

  const todoText = document.createElement('span');
  todoText.textContent = text;

  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('button-group');

  const completeBtn = document.createElement('button');
  completeBtn.classList.add('complete-btn');
  completeBtn.innerHTML = 'Done';
  completeBtn.addEventListener('click', () => {
    todoItem.classList.toggle('completed');
    if (todoItem.classList.contains('completed')) {
      completedTasks++;
      updateTodoStatus(todoItem.dataset.id, true);
    } else {
      completedTasks--;
      updateTodoStatus(todoItem.dataset.id, false);
    }
    updateStats();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.innerHTML = 'Remove';
  deleteBtn.addEventListener('click', () => {
    if (todoItem.classList.contains('completed')) {
      completedTasks--;
    }
    totalTasks--;
    deleteTodoItem(todoItem.dataset.id);
    todoList.removeChild(todoItem);
    updateStats();
  });

  buttonGroup.appendChild(completeBtn);
  buttonGroup.appendChild(deleteBtn);
  todoItem.appendChild(todoText);
  todoItem.appendChild(buttonGroup);
  todoList.appendChild(todoItem);
}

function updateStats() {
  completedCount.textContent = completedTasks;
  totalCount.textContent = totalTasks;
}

// Save New To-Do to the Backend
function saveTodoToBackend(todoName, completed) {
  fetch(`${API_BASE_URL}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ todoName, completed })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || "Failed to save todo");
        });
      }
      return response.json(); // Expecting JSON with the saved todo, including `id`
    })
    .then(savedTodo => {
      console.log("Todo saved successfully:", savedTodo);
      addTodoItem(savedTodo.todoName, savedTodo.completed, savedTodo.id, false);
    })
    .catch(error => {
      console.error('Error saving todo:', error);
      alert(`Failed to save the task: ${error.message}`);
    });
}

// Update To-Do Status in the Backend
function updateTodoStatus(id, completed) {
  fetch(`${API_BASE_URL}/update/${id}?completed=${completed}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to update todo");
      return response.json();
    })
    .then(data => console.log('Todo updated successfully:', data))
    .catch(error => console.error('Error updating todo:', error));
}

// Delete To-Do from the Backend
function deleteTodoItem(id) {
  fetch(`${API_BASE_URL}/delete/${id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || "Failed to delete todo");
        });
      }
      console.log('Todo deleted successfully');
    })
    .catch(error => console.error('Error deleting todo:', error));
}
