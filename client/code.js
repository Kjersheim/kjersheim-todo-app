// Initialize the application
function init() {
	let infoText = document.getElementById('infoText');
	infoText.innerHTML = 'Loading todos, please wait...';
	loadTodos();
	// Load existing todos from the server
	let addButton = document.querySelector('.add-button');
	addButton.onclick = addTodo;
}
// Function to load todos from the server
async function loadTodos() {
	let response = await fetch('/todos');
	let todos = await response.json();
	showTodos(todos);
}
// Function to create an individual todo list item
function createTodoListItem(todo) {
	let li = document.createElement('li');
	let li_attr = document.createAttribute('id');
	li_attr.value = todo._id;
	li.setAttributeNode(li_attr);
	// Create a horizontal line separator, class separator
	let separator = document.createElement('hr');
	separator.setAttribute('class', 'separator');
	// Create the todo text element
	let text = document.createElement('span');
	text.id = `text-${ todo._id }`;
	text.textContent = todo.text;
	// Create the "e" edit
	let editSpan = document.createElement('span');
	let editSpan_attr = document.createAttribute('class');
	editSpan_attr.value = 'edit-todo';
	editSpan.setAttributeNode(editSpan_attr);
	let e = document.createTextNode('e');
	editSpan.appendChild(e);
	editSpan.addEventListener('click', function (event) {
		editTask(todo._id, todo.text);
	});
	// Create the "x" delete
	let deleteSpan = document.createElement('span');
	let deleteSpan_attr = document.createAttribute('class');
	deleteSpan_attr.value = 'delete-todo';
	deleteSpan.setAttributeNode(deleteSpan_attr);
	let x = document.createTextNode(' x');
	deleteSpan.appendChild(x);
	deleteSpan.addEventListener('click', function () {
		removeTodo(todo._id);
	});
	li.appendChild(separator);
	// Add the separator
	li.appendChild(text);
	// Add the todo text
	li.appendChild(editSpan);
	// Add the "e" button
	li.appendChild(deleteSpan);
	// Add the "x" button
	return li;
}
// Function to display todos in the UI
function showTodos(todos) {
	let todosList = document.getElementById('todosList');
	// Get the <ul> element for todos
	let infoText = document.getElementById('infoText');
	// Get the infoText element
	let infoContainer = document.querySelector('.info-container');
	// Get the info container
	if (todos.length === 0) {
		infoText.innerHTML = 'No Todos';
		// If there are no todos, display "No Todos"
		infoContainer.style.display = 'block';	// Show the container
	} else {
		todos.forEach(todo => {
			let li = createTodoListItem(todo);
			// Create a <li> element for each todo
			todosList.appendChild(li);	// Add the <li> to the <ul>
		});
		infoText.innerHTML = '';
		// Clear the "No Todos" message
		infoContainer.style.display = 'none';	// Hide the container when there are todos
	}
}
// Function to add a new todo
async function addTodo() {
	let newTodo = document.getElementById('newTodo');
	// Get the input element for new todos
	const data = { 'text': newTodo.value };
	// Create data object with the new todo text
	const button = document.querySelector('button');
	button.disabled = true;
	// Disable the button while the request is in progress
	const response = await fetch('/todos', {
		method: 'POST',
		// Send a POST request to add the new todo
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	button.disabled = false;
	// Re-enable the button
	if (response.ok) {
		let todo = await response.json();
		// Parse the JSON response
		let todosList = document.getElementById('todosList');
		// Get the <ul> element
		let li = createTodoListItem(todo);
		// Create a <li> element for the new todo
		todosList.appendChild(li);
		// Add the new <li> to the <ul>
		let infoText = document.getElementById('infoText');
		// Get the infoText element
		infoText.innerHTML = '';
		// Clear the info text
		newTodo.value = '';	// Clear the input field
	} else {
		console.error('Failed to add todo:', response.statusText);	// Handle the error here, e.g., show an error message to the user
	}
	updateInfoContainer();	// Update the info container
}
// Function to remove a todo
async function removeTodo(id) {
	const response = await fetch('/todos/' + id, { method: 'DELETE' });
	let responseJson = await response.json();
	let li = document.getElementById(id);
	li.remove();
	updateInfoContainer();	// Update the info container
}
function updateInfoContainer() {
	let todosList = document.getElementById('todosList');
	let infoText = document.getElementById('infoText');
	let infoContainer = document.querySelector('.info-container');
	if (todosList.children.length === 0) {
		infoText.innerHTML = 'No Todos';
		infoContainer.style.display = 'block';	// Show the container
	} else {
		infoText.innerHTML = '';
		infoContainer.style.display = 'none';	// Hide the container when there are todos
	}
}
let isEdited = false;
// Maintain a flag to track if the task has been edited
let updatedTexts = {};
// Maintain a dictionary to store the updated text for each task
// Function to edit a task
function editTask(id, text) {
	let todoInput = document.getElementById('newTodo');
	let addButton = document.querySelector('.add-button');
	// If the task has been edited in this session, use the updated text
	if (isEdited && updatedTexts[id]) {
		todoInput.value = updatedTexts[id];
	} else {
		// If the task has not been edited, fetch the original text from the DOM
		let currentTaskText = document.getElementById(`text-${ id }`).textContent;
		todoInput.value = currentTaskText;
	}
	// Change the "Add" button to "Save"
	addButton.textContent = 'Save';
	addButton.style.backgroundColor = 'yellow';
	// Change the onclick property to saveTask
	addButton.onclick = function () {
		saveTask(id, todoInput.value);
		isEdited = true;
		// Set the flag to indicate that the task has been edited
		updatedTexts[id] = todoInput.value;	// Store the updated text for the task
	};
	// Hide all "Edit" buttons
	let allEditSpans = document.querySelectorAll('.edit-todo');
	allEditSpans.forEach(span => {
		span.style.display = 'none';
	});
	// Focus on the input box
	todoInput.focus();
}
// Function to save an edited task
async function saveTask(id) {
	let todoInput = document.getElementById('newTodo');
	let updatedText = todoInput.value;
	// Get the updated text from the input field
	const data = { text: updatedText };
	// Create data object with the updated todo text
	const addButton = document.querySelector('.add-button');
	addButton.disabled = true;
	// Disable the button while the request is in progress
	const response = await fetch(`/todos/${ id }`, {
		method: 'PUT',
		// Send a PUT request to update the existing todo
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	addButton.disabled = false;
	// Re-enable the button
	if (response.ok) {
		// Update the UI with the edited text
		const todoTextElement = document.getElementById(`text-${ id }`);
		todoTextElement.textContent = updatedText;
		// Use the updatedText parameter
		// Reset the "Add" button
		addButton.textContent = 'Add';
		addButton.style.backgroundColor = 'var(--cambridge-blue)';
		todoInput.value = '';
		// Clear the input field
		// Reset the "Add" button's onclick property to addTodo
		addButton.onclick = addTodo;
		// Show all "Edit" buttons
		let allEditSpans = document.querySelectorAll('.edit-todo');
		allEditSpans.forEach(span => {
			span.style.display = 'inline';
		});
	} else {
		console.error('Failed to update todo:', response.statusText);	// Handle the error here, e.g., show an error message to the user
	}
}