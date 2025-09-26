const todos = new Map();

module.exports = {
  async listTodos() {
    return Array.from(todos.values());
  },

  async createTodo(item) {
    todos.set(item.id, item);
    return item;
  },

  // helper for tests / reset
  _clear() {
    todos.clear();
  }
};

