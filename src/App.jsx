import { useState, useEffect } from 'react'
import { db } from '../firebase.config';
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [todoDate, setTodoDate] = useState('');
  const todosCollectionRef = collection(db, "todos");

  useEffect(() => {
    const unsubscribe = onSnapshot(todosCollectionRef, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
    });
    return unsubscribe; // Unsubscribe listener when component unmounts
  }, []);

  const addTodo = async () => {
    if (newTodo.trim() !== '') {
      await addDoc(todosCollectionRef, {
        text: newTodo,
        completed: false,
        date: todoDate
      });
      setNewTodo('');
      setTodoDate('');
    }
  }

  const toggleTodo = async (id, completed) => {
    const todoDocRef = doc(db, "todos", id);
    await updateDoc(todoDocRef, { completed: !completed });
  }

  const deleteTodo = async (id) => {
    const todoDocRef = doc(db, "todos", id);
    await deleteDoc(todoDocRef);
  }

  const deleteCompletedTodos = async () => {
    todos.forEach(async todo => {
      if (todo.completed) {
        await deleteTodo(todo.id);
      }
    });
  }


  return (
    <div className="container mx-auto mt-10 p-4 bg-gray-100 rounded-md shadow-md max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Todo App</h1>
      <div className="flex flex-col mb-4">
        <div className="flex mb-2">
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Add New Todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            onClick={addTodo}
          >
            Add
          </button>
        </div>
        <div className="flex items-center">
          <label htmlFor="todo-date" className="mr-2 text-gray-700 text-sm font-bold">Date:</label>
          <input
            type="date"
            id="todo-date"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={todoDate}
            onChange={(e) => setTodoDate(e.target.value)}
          />
        </div>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="flex justify-between items-center mb-2 p-2 rounded hover:bg-gray-200">
            <span
              className={`cursor-pointer ${todo.completed ? 'line-through text-gray-500' : ''}`}
              onClick={() => toggleTodo(todo.id, todo.completed)}
            >
              {todo.text} {todo.date && <span className="text-gray-500 text-sm ml-2">({todo.date})</span>}
            </span>
            <div>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline text-sm mr-2"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {todos.filter(todo => todo.completed).length > 0 && (
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
          onClick={deleteCompletedTodos}
        >
          Delete Completed Tasks
        </button>
      )}
    </div>
  )
}

export default App
