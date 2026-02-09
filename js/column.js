var ColumnView = (function () {
  'use strict';

  function createColumnEl(col, noteCount) {
    var el = document.createElement('div');
    el.className = 'column';
    el.dataset.colId = col.id;

    el.innerHTML =
      '<div class="column-header">' +
        '<input class="column-title" type="text" value="' + Util.escapeHtml(col.title) + '" data-action="rename-column" data-col-id="' + col.id + '">' +
        '<span class="column-count">' + noteCount + '</span>' +
        '<div class="column-actions">' +
          '<button class="column-btn delete-btn" data-action="delete-column" data-col-id="' + col.id + '" title="Delete column">&times;</button>' +
        '</div>' +
      '</div>' +
      '<div class="note-list" data-col-id="' + col.id + '"></div>' +
      '<button class="add-note-btn" data-action="add-note" data-col-id="' + col.id + '">+ Add Note</button>';

    return el;
  }

  function updateCount(colEl, count) {
    var countEl = colEl.querySelector('.column-count');
    if (countEl) {
      countEl.textContent = count;
    }
  }

  return {
    createColumnEl: createColumnEl,
    updateCount: updateCount
  };
})();
