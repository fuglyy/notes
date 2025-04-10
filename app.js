// DOM Elements
const noteForm = document.getElementById("note-form")
const noteInput = document.getElementById("note-input")
const notesContainer = document.getElementById("notes-container")
const offlineIndicator = document.getElementById("offline-indicator")
const editModal = document.getElementById("edit-modal")
const editNoteInput = document.getElementById("edit-note-input")
const saveEditBtn = document.getElementById("save-edit-btn")
const cancelEditBtn = document.getElementById("cancel-edit-btn")

// State
let notes = []
let currentEditId = null

// Initialize the app
function init() {
  // Ensure modal is hidden on initialization
  editModal.classList.add("hidden")

  // Load notes from localStorage
  loadNotes()

  // Render notes
  renderNotes()

  // Set up event listeners
  setupEventListeners()

  // Check online status
  updateOnlineStatus()

  // Register service worker
  registerServiceWorker()
}

// Load notes from localStorage
function loadNotes() {
  const storedNotes = localStorage.getItem("notes")
  if (storedNotes) {
    notes = JSON.parse(storedNotes)
  }
}

// Save notes to localStorage
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes))
}

// Render notes
function renderNotes() {
  // Clear the container
  notesContainer.innerHTML = ""

  // If no notes, show a message
  if (notes.length === 0) {
    notesContainer.innerHTML = '<div class="empty-notes">У вас пока нет заметок. Создайте первую!</div>'
    return
  }

  // Sort notes by creation date (newest first)
  const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Create note elements
  sortedNotes.forEach((note) => {
    const noteElement = createNoteElement(note)
    notesContainer.appendChild(noteElement)
  })
}

// Create a note element
function createNoteElement(note) {
  const noteElement = document.createElement("div")
  noteElement.className = "note-card"
  noteElement.dataset.id = note.id

  const noteText = document.createElement("div")
  noteText.className = "note-text"
  noteText.textContent = note.text

  const noteDate = document.createElement("div")
  noteDate.className = "note-date"
  noteDate.textContent = formatDate(note.createdAt)

  const noteActions = document.createElement("div")
  noteActions.className = "note-actions"

  const editButton = document.createElement("button")
  editButton.className = "edit-btn"
  editButton.textContent = "Изменить"
  editButton.addEventListener("click", () => openEditModal(note))

  const deleteButton = document.createElement("button")
  deleteButton.className = "delete-btn"
  deleteButton.textContent = "Удалить"
  deleteButton.addEventListener("click", () => deleteNote(note.id))

  noteActions.appendChild(editButton)
  noteActions.appendChild(deleteButton)

  noteElement.appendChild(noteText)
  noteElement.appendChild(noteDate)
  noteElement.appendChild(noteActions)

  return noteElement
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Add a new note
function addNote(text) {
  const newNote = {
    id: Date.now().toString(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  }

  notes.push(newNote)
  saveNotes()
  renderNotes()
}

// Delete a note
function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id)
  saveNotes()
  renderNotes()
}

// Update a note
function updateNote(id, text) {
  notes = notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        text: text.trim(),
      }
    }
    return note
  })

  saveNotes()
  renderNotes()
}

// Open edit modal
function openEditModal(note) {
  currentEditId = note.id
  editNoteInput.value = note.text
  editModal.classList.remove("hidden")
  editNoteInput.focus()
}

// Close edit modal
function closeEditModal() {
  editModal.classList.add("hidden")
  currentEditId = null
}

// Update online status
function updateOnlineStatus() {
  if (navigator.onLine) {
    offlineIndicator.classList.add("hidden")
  } else {
    offlineIndicator.classList.remove("hidden")
  }
}

// Set up event listeners
function setupEventListeners() {
  // Form submission
  noteForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const text = noteInput.value.trim()
    if (text) {
      addNote(text)
      noteInput.value = ""
    }
  })

  // Edit modal
  saveEditBtn.addEventListener("click", () => {
    const text = editNoteInput.value.trim()
    if (text && currentEditId) {
      updateNote(currentEditId, text)
      closeEditModal()
    }
  })

  cancelEditBtn.addEventListener("click", closeEditModal)

  // Close modal when clicking outside
  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) {
      closeEditModal()
    }
  })

  // Online/offline events
  window.addEventListener("online", updateOnlineStatus)
  window.addEventListener("offline", updateOnlineStatus)
}

// Register service worker
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/notes/sw.js")
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope)
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error)
      })
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", init)
