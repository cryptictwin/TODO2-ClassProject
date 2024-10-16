//Firebase Configuration
//Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const todoRef = firebase.database().ref('todo');
//Select DOM Elements
const addTodoBtn = document.getElementById('add-todo-btn');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const prioritySelect = document.getElementById('priority-select');
const searchInput = document.getElementById('search-input');
const darkToggle = document.getElementById('dark-mode-toggle');

// Event Listener to Add TODO item
addTodoBtn.addEventListener('click', () => {
  const todoText = todoInput.value.trim();
  const priority = prioritySelect.value;
  if (todoText > 0) {
    // Create a new reference in the database for a new todo item
    const newTodoRef = todoRef.push();
    const currentDate = new Date().toLocaleDateString();
    // Set the new todo item's properties in Firebase
    newTodoRef.set({
      text: todoText,
      completed: false,
      date: currentDate,
      priority: priority,
      category: 'General', // Add a default category for now.
    });
    //Clear the input after adding the todo
    todoInput = '';
  }
});

//Add keypress event to add todo with 'Enter' key
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodoBtn.click();
  }
});

// Event Listener to Toggle Dark Mode
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

//Fetch and render TODO items from Firebase
todoRef.on('value', (snapshot) => {
  // Clear the current list to prepare for any updated content
  todoList.innerHTML = '';
  snapshot.forEach((childSnapshot) => {
    const todoItem = childSnapshot.val(); // Retrieve the todo data
    const todoKey = childSnapshot.key; // Unique key for the todo item
    const li = document.createElement('li'); // Create a list item for each todo

    // Create a label to display the category of the todo
    const categoryLabel = document.createElement('div');
    categoryLabel.classList.add('category-label');
    categoryLabel.textContent = todoItem.category;
    li.appendChild(categoryLabel);

    const todoContent = document.createElement('div');
    todoContent.classList.add('todo-content');

    const statusIcon = document.createElement('div');
    statusIcon.classList.add('status-icon');

    if(todoItem.completed) {
        statusIcon.classList.add('completed');
        statusIcon.innerHTML = '<i class="fas fa-check"></i>'
    } 
    else if(todoItem.priority === "high") {
        statusIcon.classList.add('priority');
        statusIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>'
    }
    else if(todoItem.priority === "medium") {
        statusIcon.classList.add('in-progress');
        statusIcon.innerHTML = '<i class="fas fa-hourglass-half"></i>'
    }
    else if(todoItem.priority === "low") {
        statusIcon.classList.add('waiting');
        statusIcon.innerHTML = '<i class="fas fa-pause"></i>'
    }
    else {
        statusIcon.classList.add('unfinished');
        statusIcon.innerHTML = '<i class="fas fa-times"></i>'
    }
    todoContent.appendChild(statusIcon);

    // Display the todo text
    const todoTextSpan = document.createElement('span');
    todoTextSpan.textContent = `${todoItem.text}`;
    if(todoItem.completed) {
        todoTextSpan.classList.add('completed');  // Style the text if completed
    }
    todoContent.appendChild(todoTextSpan);

    // Create an edit button
    const editBtn = document.createElement('i');
    editBtn.classList.add('fas', "fa-edit", 'edit-btn');
    editBtn.addEventListener('click', () => {
      e.stopPropagation(); // Prevent click from toggling completion
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.classList.ass('todo-input-edit');
      editInput.value = todoItem.text;
      todoContent.replaceChild(editInput, todoTextSpan); // Replace text with input field
      editInput.focus();

      // When editing is complete (on losing focus)
      editInput.addEventListener('blur', () => {
        const updatedText = editInput.value.trim();
        if (updatedText.length > 0) {
          // Update the todo text and date in Firebase
          todoRef.child(todoKey).update({
            text: updatedText,
            date: new Date().toLocaleDateString()
          })
        }
        else {
          // Revert to original text if no valid input
          todoContent.replaceChild(todoTextSpan, editInput);
        }
      });
    });

    // Create a complete button
    const completeButton = document.createElement('i');
    completeButton.classList.add('fas', "fa-check", 'complete-btn');
    completeButton.addEventListener('click', () => {
      e.stopPropagation(); // Prevent click from triggering other actions
      // Update the todo's completion status and date in Firebase
      todoRef.child(todoKey).update({
        complete:!todoItem.completed,
        date: new Date().toLocaleDateString()
      });
    });

    // Create an undo button for completed tasks
    const undoBtn = document.createElement('i');
    undoBtn.classList.add('fas', "fa-undo", 'undo-btn');
    undoBtn.addEventListener('click', () => {
      e.stopPropagation() // Prevent click from triggering other actions
      // Set the task as incomplete
      todoRef.child(todoKey).update({
        complete: false
      })
    });
  });
  // Create a delete button
  const deleteBtn = document.createElement('i');
  deleteBtn.classList.add('fas', "fa-trash-alt", 'delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from triggering other actions
    // Delete the todo item from Firebase
    todoRef.child(todoKey).remove();
  });

  // Append all created elements to the list item
  li.appendChild(todoContent);
  if(todoItem.completed) {
    li.appendChild(undoBtn) // Add undo button only if task is completed
  }
  else {
    li.appendChild(completeBtn) // Add complete button if task is not completed
  }
  li.appendChild(editBtn); // Add edit button
  li.appendChild(deleteBtn); // Add delete button
  todoList.appendChild(li); // Append the list item to the list (UI)
});


// Event Listener for search functionality
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase;
  const todos = document.querySelectorAll("#todo-list li")
  todos.forEach(todo => {
    const text = todo.querySelector('span').textContent.toLowerCase();
    if(text.includes(filter)) {
      todo.style.display = "";
    }
    else {
      todo.style.display = "none";
    }
  });
});





