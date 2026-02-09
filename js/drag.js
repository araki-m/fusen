var Drag = (function () {
  'use strict';

  var draggedNoteId = null;
  var placeholder = null;

  function init(boardEl) {
    boardEl.addEventListener('dragstart', onDragStart);
    boardEl.addEventListener('dragover', onDragOver);
    boardEl.addEventListener('dragleave', onDragLeave);
    boardEl.addEventListener('drop', onDrop);
    boardEl.addEventListener('dragend', onDragEnd);
  }

  function onDragStart(e) {
    var noteEl = e.target.closest('.note');
    if (!noteEl) return;

    draggedNoteId = noteEl.dataset.noteId;
    noteEl.classList.add('dragging');

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedNoteId);

    // Small delay so the dragging class is visible
    setTimeout(function () {
      if (noteEl) noteEl.classList.add('dragging');
    }, 0);
  }

  function onDragOver(e) {
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
    var noteList = e.target.closest('.note-list');
    if (!noteList) return;

    // Only remove if actually leaving the note-list
    var related = e.relatedTarget;
    if (related && noteList.contains(related)) return;

    noteList.classList.remove('drag-over');
  }

  function onDrop(e) {
    e.preventDefault();
    var noteList = e.target.closest('.note-list');
    if (!noteList || !draggedNoteId) return;

    var toColId = noteList.dataset.colId;

    // Calculate insertion index
    var toIndex = 0;
    var children = Array.from(noteList.querySelectorAll('.note:not(.dragging)'));
    var placeholderIdx = Array.from(noteList.children).indexOf(placeholder);
    // Count real notes before the placeholder
    toIndex = 0;
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
    // Remove dragging class from all notes
    document.querySelectorAll('.note.dragging').forEach(function (el) {
      el.classList.remove('dragging');
    });
    // Remove drag-over from all note lists
    document.querySelectorAll('.note-list.drag-over').forEach(function (el) {
      el.classList.remove('drag-over');
    });
    // Remove placeholder
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
    placeholder = null;
    draggedNoteId = null;
  }

  function ensurePlaceholder() {
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'drop-placeholder';
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
