// app.js - vanilla JS + localStorage
(function () {
  const STORAGE_KEY = 'vanilla_todos_v1';

  /** State */
  let todos = [];
  let currentFilter = 'all'; // 'all' | 'active' | 'completed'

  /** Elements */
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const itemsLeftEl = document.getElementById('items-left');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const filterButtons = Array.from(document.querySelectorAll('.filter'));

  /** Utils */
  const uid = () => Math.random().toString(36).slice(2, 10);
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      todos = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to parse todos from storage', e);
      todos = [];
    }
  };

  const addTodo = (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    todos.unshift({ id: uid(), title: trimmed, completed: false });
    save();
    render();
  };

  const toggleTodo = (id) => {
    const t = todos.find(t => t.id === id);
    if (!t) return;
    t.completed = !t.completed;
    save();
    render();
  };

  const deleteTodo = (id) => {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  };

  const editTodo = (id, newTitle) => {
    const t = todos.find(t => t.id === id);
    if (!t) return;
    const trimmed = newTitle.trim();
    t.title = trimmed || t.title;
    save();
    render();
  };

  const clearCompleted = () => {
    todos = todos.filter(t => !t.completed);
    save();
    render();
  };

  const setFilter = (f) => {
    currentFilter = f;
    render();
  };

  function render() {
    // Update filters active state
    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    });

    // Compute filtered list
    let visible = todos;
    if (currentFilter === 'active') visible = todos.filter(t => !t.completed);
    if (currentFilter === 'completed') visible = todos.filter(t => t.completed);

    // Update items left
    const left = todos.filter(t => !t.completed).length;
    itemsLeftEl.textContent = `${left} item${left !== 1 ? 's' : ''} left`;

    // Render list
    list.innerHTML = '';
    for (const t of visible) {
      const li = document.createElement('li');
      li.className = `todo-item ${t.completed ? 'completed' : ''}`;
      li.dataset.id = t.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'checkbox';
      checkbox.checked = t.completed;
      checkbox.addEventListener('change', () => toggleTodo(t.id));

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = t.title;

      const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn edit';
      editBtn.title = 'Edit';
      editBtn.innerHTML = '✎';
      editBtn.addEventListener('click', () => {
        title.setAttribute('contenteditable', 'true');
        title.focus();
        const range = document.createRange();
        range.selectNodeContents(title);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });

      title.addEventListener('blur', () => {
        if (title.getAttribute('contenteditable') === 'true') {
          title.removeAttribute('contenteditable');
          editTodo(t.id, title.textContent || '');
        }
      });
      title.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          title.blur();
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'icon-btn delete';
      deleteBtn.title = 'Delete';
      deleteBtn.innerHTML = '🗑';
      deleteBtn.addEventListener('click', () => deleteTodo(t.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(checkbox);
      li.appendChild(title);
      li.appendChild(actions);

      list.appendChild(li);
    }
  }

  // Events
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // Init
  load();
  render();
})();