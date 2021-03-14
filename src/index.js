const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

app.get('/todos1', (request, response) => {
  response.send(users)
})

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).json({error: "User not found"})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  const userAlreadyexist = users.find(user => user.username === username)

  if(userAlreadyexist){
    return response.status(400).json({error: 'Username already exist!'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  response.status(201).send(user)
})

app.use(checksExistsUserAccount)

app.get('/todos', (request, response) => {
  const {user} = request
  response.json(user.todos)
})

app.post('/todos', (request, response) => {
  const {title, deadline} = request.body
  const {user} = request

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  response.status(201).send(todo)
})

app.put('/todos/:id', (request, response) => {
  const { id } = request.params
  const {title, deadline} = request.body
  const {user} = request

  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) {
    return response.status(404).json({error: 'Todo not found!'})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  response.status(201).json(todo)
})

app.patch('/todos/:id/done', (request, response) => {
  const { id } = request.params
  const {user} = request

  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) {
    return response.status(404).json({error: 'Todo not found!'})
  }
  todo.done = true


  response.status(200).json(todo)
})

app.delete('/todos/:id', (request, response) => {
  const { id } = request.params
  const {user} = request

  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) {
    return response.status(404).json({error: 'Todo not found!'})
  }

  const index = user.todos.indexOf(todo)
  user.todos.splice(index, 1)

  response.status(204).send()
})

module.exports = app;