var Modal = (function () {
  'use strict';

  var overlayEl = null;
  var currentNoteId = null;
  var currentColId = null;
  var isNew = false;

  var COLORS = ['yellow', 'pink', 'blue', 'green', 'orange', 'purple', 'mint', 'peach'];
  var PRIORITIES = ['low', 'medium', 'high'];

  function init() {
    overlayEl = document.getElementById('modal-overlay');
    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlayEl.classList.contains('open')) {
        close();
      }
    });
  }

  function openForNew(colId) {
    isNew = true;
    currentColId = colId;
    currentNoteId = null;
    var board = Store.getBoard();
    var defaults = board.settings || {};
    renderForm({
      title: '',
      description: '',
      color: defaults.defaultColor || 'yellow',
      priority: defaults.defaultPriority || 'medium',
      dueDate: '',
      estimatedTime: '',
      actualTime: '',
      tags: []
    });
    overlayEl.classList.add('open');
    // Focus title input
    setTimeout(function () {
      var titleInput = overlayEl.querySelector('#note-title');
      if (titleInput) titleInput.focus();
    }, 100);
  }

  function openForEdit(noteId) {
    isNew = false;
    currentNoteId = noteId;
    currentColId = null;
    var note = Store.getBoard().notes[noteId];
    if (!note) return;
    renderForm(note);
    overlayEl.classList.add('open');
  }

  function close() {
    overlayEl.classList.remove('open');
    currentNoteId = null;
    currentColId = null;
  }

  function renderForm(data) {
    var modalEl = overlayEl.querySelector('.modal');
    modalEl.innerHTML =
      '<div class="modal-header">' +
        '<h2>' + (isNew ? 'New Note' : 'Edit Note') + '</h2>' +
        '<button class="modal-close-btn" data-action="modal-close">&times;</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="form-group">' +
          '<label for="note-title">Title</label>' +
          '<input type="text" id="note-title" placeholder="Enter title..." value="' + Util.escapeHtml(data.title) + '">' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="note-desc">Description</label>' +
          '<textarea id="note-desc" placeholder="Enter description...">' + Util.escapeHtml(data.description) + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Color</label>' +
          '<div class="color-picker">' +
            COLORS.map(function (c) {
              return '<button class="color-swatch' + (c === data.color ? ' selected' : '') + '" data-color="' + c + '" title="' + c + '"></button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="note-priority">Priority</label>' +
          '<select id="note-priority">' +
            PRIORITIES.map(function (p) {
              return '<option value="' + p + '"' + (p === data.priority ? ' selected' : '') + '>' + p.charAt(0).toUpperCase() + p.slice(1) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="note-due">Due Date</label>' +
          '<input type="date" id="note-due" value="' + (data.dueDate || '') + '">' +
        '</div>' +
        '<div class="form-row">' +
          '<div class="form-group form-group-half">' +
            '<label for="note-est-time">Estimated Time (h)</label>' +
            '<input type="number" id="note-est-time" placeholder="e.g. 2.5" min="0" step="0.25" value="' + (data.estimatedTime || '') + '">' +
          '</div>' +
          '<div class="form-group form-group-half">' +
            '<label for="note-act-time">Actual Time (h)</label>' +
            '<input type="number" id="note-act-time" placeholder="e.g. 3" min="0" step="0.25" value="' + (data.actualTime || '') + '">' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Tags</label>' +
          '<div class="tags-input-wrap" id="tags-wrap">' +
            (data.tags || []).map(function (t) {
              return '<span class="tag-chip" data-tag="' + Util.escapeHtml(t) + '">' + Util.escapeHtml(t) + '<button data-action="remove-tag">&times;</button></span>';
            }).join('') +
            '<input type="text" id="tag-input" placeholder="Type and press Enter...">' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
        (isNew ? '' : '<button class="btn btn-danger" data-action="modal-delete">Delete</button>') +
        '<span style="flex:1"></span>' +
        '<button class="btn btn-secondary" data-action="modal-close">Cancel</button>' +
        '<button class="btn btn-primary" data-action="modal-save">Save</button>' +
      '</div>';

    bindFormEvents(modalEl);
  }

  function bindFormEvents(modalEl) {
    // Color picker
    modalEl.querySelectorAll('.color-swatch').forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        modalEl.querySelectorAll('.color-swatch').forEach(function (s) { s.classList.remove('selected'); });
        swatch.classList.add('selected');
      });
    });

    // Tags
    var tagInput = modalEl.querySelector('#tag-input');
    var tagsWrap = modalEl.querySelector('#tags-wrap');

    tagInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = tagInput.value.trim();
        if (val && !tagExists(tagsWrap, val)) {
          addTagChip(tagsWrap, tagInput, val);
        }
        tagInput.value = '';
      } else if (e.key === 'Backspace' && !tagInput.value) {
        var chips = tagsWrap.querySelectorAll('.tag-chip');
        if (chips.length > 0) {
          chips[chips.length - 1].remove();
        }
      }
    });

    tagsWrap.addEventListener('click', function (e) {
      if (e.target.dataset.action === 'remove-tag') {
        e.target.closest('.tag-chip').remove();
      }
      tagInput.focus();
    });

    // Buttons
    modalEl.addEventListener('click', function (e) {
      var action = e.target.dataset.action;
      if (action === 'modal-close') close();
      if (action === 'modal-save') save(modalEl);
      if (action === 'modal-delete') deleteNote();
    });
  }

  function tagExists(wrap, tag) {
    var chips = wrap.querySelectorAll('.tag-chip');
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].dataset.tag === tag) return true;
    }
    return false;
  }

  function addTagChip(wrap, beforeEl, tag) {
    var chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.dataset.tag = tag;
    chip.innerHTML = Util.escapeHtml(tag) + '<button data-action="remove-tag">&times;</button>';
    wrap.insertBefore(chip, beforeEl);
  }

  function save(modalEl) {
    var title = modalEl.querySelector('#note-title').value.trim();
    if (!title) {
      modalEl.querySelector('#note-title').focus();
      return;
    }

    var estVal = modalEl.querySelector('#note-est-time').value;
    var actVal = modalEl.querySelector('#note-act-time').value;

    var data = {
      title: title,
      description: modalEl.querySelector('#note-desc').value.trim(),
      color: getSelectedColor(modalEl),
      priority: modalEl.querySelector('#note-priority').value,
      dueDate: modalEl.querySelector('#note-due').value,
      estimatedTime: estVal !== '' ? parseFloat(estVal) : '',
      actualTime: actVal !== '' ? parseFloat(actVal) : '',
      tags: getTagsFromChips(modalEl)
    };

    if (isNew) {
      Store.addNote(currentColId, data);
    } else {
      Store.updateNote(currentNoteId, data);
    }

    close();
  }

  function deleteNote() {
    if (currentNoteId && confirm('Delete this note?')) {
      Store.deleteNote(currentNoteId);
      close();
    }
  }

  function getSelectedColor(modalEl) {
    var selected = modalEl.querySelector('.color-swatch.selected');
    return selected ? selected.dataset.color : 'yellow';
  }

  function getTagsFromChips(modalEl) {
    var tags = [];
    modalEl.querySelectorAll('.tag-chip').forEach(function (chip) {
      tags.push(chip.dataset.tag);
    });
    return tags;
  }

  return {
    init: init,
    openForNew: openForNew,
    openForEdit: openForEdit,
    close: close
  };
})();
