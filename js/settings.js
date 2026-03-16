var Settings = (function () {
  'use strict';

  var el = null;

  function init() {
    el = document.getElementById('settings-view');
  }

  function render() {
    if (!el) return;

    el.innerHTML =
      '<div class="settings-section">' +
        '<h3 class="settings-section-title">データ管理</h3>' +
        '<div class="settings-item">' +
          '<div class="settings-item-info">' +
            '<div class="settings-item-label">データの初期化</div>' +
            '<div class="settings-item-desc">すべての付箋・カラムを削除し、初期状態に戻します。この操作は取り消せません。</div>' +
          '</div>' +
          '<button class="settings-btn settings-btn-danger" id="btn-reset-data">初期化する</button>' +
        '</div>' +
      '</div>';

    el.querySelector('#btn-reset-data').addEventListener('click', function () {
      if (confirm('すべてのデータを削除して初期状態に戻しますか？\nこの操作は取り消せません。')) {
        Store.reset();
      }
    });
  }

  return { init: init, render: render };
})();
