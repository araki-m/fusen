var NoteView = (function () {
  'use strict';

  function createNoteEl(note) {
    var el = document.createElement('div');
    el.className = 'note';
    el.setAttribute('draggable', 'true');
    el.dataset.noteId = note.id;
    el.dataset.color = note.color || 'yellow';
    el.dataset.priority = note.priority || 'medium';
    updateNoteEl(el, note);
    return el;
  }

  function updateNoteEl(el, note) {
    el.dataset.color = note.color || 'yellow';
    el.dataset.priority = note.priority || 'medium';

    var dueDateHtml = '';
    if (note.dueDate) {
      var dueClass = '';
      if (Util.isOverdue(note.dueDate)) {
        dueClass = 'overdue';
      } else if (Util.isDueToday(note.dueDate)) {
        dueClass = 'due-today';
      }
      dueDateHtml = '<span class="note-due ' + dueClass + '">' + Util.escapeHtml(Util.formatDate(note.dueDate)) + '</span>';
    }

    var tagsHtml = '';
    if (note.tags && note.tags.length > 0) {
      tagsHtml = '<div class="note-tags">' +
        note.tags.map(function (t) {
          return '<span class="note-tag">' + Util.escapeHtml(t) + '</span>';
        }).join('') +
        '</div>';
    }

    var descHtml = '';
    if (note.description) {
      descHtml = '<div class="note-desc">' + Util.escapeHtml(note.description) + '</div>';
    }

    var timeHtml = '';
    var est = Util.formatTime(note.estimatedTime);
    var act = Util.formatTime(note.actualTime);
    if (est || act) {
      var parts = [];
      if (est) parts.push('<span class="note-time-est" title="Estimated">' + est + '</span>');
      if (act) parts.push('<span class="note-time-act" title="Actual">' + act + '</span>');
      timeHtml = '<span class="note-time">' + parts.join('<span class="note-time-sep">/</span>') + '</span>';
    }

    el.innerHTML =
      '<button class="note-delete-btn" data-action="delete-note" data-note-id="' + note.id + '" title="Delete">&times;</button>' +
      '<div class="note-title">' +
        '<span class="note-priority-dot"></span>' +
        Util.escapeHtml(note.title) +
      '</div>' +
      descHtml +
      '<div class="note-footer">' +
        tagsHtml +
        timeHtml +
        dueDateHtml +
      '</div>';
  }

  return {
    createNoteEl: createNoteEl,
    updateNoteEl: updateNoteEl
  };
})();
