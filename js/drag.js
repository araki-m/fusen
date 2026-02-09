var Drag = (function () {
  'use strict';

  var draggedNoteId = null;
  var draggedColId = null;
  var placeholder = null;
  var colPlaceholder = null;

  function init(boardEl) {
    boardEl.addEventListener('dragstart', onDragStart);
    boardEl.addEventListener('dragover', onDragOver);
    boardEl.addEventListener('dragleave', onDragLeave);
    boardEl.addEventListener('drop', onDrop);
    boardEl.addEventListener('dragend', onDragEnd);
  }

  function onDragStart(e) {
    // Column drag: started from column-header drag handle
    var handle = e.target.closest('.column-drag-handle');
    if (handle) {
      var colEl = handle.closest('.column');
      if (!colEl) return;
      draggedColId = colEl.dataset.colId;
      colEl.classList.add('column-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'col:' + draggedColId);
      return;
    }

    // Note drag
    var noteEl = e.target.closest('.note');
    if (!noteEl) return;

    draggedNoteId = noteEl.dataset.noteId;
    noteEl.classList.add('dragging');

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedNoteId);

    setTimeout(function () {
      if (noteEl) noteEl.classList.add('dragging');
    }, 0);
  }

  function onDragOver(e) {
    // Column drag
    if (draggedColId) {
      var boardEl = document.getElementById('board');
      // Only accept drag over columns or the board itself
      var overCol = e.target.closest('.column');
      if (!overCol && !e.target.closest('#board')) return;

      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      ensureColPlaceholder();

      if (overCol && overCol.dataset.colId !== draggedColId) {
        var rect = overCol.getBoundingClientRect();
        var midX = rect.left + rect.width / 2;
        if (e.clientX < midX) {
          boardEl.insertBefore(colPlaceholder, overCol);
        } else {
          var next = overCol.nextElementSibling;
          if (next) {
            boardEl.insertBefore(colPlaceholder, next);
          } else {
            boardEl.appendChild(colPlaceholder);
          }
        }
      }
      return;
    }

    // Note drag
    var noteList = e.target.closest('.note-list');
    if (!noteList) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    noteList.classList.add('drag-over');

    ensurePlaceholder();

    var afterEl = getDragAfterElement(noteList, e.clientY);
    if (afterEl) {
      noteList.insertBefore(placeholder, afterEl);
    } else {
      noteList.appendChild(placeholder);
    }
  }

  function onDragLeave(e) {
    if (draggedColId) return;

    var noteList = e.target.closest('.note-list');
    if (!noteList) return;

    var related = e.relatedTarget;
    if (related && noteList.contains(related)) return;

    noteList.classList.remove('drag-over');
  }

  function onDrop(e) {
    e.preventDefault();

    // Column drop
    if (draggedColId) {
      var boardEl = document.getElementById('board');
      // Calculate target index from placeholder position
      var toIndex = 0;
      var children = Array.from(boardEl.children);
      for (var i = 0; i < children.length; i++) {
        if (children[i] === colPlaceholder) break;
        if (children[i].classList.contains('column') && !children[i].classList.contains('column-dragging')) {
          toIndex++;
        }
      }
      Store.moveColumn(draggedColId, toIndex);
      cleanup();
      return;
    }

    // Note drop
    var noteList = e.target.closest('.note-list');
    if (!noteList || !draggedNoteId) return;

    var toColId = noteList.dataset.colId;

    var toIndex = 0;
    var placeholderIdx = Array.from(noteList.children).indexOf(placeholder);
    Array.from(noteList.children).forEach(function (child, i) {
      if (i < placeholderIdx && child.classList.contains('note') && !child.classList.contains('dragging')) {
        toIndex++;
      }
    });

    Store.moveNote(draggedNoteId, toColId, toIndex);
    cleanup();
  }

  function onDragEnd(e) {
    cleanup();
  }

  function cleanup() {
    document.querySelectorAll('.note.dragging').forEach(function (el) {
      el.classList.remove('dragging');
    });
    document.querySelectorAll('.column.column-dragging').forEach(function (el) {
      el.classList.remove('column-dragging');
    });
    document.querySelectorAll('.note-list.drag-over').forEach(function (el) {
      el.classList.remove('drag-over');
    });
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
    if (colPlaceholder && colPlaceholder.parentNode) {
      colPlaceholder.parentNode.removeChild(colPlaceholder);
    }
    placeholder = null;
    colPlaceholder = null;
    draggedNoteId = null;
    draggedColId = null;
  }

  function ensurePlaceholder() {
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'drop-placeholder';
    }
  }

  function ensureColPlaceholder() {
    if (!colPlaceholder) {
      colPlaceholder = document.createElement('div');
      colPlaceholder.className = 'column-drop-placeholder';
    }
  }

  function getDragAfterElement(noteList, y) {
    var elements = Array.from(noteList.querySelectorAll('.note:not(.dragging)'));
    var closest = null;
    var closestOffset = Number.NEGATIVE_INFINITY;

    elements.forEach(function (el) {
      var box = el.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closestOffset) {
        closestOffset = offset;
        closest = el;
      }
    });

    return closest;
  }

  return {
    init: init
  };
})();
