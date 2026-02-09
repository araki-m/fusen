var Filter = (function () {
  'use strict';

  var filterState = {
    search: '',
    priority: 'all',
    tag: 'all',
    due: 'all'
  };

  var searchInput = null;
  var prioritySelect = null;
  var tagSelect = null;
  var dueSelect = null;

  function init() {
    searchInput = document.getElementById('search-input');
    prioritySelect = document.getElementById('filter-priority');
    tagSelect = document.getElementById('filter-tag');
    dueSelect = document.getElementById('filter-due');

    var debouncedSearch = Util.debounce(function () {
      filterState.search = searchInput.value.trim();
      Board.render();
    }, 200);

    searchInput.addEventListener('input', debouncedSearch);

    prioritySelect.addEventListener('change', function () {
      filterState.priority = prioritySelect.value;
      Board.render();
    });

    tagSelect.addEventListener('change', function () {
      filterState.tag = tagSelect.value;
      Board.render();
    });

    dueSelect.addEventListener('change', function () {
      filterState.due = dueSelect.value;
      Board.render();
    });
  }

  function getState() {
    return filterState;
  }

  function updateTagOptions() {
    if (!tagSelect) return;
    var board = Store.getBoard();
    var current = tagSelect.value;
    tagSelect.innerHTML = '<option value="all">All Tags</option>';
    (board.tags || []).forEach(function (tag) {
      var opt = document.createElement('option');
      opt.value = tag;
      opt.textContent = tag;
      if (tag === current) opt.selected = true;
      tagSelect.appendChild(opt);
    });
  }

  return {
    init: init,
    getState: getState,
    updateTagOptions: updateTagOptions
  };
})();
