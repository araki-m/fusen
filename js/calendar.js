var Calendar = (function () {
  'use strict';

  var el = null;
  var currentYear = 0;
  var currentMonth = 0; // 0-indexed

  var MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var DAY_NAMES   = ['月','火','水','木','金','土','日'];

  function init() {
    el = document.getElementById('calendar-view');
    var now = new Date();
    currentYear  = now.getFullYear();
    currentMonth = now.getMonth();
  }

  function isDoneColumn(title) {
    var t = title.toLowerCase();
    return t.indexOf('done') !== -1 || t.indexOf('完了') !== -1 || t.indexOf('済') !== -1;
  }

  function render() {
    if (!el) return;

    var board   = Store.getBoard();
    var notes   = board.notes;
    var columns = board.columns;

    // Which column IDs are "done"?
    var doneColIds = {};
    Object.keys(columns).forEach(function (colId) {
      if (isDoneColumn(columns[colId].title)) doneColIds[colId] = true;
    });

    // noteId -> colId (only notes that belong to a column)
    var noteColMap = {};
    board.columnOrder.forEach(function (colId) {
      var col = columns[colId];
      if (col) {
        col.noteOrder.forEach(function (noteId) { noteColMap[noteId] = colId; });
      }
    });

    // Group notes by dueDate — skip orphaned notes (not in any column)
    var notesByDate = {};
    Object.keys(noteColMap).forEach(function (noteId) {
      var note = notes[noteId];
      if (!note || !note.dueDate) return;
      if (!notesByDate[note.dueDate]) notesByDate[note.dueDate] = [];
      notesByDate[note.dueDate].push({
        note: note,
        done: !!note.completedDate || !!doneColIds[noteColMap[noteId]]
      });
    });

    var todayStr  = Util.toISODate();
    var firstDay  = new Date(currentYear, currentMonth, 1);
    var totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Start-of-week offset (Monday = 0)
    var startDow = (firstDay.getDay() + 6) % 7;

    // Build flat cell array
    var cells = [];
    for (var i = 0; i < startDow; i++) cells.push(null);
    for (var d = 1; d <= totalDays; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    // Header
    var html = '<div class="cal-nav">' +
      '<button class="cal-nav-btn" id="cal-prev">&lt;</button>' +
      '<span class="cal-title">' + currentYear + '年 ' + MONTH_NAMES[currentMonth] + '</span>' +
      '<button class="cal-nav-btn" id="cal-next">&gt;</button>' +
      '<button class="cal-today-btn" id="cal-today">今日</button>' +
    '</div>';

    // Table
    html += '<table class="cal-table"><thead><tr>';
    DAY_NAMES.forEach(function (name, i) {
      var cls = i === 5 ? 'cal-sat' : i === 6 ? 'cal-sun' : '';
      html += '<th' + (cls ? ' class="' + cls + '"' : '') + '>' + name + '</th>';
    });
    html += '</tr></thead><tbody>';

    for (var row = 0; row < cells.length / 7; row++) {
      html += '<tr>';
      for (var col = 0; col < 7; col++) {
        var day = cells[row * 7 + col];
        if (!day) {
          html += '<td class="cal-empty"></td>';
          continue;
        }

        var dateStr = currentYear + '-' +
          String(currentMonth + 1).padStart(2, '0') + '-' +
          String(day).padStart(2, '0');

        var cellCls = 'cal-cell';
        if (dateStr === todayStr) cellCls += ' cal-today';
        if (col === 5) cellCls += ' cal-sat';
        if (col === 6) cellCls += ' cal-sun';

        var dayNumHtml = '<span class="cal-day-num">' + day + '</span>';

        var notesHtml = '';
        if (notesByDate[dateStr]) {
          notesByDate[dateStr].forEach(function (item) {
            var cls = 'cal-note cal-note-priority-' + (item.note.priority || 'medium');
            if (item.done) cls += ' cal-note-done';
            notesHtml +=
              '<div class="' + cls + '" data-note-id="' + item.note.id + '" data-action="cal-edit-note">' +
              (item.done ? '✓ ' : '') + Util.escapeHtml(item.note.title) +
              '</div>';
          });
        }

        html += '<td class="' + cellCls + '">' + dayNumHtml + notesHtml + '</td>';
      }
      html += '</tr>';
    }

    html += '</tbody></table>';
    el.innerHTML = html;

    // Events
    el.querySelector('#cal-prev').addEventListener('click', function () {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      render();
    });
    el.querySelector('#cal-next').addEventListener('click', function () {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      render();
    });
    el.querySelector('#cal-today').addEventListener('click', function () {
      var now = new Date();
      currentYear  = now.getFullYear();
      currentMonth = now.getMonth();
      render();
    });

    el.querySelectorAll('[data-action="cal-edit-note"]').forEach(function (noteEl) {
      noteEl.addEventListener('click', function () {
        Modal.openForEdit(noteEl.dataset.noteId);
      });
    });
  }

  return { init: init, render: render };
})();
