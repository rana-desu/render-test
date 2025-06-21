// imports the web-server module from node (defined as http)
// into the consntant http
// const http = require('http')

// express is a node module which makes it easaier to work with web-server
// and the built-in http module for node by providing a bunch of abstractions.
const express = require('express')
const cors = require('cors')

const app = express() // initialise app with express function

// Express json-parser, to handle the JSON data in request bodies
// JSON is essentially represented as strings rather than objects
// to convert these strings into objects, json-parser is required.

// cors is a middleware used as a workaround for the same origin policy
// (that is used for security reasons).
app.use(express.json())
app.use(cors())

app.use(express.static('dist'))

let notes = [
    {
        id: "1",
        content: "HTML is easy",
        important: true
    },
    {
        id: "2",
        content: "CSS is easy",
        important: false
    },
    {
        id: "3",
        content: "JavaScript is shit",
        important: true
    },    
]

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
    response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find(note => note.id === id)
    
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => Number(n.id)))
        : 0
    // the above block does the following:
    // assigns the highest value of ID available from the current state of notes
    // meaning, the new note is always assigned with the highest ID + 1.

    return maxId + 1
}

app.post('/api/notes', (request, response) => {
    const body = request.body // without json-parser, this would be undefined (or if it isn't JSON)

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    
    // only take the fields we want from the request body
    const note = {
        content: body.content,
        important: body.important || false,
        id: generateId(),
    }

    notes = notes.concat(note)
    
    response.json(note)
})

// binds the app to listen to the requests made on the PORT
const PORT = process.env.port || 3001
app.listen(PORT, () => {
    console.log(`server running on port: ${PORT}`)
})
