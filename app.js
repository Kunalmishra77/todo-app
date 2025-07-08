const API_URL = "https://jsonplaceholder.typicode.com/todos";
    let todos = [];
    let currentPage = 1;
    const perPage = 5;

    const showLoading = () => document.getElementById("loading").style.display = "block";
    const hideLoading = () => document.getElementById("loading").style.display = "none";

    fetchTodos = async () => {
      try {
        showLoading();
        const res = await fetch(API_URL);
        const data = await res.json();
        todos = data.slice(0, 50).map(todo => ({ ...todo, date: `2024-01-${String(todo.id).padStart(2, '0')}` }));
        renderTodos();
      } catch (err) {
        alert("Error fetching todos");
      } finally {
        hideLoading();
      }
    }

    renderTodos = () => {
      const list = document.getElementById("todo-list");
      const searchVal = document.getElementById("search").value.toLowerCase();
      const from = new Date(document.getElementById("from-date").value);
      const to = new Date(document.getElementById("to-date").value);

      let filtered = todos.filter(todo => todo.title.toLowerCase().includes(searchVal));

      if (!isNaN(from) && !isNaN(to)) {
        filtered = filtered.filter(todo => {
          const todoDate = new Date(todo.date);
          return todoDate >= from && todoDate <= to;
        });
      }

      const start = (currentPage - 1) * perPage;
      const paginated = filtered.slice(start, start + perPage);

      list.innerHTML = paginated.map(t => `
        <div class="list-group-item todo-item d-flex align-items-center justify-content-between">
          <div>
            <input type="checkbox" class="form-check-input me-2" ${t.completed ? 'checked' : ''} onchange="toggleComplete(${t.id})">
            <span style="${t.completed ? 'text-decoration: line-through;' : ''}">${t.title}</span>
          </div>
          <div class="d-flex align-items-center">
            <small class="todo-date">${t.date}</small>
            <button class="icon-btn" onclick="editTodo(${t.id})" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="icon-btn delete-btn" onclick="deleteTodo(${t.id})" title="Delete"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>`
      ).join("");

      renderPagination(filtered.length);
    }

    renderPagination = (total) => {
      const totalPages = Math.ceil(total / perPage);
      const pagination = document.getElementById("pagination");
      pagination.innerHTML = "";
      for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `<button onclick="goToPage(${i})" class="btn btn-sm mx-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}">${i}</button>`;
      }
    }

    goToPage = (page) => {
      currentPage = page;
      renderTodos();
    }

    deleteTodo = (id) => {
      todos = todos.filter(todo => todo.id !== id);
      renderTodos();
    }

    toggleComplete = (id) => {
      todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
      renderTodos();
    }

    toggleDarkMode = () => {
      document.body.classList.toggle("dark-mode");
    }

    editTodo = (id) => {
      const todo = todos.find(t => t.id === id);
      document.getElementById("task").value = todo.title;
      document.getElementById("date").value = todo.date;
      document.getElementById("edit-id").value = id;
      document.getElementById("form-btn-text").innerText = "Update";
    }

    document.getElementById("search").addEventListener("input", renderTodos);
    document.getElementById("from-date").addEventListener("change", renderTodos);
    document.getElementById("to-date").addEventListener("change", renderTodos);

    document.getElementById("todo-form").addEventListener("submit", async e => {
      e.preventDefault();
      const task = document.getElementById("task").value;
      const date = document.getElementById("date").value;
      const editId = document.getElementById("edit-id").value;
      try {
        showLoading();
        if (editId) {
          todos = todos.map(todo => todo.id == editId ? { ...todo, title: task, date } : todo);
        } else {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: task, completed: false, date })
          });
          const newTodo = await res.json();
          todos.unshift({ ...newTodo, date });
        }
        renderTodos();
        e.target.reset();
        document.getElementById("edit-id").value = "";
        document.getElementById("form-btn-text").innerText = "Add";
      } catch {
        alert("Error saving todo");
      } finally {
        hideLoading();
      }
    });

    fetchTodos();