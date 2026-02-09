# CLAUDE.md

## Project Overview

**フセン** — Pure HTML/CSS/JS のカンバンボードアプリ。ビルド不要、`index.html` を開くだけで動作する SPA。

## Tech Stack

- HTML / CSS / JavaScript (vanilla, no frameworks, no build tools)
- `file://` プロトコルで動作する（ES modules 不使用）
- 各 JS モジュールは IIFE パターンでグローバルに公開

## File Structure

```
fusen/
├── index.html           # Entry point (loads all CSS/JS)
├── css/
│   ├── reset.css        # CSS reset
│   ├── variables.css    # Custom properties (colors, shadows, spacing)
│   ├── layout.css       # Board & column flex layout
│   ├── note.css         # Note card styles
│   ├── modal.css        # Modal dialog styles
│   ├── toolbar.css      # Toolbar, search, filter styles
│   └── drag.css         # Drag-and-drop visual states
└── js/
    ├── util.js          # ID generation, date utils, HTML escape, debounce
    ├── store.js         # State management, localStorage, import/export
    ├── note.js          # Note DOM creation & update
    ├── column.js        # Column DOM creation
    ├── board.js         # Full board render + filter integration
    ├── drag.js          # HTML5 Drag and Drop handling
    ├── modal.js         # Note editor modal
    ├── filter.js        # Search & filter engine
    ├── io.js            # JSON export/import (Blob + File API)
    └── app.js           # Entry point, event delegation, init
```

## Architecture

- **State management**: `Store` が単一の state オブジェクトを管理。変更は `store.update()` 系メソッド → `CustomEvent("fusen:state-changed")` を dispatch → `Board.render()` で全体を再描画。
- **Script load order**: `index.html` 内の `<script>` タグの順序が依存関係を定義する。`util.js` → `store.js` → `note.js` → `column.js` → `board.js` → `drag.js` → `modal.js` → `filter.js` → `io.js` → `app.js`
- **Event delegation**: `#board` 要素に一括で click/drag イベントをバインド。`data-action` 属性でアクションを判別。
- **Data model**: 付箋はフラットな `notes` マップ、カラムは `columns` マップ + `columnOrder` 配列で管理。

## Key Conventions

- JS モジュールはすべて IIFE (`var ModuleName = (function() { ... })();`)
- グローバル変数名: `Util`, `Store`, `NoteView`, `ColumnView`, `Board`, `Drag`, `Modal`, `Filter`, `IO`, `App`
- CSS カスタムプロパティは `css/variables.css` に集約
- HTML エスケープは `Util.escapeHtml()` を必ず使う（XSS 防止）
- localStorage キーは `fusen-board`

## Development

ビルド不要。`index.html` をブラウザで直接開く。

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

## Testing (Manual)

1. カラムの追加・名前変更・削除
2. 付箋の作成・編集・削除・色変更
3. 付箋のドラッグ&ドロップ（カラム間移動・順序変更）
4. 検索バーとフィルター（優先度・タグ・期限）
5. Export → Import でデータ復元
6. ブラウザ再起動後の localStorage 永続化
