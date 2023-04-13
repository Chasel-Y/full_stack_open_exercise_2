require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Phonebook = require('./models/phonebook')
const app = express()

morgan.token('req-body', (req) => JSON.stringify(req.body))

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))
app.use(cors())

app.get('/api/persons', (request, response) => {
  Phonebook.find({}).then(phonebook => {
    response.json(phonebook)
  })
})

app.get('/info', (request, response) => {
  Phonebook.find({}).then(phonebook => {
    response.send(
      `<p>Phonebook has info for ${phonebook.length} people</p>
       <p>${new Date()}</p>`
    )
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Phonebook.findById(request.params.id)
    .then(phonebook => {
      if (phonebook) {
        response.json(phonebook)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Phonebook.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body
  const phonebook = new Phonebook({
    name: person.name,
    number: person.number,
  })
  phonebook.save()
    .then(savedPhonebook => {
      response.json(savedPhonebook)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Phonebook.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPhonebook => {
      response.json(updatedPhonebook)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})