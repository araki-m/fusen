# CLAUDE.md

## Project Overview

**フセン** — Pure HTML/CSS/JS のカンバンボードアプリ。ビルド不要、`index.html` を開くだけで動作する SPA。

- **Repository**: https://github.com/araki-m/fusen
- **Live Demo**: https://araki-m.github.io/fusen/
- **仕様書**: `docs/spec.md`

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
│   ├── drag.css         # Drag-and-drop visual states
│   └── tabs.css         # Tab nav, calendar, task list, analytics, settings styles
├── js/
│   ├── util.js          # ID generation, date/time utils, HTML escape, debounce
│   ├── store.js         # State management, localStorage, import/export
│   ├── note.js          # Note DOM creation & update
│   ├── column.js        # Column DOM creation
│   ├── board.js         # Full board render + filter integration
│   ├── drag.js          # HTML5 Drag and Drop (notes + columns)
│   ├── modal.js         # Note editor modal
│   ├── filter.js        # Search & filter engine
│   ├── io.js            # JSON export/import (Blob + File API)
│   ├── calendar.js      # Calendar tab (monthly view, Monday-start)
│   ├── tasklist.js      # Task list tab (sortable table)
│   ├── analytics.js     # Task analytics tab (estimated vs actual, ranking)
│   ├── settings.js      # Settings tab (data reset)
│   └── app.js           # Entry point, tab switching, event delegation, init
├── data/                # インポート用データファイル
├── debug/               # デバッグ・調査用ファイル
└── docs/
    └── spec.md          # 仕様書
```

## Architecture

- **State management**: `Store` が単一の state オブジェクトを管理。変更は `store.update()` 系メソッド → `CustomEvent("fusen:state-changed")` を dispatch → `Board.render()` + アクティブタブの `render()` で再描画。
- **Script load order**: `index.html` 内の `<script>` タグの順序が依存関係を定義する。
  `util.js` → `store.js` → `note.js` → `column.js` → `board.js` → `drag.js` → `modal.js` → `filter.js` → `io.js` → `calendar.js` → `tasklist.js` → `analytics.js` → `settings.js` → `app.js`
- **Tab switching**: `App.switchTab()` がタブボタン・ビューの active クラスを切り替え、各タブの `render()` を呼ぶ。ボードタブ以外ではツールバーのフィルターを非表示にする。
- **Event delegation**: `#board` 要素に一括で click/drag イベントをバインド。`data-action` 属性でアクションを判別。
- **Data model**: 付箋はフラットな `notes` マップ、カラムは `columns` マップ + `columnOrder` 配列で管理。
- **Drag and Drop**: ノートの D&D に加え、カラムヘッダーのハンドル (`≡`) をドラッグしてカラム順序を変更可能。`Drag` モジュールが `draggedNoteId` / `draggedColId` で対象を判別。

## Key Conventions

- JS モジュールはすべて IIFE (`var ModuleName = (function() { ... })();`)
- グローバル変数名: `Util`, `Store`, `NoteView`, `ColumnView`, `Board`, `Drag`, `Modal`, `Filter`, `IO`, `Calendar`, `TaskList`, `Analytics`, `Settings`, `App`
- CSS カスタムプロパティは `css/variables.css` に集約
- HTML エスケープは `Util.escapeHtml()` を必ず使う（XSS 防止）
- localStorage キーは `fusen-board`
- カレンダー・タスク一覧・タスク分析では**孤立ノート**（`board.notes` にあるが `noteOrder` に含まれないノート）を表示しない

## Note Fields

付箋オブジェクトの全フィールド:

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | string | 一意ID |
| `title` | string | タイトル（必須） |
| `description` | string | 説明文 |
| `color` | string | カード色（yellow/pink/blue/green/orange/purple/mint/peach） |
| `priority` | string | 優先度（high/medium/low） |
| `dueDate` | string | 期限日（YYYY-MM-DD） |
| `completedDate` | string | 完了日（YYYY-MM-DD） |
| `estimatedTime` | number | 予定時間（時間単位） |
| `actualTime` | number | 実績時間（時間単位） |
| `tags` | string[] | タグ一覧 |
| `createdAt` | string | 作成日時（ISO 8601） |
| `updatedAt` | string | 更新日時（ISO 8601） |

## Board Visibility Rule (completedDate)

| 完了日 | ボード表示 |
|---|---|
| 未設定 | 表示 |
| 本日 | 表示 |
| 過去日 | 非表示 |

## Default Columns

新規データ作成・初期化時に生成される4カラム（左から順）:

1. Back Log
2. To Do
3. In Progress
4. Done

## Import / repairOrphans

`Store.importJSON()` はインポート時に `repairOrphans()` を自動実行し、
どのカラムの `noteOrder` にも含まれない孤立ノートを `board.notes` から削除する。

## Deployment

- GitHub Pages でホスティング（`main` ブランチの `/` をソースに設定）
- 静的ファイルのみのため、そのままデプロイ可能（ビルドステップ不要）
- push すれば自動デプロイ（通常 1〜2 分）

## Development

ビルド不要。`index.html` をブラウザで直接開く。

```bash
# Windows
start index.html
```

キャッシュが残る場合は `Ctrl+Shift+R`（ハードリロード）で強制更新。

## Testing (Manual)

1. カラムの追加・名前変更・削除
2. カラムのドラッグ&ドロップ（ハンドルで順序変更）
3. 付箋の作成・編集・削除・色変更
4. 付箋の期限日・完了日の入力
5. 完了日が過去日の付箋がボードに表示されないこと
6. 完了日が本日の付箋がボードに表示されること
7. 付箋の予定所要時間・実作業時間の入力と表示
8. 付箋のドラッグ&ドロップ（カラム間移動・順序変更）
9. 検索バーとフィルター（優先度・タグ・期限）
10. カレンダータブ（月移動・付箋表示・完了判定）
11. タスク一覧タブ（表示・並び替え・行クリックで編集）
12. タスク分析タブ（サマリー・予実テーブル・ランキング）
13. 設定タブ（データ初期化 → 確認ダイアログ → 4カラムで再起動）
14. Export → Import でデータ復元（孤立ノートが除去されること）
15. ブラウザ再起動後の localStorage 永続化
