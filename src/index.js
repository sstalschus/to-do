const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => 
     user.username === username
  )
  if (!user) {
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = user

  return next()
}

function checkExistsTodoId(request, response, next) {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => 
    todo.id === id
  )
  if (!todo) {
    return response.status(404).json({ error: 'To-do not found' })
  }
  
  request.todo = todo

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find(user => 
    user.username === username
  )
  if(userAlreadyExists) {
    return response.status(400).json({error: 'User Already Exists'})
  }

    users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
    })

    const user = users.find(user => 
      user.username === username
    )
    return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const dateFormat = new Date(deadline + " 00:00")

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: dateFormat,
    created_at: new Date()
  })

  return response.status(201).send()
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodoId, (request, response) => {
  const { todo } = request
  const { title, deadline } = request.body

  todo.title = title
  todo.deadline = new Date(deadline + " 00:00")

  return response.status(200).send()

});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodoId, (request, response) => {
  const { todo } = request

  todo.done = true

  return response.status(200).send()

});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodoId, (request, response) => {
  const { user } = request
  const { id } = request.params

  user.todos.forEach((todo, index) => {
    if(todo.id === id) {
      user.todos.splice(index, 1)
    }
  })

  return response.status(204).send()
});

module.exports = app;