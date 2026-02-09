var IO = (function () {
  'use strict';

  function init() {
    var exportBtn = document.getElementById('btn-export');
    var importBtn = document.getElementById('btn-import');
    var importFile = document.getElementById('import-file');

    exportBtn.addEventListener('click', exportBoard);
    importBtn.addEventListener('click', function () {
      importFile.click();
    });
    importFile.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      importBoard(file);
      importFile.value = '';
    });
  }

  function exportBoard() {
    var json = Store.exportJSON();
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'fusen-board-' + Util.toISODate() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importBoard(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var success = Store.importJSON(e.target.result);
      if (!success) {
        alert('Invalid board file. Please select a valid Fusen JSON export.');
      }
    };
    reader.readAsText(file);
  }

  return {
    init: init
  };
})();
