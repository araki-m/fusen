var Analytics = (function () {
  'use strict';

  var el = null;

  function init() {
    el = document.getElementById('analytics-view');
  }

  function parseHours(val) {
    if (val === '' || val === null || val === undefined) return null;
    var n = parseFloat(val);
    return isNaN(n) ? null : n;
  }

  function fmtH(h) {
    if (h === null) return '-';
    return Util.formatTime(h);
  }

  function render() {
    if (!el) return;

    var board   = Store.getBoard();
    var notes   = board.notes;
    var columns = board.columns;

    // noteId -> column title
    var noteColMap = {};
    board.columnOrder.forEach(function (colId) {
      var col = columns[colId];
      if (col) {
        col.noteOrder.forEach(function (noteId) { noteColMap[noteId] = col.title; });
      }
    });

    // Collect items with at least one time value — skip orphaned notes (not in any column)
    var items = [];
    Object.keys(noteColMap).forEach(function (noteId) {
      var note = notes[noteId];
      if (!note) return;
      var est  = parseHours(note.estimatedTime);
      var act  = parseHours(note.actualTime);
      if (est === null && act === null) return;
      var diff = (est !== null && act !== null) ? act - est : null;
      items.push({
        note:     note,
        colTitle: noteColMap[noteId],
        est:      est,
        act:      act,
        diff:     diff
      });
    });

    if (items.length === 0) {
      el.innerHTML =
        '<div class="analytics-empty">' +
        '時間データのある付箋がありません。<br>付箋の編集画面で「予定時間」「実績時間」を入力してください。' +
        '</div>';
      return;
    }

    // Totals
    var totalEst = 0, totalAct = 0, estCount = 0, actCount = 0;
    items.forEach(function (item) {
      if (item.est !== null) { totalEst += item.est; estCount++; }
      if (item.act !== null) { totalAct += item.act; actCount++; }
    });
    var totalDiff = totalAct - totalEst;

    // Sort by absolute diff (largest first)
    var byVariance = items.slice().sort(function (a, b) {
      var av = a.diff !== null ? Math.abs(a.diff) : -Infinity;
      var bv = b.diff !== null ? Math.abs(b.diff) : -Infinity;
      return bv - av;
    });

    // Ranking by actual time (most first)
    var byActual = items
      .filter(function (item) { return item.act !== null; })
      .sort(function (a, b) { return b.act - a.act; });

    var html = '';

    // --- Summary cards ---
    var diffClass = totalDiff > 0 ? 'analytics-over' : totalDiff < 0 ? 'analytics-under' : '';
    var diffSign  = totalDiff >= 0 ? '+' : '';
    html +=
      '<div class="analytics-summary">' +
        statCard('合計予定時間', fmtH(estCount ? totalEst : null)) +
        statCard('合計実績時間', fmtH(actCount ? totalAct : null)) +
        '<div class="analytics-stat">' +
          '<div class="analytics-stat-label">合計差異</div>' +
          '<div class="analytics-stat-value ' + diffClass + '">' +
            (estCount && actCount ? diffSign + fmtH(Math.abs(totalDiff)) : '-') +
          '</div>' +
        '</div>' +
        statCard('対象タスク数', items.length + '件') +
      '</div>';

    // --- Variance table ---
    html += '<h3 class="analytics-section-title">予定 vs 実績（差異が大きい順）</h3>';
    html +=
      '<table class="analytics-table">' +
      '<thead><tr>' +
        '<th>タスク名</th>' +
        '<th>カラム</th>' +
        '<th>予定</th>' +
        '<th>実績</th>' +
        '<th>差異</th>' +
      '</tr></thead><tbody>';

    byVariance.forEach(function (item) {
      var diffStr = '-';
      var diffCls = '';
      if (item.diff !== null) {
        var sign = item.diff >= 0 ? '+' : '-';
        diffStr  = sign + fmtH(Math.abs(item.diff));
        diffCls  = item.diff > 0 ? 'analytics-over' : item.diff < 0 ? 'analytics-under' : '';
      }
      var rowCls = item.diff !== null && Math.abs(item.diff) >= 1 ? 'analytics-row-alert' : '';
      html +=
        '<tr class="' + rowCls + '">' +
          '<td class="analytics-title-cell">' + Util.escapeHtml(item.note.title) + '</td>' +
          '<td>' + Util.escapeHtml(item.colTitle) + '</td>' +
          '<td>' + fmtH(item.est) + '</td>' +
          '<td>' + fmtH(item.act) + '</td>' +
          '<td class="' + diffCls + '">' + diffStr + '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';

    // --- Ranking ---
    if (byActual.length > 0) {
      var maxAct = byActual[0].act;
      html += '<h3 class="analytics-section-title">作業時間ランキング（実績時間が多い順）</h3>';
      html += '<div class="analytics-ranking">';
      byActual.forEach(function (item, idx) {
        var medalCls = idx === 0 ? 'medal-gold' : idx === 1 ? 'medal-silver' : idx === 2 ? 'medal-bronze' : '';
        var barPct   = (item.act / maxAct * 100).toFixed(1);
        html +=
          '<div class="analytics-rank-item">' +
            '<span class="rank-num ' + medalCls + '">' + (idx + 1) + '</span>' +
            '<span class="rank-bar-wrap">' +
              '<span class="rank-title">' + Util.escapeHtml(item.note.title) + '</span>' +
              '<div class="rank-bar-track">' +
                '<div class="rank-bar" style="width:' + barPct + '%"></div>' +
              '</div>' +
            '</span>' +
            '<span class="rank-time">' + fmtH(item.act) + '</span>' +
          '</div>';
      });
      html += '</div>';
    }

    el.innerHTML = html;
  }

  function statCard(label, value) {
    return (
      '<div class="analytics-stat">' +
        '<div class="analytics-stat-label">' + label + '</div>' +
        '<div class="analytics-stat-value">' + Util.escapeHtml(String(value)) + '</div>' +
      '</div>'
    );
  }

  return { init: init, render: render };
})();
