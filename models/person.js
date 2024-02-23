const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const dbUrl = process.env.MONGODB_URI

console.log('connecting to', dbUrl)

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((err) => {
    console.log('error connecting to MongoDB:', err.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    minLength: 8,
    // be formed of two parts that are separated by -, the first part has two or three numbers and the second part also consists of numbers
    validate: {
      validator: function (v) {
        return /\b\d{2,3}-\d+\b/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
