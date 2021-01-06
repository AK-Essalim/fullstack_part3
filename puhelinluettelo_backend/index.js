//Required Imports
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

//Middlewares that are used
app.use(express.json())
app.use(cors())

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(requestLogger)

//Morgan token on createPerson
morgan.token('createPerson', (request) => {
    if (request.method === 'POST') {
        const newPerson = { name: request.body.name, number: request.body.number }
        return JSON.stringify(newPerson)
    }
    return null
})

app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :createPerson'
    )
)
app.use(express.static('build'))

//Get All
app.get('/api/persons', (req, res) => {
    Person.find({}).then((persons) =>
        res.json(persons.map((person) => person.toJSON()))
    )
})

//Get One by Id
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then((person) => {
            if (person) {
                res.json(person)
                console.log(`Received a request for the details of ${person.name}`)
            } else {
                res.status(404).end()
            }
        })
        .catch((error) => next(error))
})

//Add a Single User
app.post('/api/persons/', (req, res, next) => {
    const newPerson = req.body

    const person = new Person({
        name: newPerson.name,
        number: newPerson.number,
    })

    person
        .save()
        .then((savedPerson) => {
            console.log(`New person ${newPerson.name} added!`)
            res.json(savedPerson)
        })
        .catch((error) => next(error))
})

//Delete a Single User
app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findByIdAndDelete(id)
        .then(() => {
            res.status(204).end()
            console.log('person deleted')
        })
        .catch((error) => next(error))
})

//Update User
app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(req.params.id, person, {
        new: true,
        runValidators: true,
        context: 'query',
    })
        .then((updatedPerson) => {
            res.json(updatedPerson.toJSON())
        })
        .catch((error) => next(error))
})

//Infopage
app.get('/info', (req, res) => {
    Person.find({}).then((people) => {
        people.map((person) => person.toJSON())

        res.send(`<p>Phonebook has info for ${people.length} people</p>
  <p>${new Date()}</p>`)
    })
})

//Middleware for handling unknown endpoints
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
