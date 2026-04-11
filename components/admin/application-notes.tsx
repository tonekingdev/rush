"use client"

import { useState, useEffect, useCallback } from "react"
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa"

interface Note {
  id: number
  content: string
  created_by: string
  created_at: string
  updated_at: string
}

interface ApplicationNotesProps {
  applicationId: string
}

export default function ApplicationNotes({ applicationId }: ApplicationNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [editNoteContent, setEditNoteContent] = useState("")

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      // Use relative path instead of environment variable
      const response = await fetch(`/api/application-notes.php?application_id=${applicationId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch notes")
      }

      const data = await response.json()
      setNotes(data.notes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes")
      console.error("Error fetching notes:", err)
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = async () => {
    if (!newNoteContent.trim()) return

    try {
      const response = await fetch(`/api/application-notes.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application_id: applicationId,
          content: newNoteContent,
          created_by: "Admin User", // This should come from auth context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add note")
      }

      setNewNoteContent("")
      setIsAddingNote(false)
      fetchNotes() // Refresh notes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note")
      console.error("Error adding note:", err)
    }
  }

  const updateNote = async (noteId: number) => {
    if (!editNoteContent.trim()) return

    try {
      const response = await fetch(`/api/application-notes.php`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: noteId,
          content: editNoteContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update note")
      }

      setEditingNoteId(null)
      setEditNoteContent("")
      fetchNotes() // Refresh notes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note")
      console.error("Error updating note:", err)
    }
  }

  const deleteNote = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const response = await fetch(`/api/application-notes.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: noteId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete note")
      }

      fetchNotes() // Refresh notes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note")
      console.error("Error deleting note:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Notes</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Application Notes</h3>
        <button
          onClick={() => setIsAddingNote(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#1586D6] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="h-3 w-3 mr-1" />
          Add Note
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {/* Add new note form */}
      {isAddingNote && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Enter your note..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => {
                setIsAddingNote(false)
                setNewNoteContent("")
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaTimes className="h-3 w-3 mr-1" />
              Cancel
            </button>
            <button
              onClick={addNote}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#1586D6] hover:bg-blue-700"
            >
              <FaSave className="h-3 w-3 mr-1" />
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notes available for this application.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4">
              {editingNoteId === note.id ? (
                <div>
                  <textarea
                    value={editNoteContent}
                    onChange={(e) => setEditNoteContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingNoteId(null)
                        setEditNoteContent("")
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaTimes className="h-3 w-3 mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={() => updateNote(note.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#1586D6] hover:bg-blue-700"
                    >
                      <FaSave className="h-3 w-3 mr-1" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-500">
                      By {note.created_by} on {formatDate(note.created_at)}
                      {note.updated_at !== note.created_at && <span className="ml-2 text-gray-400">(edited)</span>}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id)
                          setEditNoteContent(note.content)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit note"
                      >
                        <FaEdit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete note"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}