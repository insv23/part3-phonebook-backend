require('dotenv').config({ path: './.env.local' })
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      JSON.stringify(req.body),
    ].join(' ')
  })
)

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

/* Add new person */
app.post('/api/persons', (req, res, next) => {
  // const body = req.body;
  const { name, number } = req.body

  // if (!body.name) {
  //   return res.status(400).json({
  //     error: "name missing",
  //   });
  // }

  // if (!body.number) {
  //   return res.status(400).json({
  //     error: "number missing",
  //   });
  // }

  Person.find({ name: name })
    .then((persons) => {
      if (persons.length > 0) {
        return res.status(400).json({
          error: 'name must be unique',
        })
      }

      const person = new Person({
        // name: body.name,
        name: name,
        // number: body.number,
        number: number,
      })

      person
        .save()
        .then((savedPerson) => {
          res.json(savedPerson)
        })
        .catch((error) => {
          // error.message = "saving person failed";
          next(error)
        })
    })
    .catch((error) => {
      error.message = 'query failed'
      next(error)
    })
})

/* Update person */
app.put('/api/persons/:id', (req, res, next) => {
  // const body = req.body;
  const { name, number } = req.body

  const person = {
    name: name,
    number: number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true })
    .then((updatedPerson) => {
      res.json(updatedPerson)
    })
    .catch((error) => {
      // error.message = "updating person failed";
      next(error)
    })
})

/* Delete person */
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => {
      error.message = 'deleting person failed'
      next(error)
    })
})

app.get('/info', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.send(
        `<div>Phonebook has info for ${persons.length} people</div>
    <br/>
    <div>${new Date()}</div>`
      )
    })
    .catch((error) => {
      error.message = 'query failed'
      next(error)
    })
})

/* Error handling */
const errorHandler = (error, req, res, next) => {
  console.error('\x1b[31m%s\x1b[0m', `Error: ${error.message}`) // 将错误信息以红色输出

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  if (
    error.message === 'saving person failed' ||
    error.message === 'query failed' ||
    error.message === 'updating person failed' ||
    error.message === 'deleting person failed' ||
    error.message === 'query failed'
  ) {
    return res.status(500).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
