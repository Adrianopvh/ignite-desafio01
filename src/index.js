const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({ error: "User not exists" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const accountUserExists = users.some(user => user.username === username);

  if (accountUserExists) {
    return response.status(400).json({ error: "Account User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const userTodo = user.todos.find(todo => todo.id === id);

  if (!userTodo) {
    return reponse.status(404).json({ error: "Todo not found" });
  }

  userTodo.title = title;
  userTodo.deadline = new Date(deadline);

  return response.json(userTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTodo = user.todos.find(todo => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  userTodo.done = true;

  return response.json(userTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => { 
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todo.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;