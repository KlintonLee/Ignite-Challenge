const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const userExists = users.find(user => user.username === username)

  if (!userExists) response.status(400).json({ error: "User does not exists" })

  request.user = userExists

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExists = users.find(user => user.username === username)
  if (userExists) response.status(400).json({ error: "User already exists" })

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline).toISOString(),
    created_at: new Date().toISOString()
  }

  user.todos.push(todo)

  return response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1)
    return response.status(404).json({ error: "To do does not exists" })

  if (title) user.todos[todoIndex].title = title
  if (deadline)
    user.todos[todoIndex].deadline = new Date(deadline).toISOString()

  return response.status(200).json(user.todos[todoIndex])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1) 
    return response.status(404).json({ error: "To do does not exists" })

  user.todos[todoIndex].done = true

  return response.status(200).json(user.todos[todoIndex])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const findIndex = user.todos.findIndex(todo => todo.id === id)

  if (findIndex === -1)
    return response.status(404).json({ error: "To do does not exists" })

  user.todos.splice(findIndex, 1)

  return response.status(204).send()
});

module.exports = app;