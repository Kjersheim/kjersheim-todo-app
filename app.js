const express = require('express');
const cors = require('cors');
const app = express();
const port = 5001;
// CORS - allow connection from different domains and ports
app.use(cors());
// convert json string to json object (from request)
app.use(express.json());
// MONGODB/MONGOOSE -  Connection String, Mongoose connection
const mongoose = require('mongoose');
const mongoDB = 'mongodb+srv://andreaskjersheim:akjmongodb%23555@kjersheimmongodbcluster.mraxrlj.mongodb.net/E08ToDo?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Database test connected');
});
// MONGOOSE SCHEMA & MODEL
// schema
const todoSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true
	}
});
// model
const Todo = mongoose.model('Todo', todoSchema, 'todos');
// ROUTES
app.post('/', async (request, response) => {
	const {text} = request.body;
	if (!text) {
		// Handle the case where the text is empty
		response.status(400).json({ error: 'Text is required for a todo.' });
		return;
	}
	const existingTodo = await Todo.findOne({ text });
	if (existingTodo) {
		// Handle the case where a duplicate todo is being added
		response.status(400).json({ error: 'Todo already exists.' });
		return;
	}
	const todo = new Todo({ text: text });
	const savedTodo = await todo.save();
	response.json(savedTodo);
});
app.get('/', async (request, response) => {
	const todos = await Todo.find({});
	response.json(todos);
});
app.get('/:id', async (request, response) => {
	const todo = await Todo.findById(request.params.id);
	if (todo)
		response.json(todo);
	else
		response.status(404).end();
});
app.put('/:id', async (request, response) => {
	const {id} = request.params;
	const {text} = request.body;
	if (!text) {
		response.status(400).json({ error: 'Text is required for updating a todo.' });
		return;
	}
	const updatedTodo = await Todo.findByIdAndUpdate(id, { text }, { new: true });
	if (updatedTodo) {
		response.json(updatedTodo);
	} else {
		response.status(404).json({ error: 'Todo not found.' });
	}
});
app.delete('/:id', async (request, response) => {
	const deletedTodo = await Todo.findByIdAndRemove(request.params.id);
	if (deletedTodo)
		response.json(deletedTodo);
	else
		response.status(404).end();
});

// Serve static files from the "client" directory
app.use(express.static(path.join(__dirname, 'client')));

// Serve the React or client application's HTML file for all routes
app.get('*', (_req, res) =>
  res.sendFile(path.join(__dirname, 'client', 'index.html')
));

// App listens to the port specified above
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});