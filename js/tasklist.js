var TaskList = (function () {
  'use strict';

  var el = null;
  var sortKey = 'dueDate'; // dueDate | priority | column | title

  var PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  var PRIORITY_LABEL = { high: '高', medium: '中', low: '低' };

  function init() {
    el = document.getElementById('tasklist-view');
  }

  function render() {
    if (!el) return;

    var board   = Store.getBoard();
    var notes   = board.notes;
    var columns = board.columns;

    // noteId -> { colId, colTitle, colIndex }
    var noteColMap = {};
    board.columnOrder.forEach(function (colId, colIndex) {
      var col = columns[colId];
      if (col) {
        col.noteOrder.forEach(function (noteId) {
          noteColMap[noteId] = { colId: colId, colTitle: col.title, colIndex: colIndex };
        });
      }
    });

    // Collect all notes that belong to a column
    var items = Object.keys(noteColMap).map(function (noteId) {
      return { note: notes[noteId], col: noteColMap[noteId] };
    }).filter(function (item) { return !!item.note; });

    // Sort
    items.sort(function (a, b) {
      if (sortKey === 'dueDate') {
        var da = a.note.dueDate || '9999-99-99';
        var db = b.note.dueDate || '9999-99-99';
        return da < db ? -1 : da > db ? 1 : 0;
      }
      if (sortKey === 'priority') {
        return (PRIORITY_ORDER[a.note.priority] || 1) - (PRIORITY_ORDER[b.note.priority] || 1);
      }
      if (sortKey === 'column') {
        return a.col.colIndex - b.col.colIndex;
      }
      if (sortKey === 'title') {
        return a.note.title < b.note.title ? -1 : a.note.title > b.note.title ? 1 : 0;
      }
      return 0;
    });

    var html = '';

    // Sort controls
    html += '<div class="tl-toolbar">';
    html += '<span class="tl-count">' + items.length + ' 件</span>';
    html += '<div class="tl-sort-group">';
    html += '<span class="tl-sort-label">並び順：</span>';
    [
      { key: 'dueDate',  label: '期限' },
      { key: 'priority', label: '優先度' },
      { key: 'column',   label: 'カラム' },
      { key: 'title',    label: 'タイトル' }
    ].forEach(function (s) {
      html += '<button class="tl-sort-btn' + (sortKey === s.key ? ' active' : '') + '" data-sort="' + s.key + '">' + s.label + '</button>';
    });
    html += '</div></div>';

    if (items.length === 0) {
      html += '<div class="tl-empty">タスクがありません。</div>';
      el.innerHTML = html;
      bindEvents();
      return;
    }

    // Table
    html += '<table class="tl-table">';
    html += '<thead><tr>' +
      '<th class="tl-th-priority">優先</th>' +
      '<th class="tl-th-title">タスク名</th>' +
      '<th class="tl-th-column">カラム</th>' +
      '<th class="tl-th-due">期限</th>' +
      '<th class="tl-th-due">完了日</th>' +
      '<th class="tl-th-time">予定</th>' +
      '<th class="tl-th-time">実績</th>' +
      '<th class="tl-th-tags">タグ</th>' +
    '</tr></thead><tbody>';

    var todayStr = Util.toISODate();

    items.forEach(function (item) {
      var note = item.note;
      var priority = note.priority || 'medium';

      // Due date cell
      var dueStr = '';
      var dueCls = '';
      if (note.dueDate) {
        dueStr = Util.formatDate(note.dueDate);
        if (note.dueDate < todayStr)       dueCls = 'tl-overdue';
        else if (note.dueDate === todayStr) dueCls = 'tl-due-today';
      }

      // Tags
      var tagsHtml = (note.tags || []).map(function (t) {
        return '<span class="tl-tag">' + Util.escapeHtml(t) + '</span>';
      }).join('');

      var completedStr = note.completedDate ? Util.formatDate(note.completedDate) : '';
      var rowCls = 'tl-row' + (note.completedDate ? ' tl-row-completed' : '');

      html += '<tr class="' + rowCls + '" data-note-id="' + note.id + '">' +
        '<td class="tl-td-priority"><span class="tl-priority-dot tl-priority-' + priority + '" title="' + (PRIORITY_LABEL[priority] || '') + '"></span></td>' +
        '<td class="tl-td-title">' + Util.escapeHtml(note.title) + '</td>' +
        '<td class="tl-td-column">' + Util.escapeHtml(item.col.colTitle) + '</td>' +
        '<td class="tl-td-due' + (dueCls ? ' ' + dueCls : '') + '">' + dueStr + '</td>' +
        '<td class="tl-td-completed">' + completedStr + '</td>' +
        '<td class="tl-td-time">' + (Util.formatTime(note.estimatedTime) || '-') + '</td>' +
        '<td class="tl-td-time">' + (Util.formatTime(note.actualTime)    || '-') + '</td>' +
        '<td class="tl-td-tags">' + tagsHtml + '</td>' +
      '</tr>';
    });

    html += '</tbody></table>';
    el.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    // Sort buttons
    el.querySelectorAll('[data-sort]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        sortKey = btn.dataset.sort;
        render();
      });
    });

    // Row click to edit
    el.querySelectorAll('.tl-row').forEach(function (row) {
      row.addEventListener('click', function () {
        Modal.openForEdit(row.dataset.noteId);
      });
    });
  }

  return { init: init, render: render };
})();
