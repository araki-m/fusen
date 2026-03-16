var App = (function () {
  'use strict';

  var currentTab = 'board';

  function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update views
    document.getElementById('board').classList.toggle('active', tabName === 'board');
    document.getElementById('calendar-view').classList.toggle('active', tabName === 'calendar');
    document.getElementById('tasklist-view').classList.toggle('active', tabName === 'tasklist');
    document.getElementById('analytics-view').classList.toggle('active', tabName === 'analytics');
    document.getElementById('settings-view').classList.toggle('active', tabName === 'settings');

    // Show/hide toolbar filters (only relevant on board tab)
    var filterArea = document.querySelector('.search-box');
    var filterGroup = document.querySelector('.filter-group');
    var showFilters = tabName === 'board';
    if (filterArea)  filterArea.style.display  = showFilters ? '' : 'none';
    if (filterGroup) filterGroup.style.display = showFilters ? '' : 'none';

    if (tabName === 'calendar')  Calendar.render();
    if (tabName === 'tasklist')  TaskList.render();
    if (tabName === 'analytics') Analytics.render();
    if (tabName === 'settings')  Settings.render();
  }

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

    // Init calendar, task list, analytics & settings
    Calendar.init();
    TaskList.init();
    Analytics.init();
    Settings.init();

    // Tab switching
    document.querySelector('.tab-nav').addEventListener('click', function (e) {
      var btn = e.target.closest('.tab-btn');
      if (btn && btn.dataset.tab) switchTab(btn.dataset.tab);
    });

    // Listen for state changes
    document.addEventListener('fusen:state-changed', function () {
      Filter.updateTagOptions();
      Board.render();
      if (currentTab === 'calendar')  Calendar.render();
      if (currentTab === 'tasklist')  TaskList.render();
      if (currentTab === 'analytics') Analytics.render();
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
