var Store = (function () {
  'use strict';

  var STORAGE_KEY = 'fusen-board';
  var state = null;

  function defaultState() {
    var colId1 = Util.generateId('col');
    var colId2 = Util.generateId('col');
    var colId3 = Util.generateId('col');
    return {
      version: 1,
      board: {
        title: 'My Board',
        columnOrder: [colId1, colId2, colId3],
        columns: {
          [colId1]: { id: colId1, title: 'To Do', noteOrder: [] },
          [colId2]: { id: colId2, title: 'In Progress', noteOrder: [] },
          [colId3]: { id: colId3, title: 'Done', noteOrder: [] }
        },
        notes: {},
        tags: [],
        settings: { defaultColor: 'yellow', defaultPriority: 'medium' }
      }
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        if (!state.board.settings) {
          state.board.settings = { defaultColor: 'yellow', defaultPriority: 'medium' };
        }
        if (!state.board.tags) {
          state.board.tags = [];
        }
        return;
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    state = defaultState();
  }

  var persistDebounced = Util.debounce(function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, 300);

  function emit() {
    document.dispatchEvent(new CustomEvent('fusen:state-changed'));
    persistDebounced();
  }

  function getState() {
    return state;
  }

  function getBoard() {
    return state.board;
  }

  // --- Column operations ---

  function addColumn(title) {
    var id = Util.generateId('col');
    state.board.columns[id] = { id: id, title: title || 'New Column', noteOrder: [] };
    state.board.columnOrder.push(id);
    emit();
    return id;
  }

  function renameColumn(colId, title) {
    if (state.board.columns[colId]) {
      state.board.columns[colId].title = title;
      emit();
    }
  }

  function deleteColumn(colId) {
    var col = state.board.columns[colId];
    if (!col) return;
    // Delete all notes in the column
    col.noteOrder.forEach(function (noteId) {
      delete state.board.notes[noteId];
    });
    delete state.board.columns[colId];
    state.board.columnOrder = state.board.columnOrder.filter(function (id) {
      return id !== colId;
    });
    emit();
  }

  // --- Note operations ---

  function addNote(colId, noteData) {
    var id = Util.generateId('note');
    var now = Util.nowISO();
    var defaults = state.board.settings || {};
    state.board.notes[id] = {
      id: id,
      title: noteData.title || 'New Note',
      description: noteData.description || '',
      color: noteData.color || defaults.defaultColor || 'yellow',
      priority: noteData.priority || defaults.defaultPriority || 'medium',
      dueDate: noteData.dueDate || '',
      tags: noteData.tags || [],
      createdAt: now,
      updatedAt: now
    };
    if (state.board.columns[colId]) {
      state.board.columns[colId].noteOrder.push(id);
    }
    // Track new tags
    syncTags();
    emit();
    return id;
  }

  function updateNote(noteId, changes) {
    var note = state.board.notes[noteId];
    if (!note) return;
    Object.keys(changes).forEach(function (key) {
      if (key !== 'id' && key !== 'createdAt') {
        note[key] = changes[key];
      }
    });
    note.updatedAt = Util.nowISO();
    syncTags();
    emit();
  }

  function deleteNote(noteId) {
    delete state.board.notes[noteId];
    // Remove from column noteOrder
    state.board.columnOrder.forEach(function (colId) {
      var col = state.board.columns[colId];
      if (col) {
        col.noteOrder = col.noteOrder.filter(function (id) {
          return id !== noteId;
        });
      }
    });
    emit();
  }

  function moveNote(noteId, toColId, toIndex) {
    // Remove from current column
    state.board.columnOrder.forEach(function (colId) {
      var col = state.board.columns[colId];
      if (col) {
        var idx = col.noteOrder.indexOf(noteId);
        if (idx !== -1) {
          col.noteOrder.splice(idx, 1);
        }
      }
    });
    // Insert into target column
    var targetCol = state.board.columns[toColId];
    if (targetCol) {
      if (typeof toIndex === 'number' && toIndex >= 0) {
        targetCol.noteOrder.splice(toIndex, 0, noteId);
      } else {
        targetCol.noteOrder.push(noteId);
      }
    }
    state.board.notes[noteId].updatedAt = Util.nowISO();
    emit();
  }

  function syncTags() {
    var tagSet = {};
    Object.keys(state.board.notes).forEach(function (noteId) {
      var note = state.board.notes[noteId];
      if (note.tags) {
        note.tags.forEach(function (t) { tagSet[t] = true; });
      }
    });
    state.board.tags = Object.keys(tagSet).sort();
  }

  // --- Import / Export ---

  function exportJSON() {
    return JSON.stringify(state, null, 2);
  }

  function importJSON(jsonStr) {
    try {
      var parsed = JSON.parse(jsonStr);
      if (!parsed.board || !parsed.board.columns || !parsed.board.notes) {
        throw new Error('Invalid format');
      }
      state = parsed;
      if (!state.board.settings) {
        state.board.settings = { defaultColor: 'yellow', defaultPriority: 'medium' };
      }
      if (!state.board.tags) {
        state.board.tags = [];
      }
      syncTags();
      emit();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  function reset() {
    state = defaultState();
    emit();
  }

  return {
    load: load,
    getState: getState,
    getBoard: getBoard,
    addColumn: addColumn,
    renameColumn: renameColumn,
    deleteColumn: deleteColumn,
    addNote: addNote,
    updateNote: updateNote,
    deleteNote: deleteNote,
    moveNote: moveNote,
    exportJSON: exportJSON,
    importJSON: importJSON,
    reset: reset
  };
})();
