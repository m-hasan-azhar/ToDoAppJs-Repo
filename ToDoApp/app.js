// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBaIw2pir3qo0rZ6camykRFd0eNvVy_bVI",
  authDomain: "jawanpakistan-to-do-app.firebaseapp.com",
  projectId: "jawanpakistan-to-do-app",
  storageBucket: "jawanpakistan-to-do-app.firebasestorage.app",
  messagingSenderId: "473026208418",
  appId: "1:473026208418:web:438e0f2d04d27cbd0badfb",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Register, Login & Logout Functions
function register() {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (!firstName || !lastName || !email || !password) {
    alert("All fields are required!");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("User Registered: " + userCredential.user.email);
      console.log("User details:", userCredential);
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
      console.error("Error registering user:", error);
    });
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter both email and password!");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Login Successful: " + userCredential.user.email);
      window.location.href = "ToDoApp.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
      console.error("Error logging in:", error);
    });
}
function logout() {
  signOut(auth)
    .then(() => {
      alert("Logged out successfully!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Error logging out: " + error.message);
    });
}

//To-Do Page Implementations
function getUserDocRef() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return doc(db, "todos", user.email);
}

async function addTodo() {
  const todoInput = document.getElementById("todoInput").value;
  if (!todoInput) return alert("Please enter a todo!");

  try {
    const userDocRef = getUserDocRef();
    const docSnap = await getDoc(userDocRef);

    const tasks = docSnap.exists() ? docSnap.data().tasks || [] : [];
    tasks.push(todoInput);

    await setDoc(userDocRef, { tasks });
    document.getElementById("todoInput").value = "";
    alert("Todo added successfully!");
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

function fetchTodos() {
  try {
    const userDocRef = getUserDocRef();

    onSnapshot(userDocRef, (docSnapshot) => {
      const todoList = document.getElementById("todoList");
      todoList.innerHTML = "";

      const tasks = docSnapshot.exists() ? docSnapshot.data().tasks || [] : [];
      tasks.forEach((task) => {
        const li = document.createElement("li");
        li.innerHTML =
          task + " <button onclick=\"deleteTodo('" + task + "')\">-</button>";
        todoList.appendChild(li);
      });

      document.getElementById("todoCount").textContent =
        "You have " + tasks.length + " todos";
    });
  } catch (error) {
    console.error(error.message);
  }
}

async function deleteTodo(task) {
  try {
    const userDocRef = getUserDocRef();
    await updateDoc(userDocRef, { tasks: arrayRemove(task) });
    alert("Todo deleted successfully!");
  } catch (error) {
    alert("Error: " + error.message);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in: " + user.email);
    if (window.location.pathname.includes("ToDoApp.html")) {
      fetchTodos();
    }
  } else {
    console.log("User logged out");
  }
});

window.register = register;
window.login = login;
window.logout = logout;
window.addTodo = addTodo;
window.deleteTodo = deleteTodo;
window.getUserDocRef = getUserDocRef;
