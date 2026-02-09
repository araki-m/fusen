var App = (function () {
  'use strict';

  function init() {
    // Load state
    Store.load();

    // Init board
    var boardEl = document.getElementById('board');
    Board.init(boardEl);

    // Init drag and drop
    Drag.init(boardEl);

    // Init modal
    Modal.init();

    // Init filter
    Filter.init();

    // Init import/export
    IO.init();

    // Listen for state changes
    document.addEventListener('fusen:state-changed', function () {
      Filter.updateTagOptions();
      Board.render();
    });

    // Delegate board clicks
    boardEl.addEventListener('click', function (e) {
      var target = e.target;
      var action = target.dataset.action;

      if (action === 'add-column') {
        Store.addColumn();
        return;
      }

      if (action === 'add-note') {
        var colId = target.dataset.colId;
        Modal.openForNew(colId);
        return;
      }

      if (action === 'delete-note') {
        e.stopPropagation();
        var noteId = target.dataset.noteId;
        if (confirm('Delete this note?')) {
          Store.deleteNote(noteId);
        }
        return;
      }

      if (action === 'delete-column') {
        var delColId = target.dataset.colId;
        var col = Store.getBoard().columns[delColId];
        var noteCount = col ? col.noteOrder.length : 0;
        var msg = noteCount > 0
          ? 'Delete column "' + col.title + '" and its ' + noteCount + ' note(s)?'
          : 'Delete column "' + col.title + '"?';
        if (confirm(msg)) {
          Store.deleteColumn(delColId);
        }
        return;
      }

      // Click on note to edit
      var noteEl = target.closest('.note');
      if (noteEl && !target.closest('.note-delete-btn')) {
        Modal.openForEdit(noteEl.dataset.noteId);
        return;
      }
    });

    // Column rename (blur commits)
    boardEl.addEventListener('change', function (e) {
      if (e.target.dataset.action === 'rename-column') {
        var colId = e.target.dataset.colId;
        var newTitle = e.target.value.trim();
        if (newTitle) {
          Store.renameColumn(colId, newTitle);
        }
      }
    });

    // Also commit column rename on Enter
    boardEl.addEventListener('keydown', function (e) {
      if (e.target.dataset.action === 'rename-column' && e.key === 'Enter') {
        e.target.blur();
      }
    });

    // Initial render
    Filter.updateTagOptions();
    Board.render();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init: init };
})();
