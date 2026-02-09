var Util = (function () {
  'use strict';

  function generateId(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate();
  }

  function toISODate(date) {
    var d = date || new Date();
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function isOverdue(dateStr) {
    if (!dateStr) return false;
    var today = toISODate();
    return dateStr < today;
  }

  function isDueToday(dateStr) {
    if (!dateStr) return false;
    return dateStr === toISODate();
  }

  function isDueThisWeek(dateStr) {
    if (!dateStr) return false;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(dateStr + 'T00:00:00');
    var endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    return target >= today && target <= endOfWeek;
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  function formatTime(val) {
    if (!val && val !== 0) return '';
    var n = parseFloat(val);
    if (isNaN(n) || n < 0) return '';
    var h = Math.floor(n);
    var m = Math.round((n - h) * 60);
    if (h > 0 && m > 0) return h + 'h' + m + 'm';
    if (h > 0) return h + 'h';
    if (m > 0) return m + 'm';
    return '0m';
  }

  function nowISO() {
    return new Date().toISOString();
  }

  return {
    generateId: generateId,
    escapeHtml: escapeHtml,
    formatDate: formatDate,
    toISODate: toISODate,
    isOverdue: isOverdue,
    isDueToday: isDueToday,
    isDueThisWeek: isDueThisWeek,
    debounce: debounce,
    formatTime: formatTime,
    nowISO: nowISO
  };
})();
