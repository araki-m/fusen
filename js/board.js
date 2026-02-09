var Board = (function () {
  'use strict';

  var boardEl = null;

  function init(el) {
    boardEl = el;
  }

  function render() {
    if (!boardEl) return;
    var board = Store.getBoard();
    boardEl.innerHTML = '';

    board.columnOrder.forEach(function (colId) {
      var col = board.columns[colId];
      if (!col) return;

      var visibleNotes = getVisibleNotes(col, board);
      var colEl = ColumnView.createColumnEl(col, visibleNotes.length);
      var noteListEl = colEl.querySelector('.note-list');

      visibleNotes.forEach(function (note) {
        var noteEl = NoteView.createNoteEl(note);
        noteListEl.appendChild(noteEl);
      });

      boardEl.appendChild(colEl);
    });

    // Add column button
    var addColBtn = document.createElement('button');
    addColBtn.className = 'add-column-btn';
    addColBtn.dataset.action = 'add-column';
    addColBtn.textContent = '+ Add Column';
    boardEl.appendChild(addColBtn);
  }

  function getVisibleNotes(col, board) {
    var filterState = typeof Filter !== 'undefined' ? Filter.getState() : null;
    var notes = [];
    col.noteOrder.forEach(function (noteId) {
      var note = board.notes[noteId];
      if (!note) return;
      if (filterState && !matchesFilter(note, filterState)) return;
      notes.push(note);
    });
    return notes;
  }

  function matchesFilter(note, f) {
    // Text search
    if (f.search) {
      var q = f.search.toLowerCase();
      var haystack = (note.title + ' ' + note.description + ' ' + (note.tags || []).join(' ')).toLowerCase();
      if (haystack.indexOf(q) === -1) return false;
    }
    // Priority filter
    if (f.priority && f.priority !== 'all') {
      if (note.priority !== f.priority) return false;
    }
    // Tag filter
    if (f.tag && f.tag !== 'all') {
      if (!note.tags || note.tags.indexOf(f.tag) === -1) return false;
    }
    // Due filter
    if (f.due && f.due !== 'all') {
      if (f.due === 'overdue' && !Util.isOverdue(note.dueDate)) return false;
      if (f.due === 'today' && !Util.isDueToday(note.dueDate)) return false;
      if (f.due === 'week' && !Util.isDueThisWeek(note.dueDate)) return false;
    }
    return true;
  }

  return {
    init: init,
    render: render
  };
})();
