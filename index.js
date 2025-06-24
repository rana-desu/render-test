// imports the web-server module from node (defined as http)
// into the consntant http
// const http = require('http')

// express is a node module which makes it easaier to work with web-server
// and the built-in http module for node by providing a bunch of abstractions.
require('dotenv').config()

const express  = require('express')
const Note = require('./models/notes')

const app = express() // initialise app with express function

// Express json-parser, to handle the JSON data in request bodies
// JSON is essentially represented as strings rather than objects
// to convert these strings into objects, json-parser is required.

// cors is a middleware used as a workaround for the same origin policy
// (that is used for security reasons).
app.use(express.static('dist'))
app.use(express.json())

/* createServer method of the http module is used to create a new web server
 * an anonymous function is passed as the argument for the createServer method
 * the argument is an event handler that takes request and response as it's own argument
 * this event handler is "registered" to the web server and is called everytime an HTTP request
 * is made to the server's address: http://localhost:3001/
 * 
 * the request made to the HTTP server is responded with:
 *     status code: 200
 *     a content-type header: text/plain
 * the actual content of the site: "hello world"
 * 
 * now,
 * content-type: application/json
 * presents the response with JSON.stringify(notes)
 * hence, server is made capable to respond with JSON data.
 * 
 * notes is a list of objects with multiple fields
 * stringify() is necessary because response.end() method expects the argument to be a string/buffer.
 */
// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     response.end(JSON.stringify(notes))
// })

// registers an event handler to app that handles
// the HTTP GET requests made on the server, requests consists of info about the HTTP request
// response is used to define how to handle the request (what to respond with).
app.get('/', (request, response) => {
    response.send('<h1>hello world</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})


app.post('/api/notes', (request, response, next) => {
    const body = request.body
    
    const note = new Note({
        content: body.content,
        important: body.important || false,
    })
    
    note.save()
        .then(savedNote => {
            response.json(savedNote)
        })
        .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body

    Note.findById(request.params.id)
        .then(note => {
            if (!note) {
                return response.status(404).end()
            }

            note.content = content
            note.important = important

            return note.save().then(updatedNote => {
                response.json(updatedNote)
            })
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unkown endpoint' })
}
app.use(unknownEndpoint)

// has to be the last loaded middlewear
const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)

// binds the app to listen to the requests made on the PORT
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server running on port: ${PORT}`)
})
