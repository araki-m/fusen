# フセン - Kanban Board

付箋（フセン）を貼れるシンプルなカンバンボードアプリ。

フレームワーク不使用の Pure HTML/CSS/JS で構築。ビルド不要、`index.html` を開くだけで動作します。

## Features

- **カラム管理** — 追加・削除・インライン名前変更
- **付箋 (フセン)** — タイトル・説明・色（8色）・優先度・期限・タグ付き
- **ドラッグ&ドロップ** — カラム間で付箋を自由に移動・並べ替え
- **検索&フィルター** — テキスト検索、優先度・タグ・期限でフィルタリング
- **自動保存** — localStorage に自動保存、ブラウザを閉じてもデータが残る
- **エクスポート/インポート** — JSON ファイルでバックアップ・復元

## Quick Start

```bash
# ブラウザで開くだけ
open index.html
```

ビルドツール・サーバー不要。`file://` プロトコルで動作します。

## Screenshot

```
┌─ To Do ──────┐ ┌─ In Progress ─┐ ┌─ Done ────────┐
│ ┌───────────┐ │ │ ┌───────────┐ │ │ ┌───────────┐ │
│ │ 📝 Task A │ │ │ │ 📝 Task C │ │ │ │ 📝 Task E │ │
│ │ #work     │ │ │ │ #design   │ │ │ │ #work     │ │
│ └───────────┘ │ │ └───────────┘ │ │ └───────────┘ │
│ ┌───────────┐ │ │               │ │               │
│ │ 📝 Task B │ │ │               │ │               │
│ │ #personal │ │ │               │ │               │
│ └───────────┘ │ │               │ │               │
│ + Add Note    │ │ + Add Note    │ │ + Add Note    │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Tech Stack

| 技術 | 用途 |
|------|------|
| HTML5 | 構造 |
| CSS3 (Custom Properties, Flexbox) | スタイリング |
| Vanilla JavaScript (ES5+) | ロジック |
| HTML5 Drag and Drop API | ドラッグ&ドロップ |
| localStorage | データ永続化 |
| File API / Blob | インポート/エクスポート |

## File Structure

```
fusen/
├── index.html        # エントリポイント
├── css/              # スタイルシート (7 files)
│   ├── reset.css
│   ├── variables.css
│   ├── layout.css
│   ├── note.css
│   ├── modal.css
│   ├── toolbar.css
│   └── drag.css
└── js/               # ロジック (10 files)
    ├── util.js
    ├── store.js
    ├── note.js
    ├── column.js
    ├── board.js
    ├── drag.js
    ├── modal.js
    ├── filter.js
    ├── io.js
    └── app.js
```

## Usage

### 付箋の操作

| 操作 | 方法 |
|------|------|
| 付箋を作成 | カラム下部の「+ Add Note」をクリック |
| 付箋を編集 | 付箋をクリック → モーダルで編集 |
| 付箋を削除 | 付箋ホバー → × ボタン、またはモーダル内の Delete |
| 付箋を移動 | ドラッグ&ドロップ |

### カラムの操作

| 操作 | 方法 |
|------|------|
| カラムを追加 | 右端の「+ Add Column」をクリック |
| カラム名を変更 | カラムヘッダーのタイトルをクリックして編集 |
| カラムを削除 | カラムヘッダーの × ボタン |

### 検索・フィルター

ツールバーの検索ボックスでテキスト検索（タイトル・説明・タグを横断）。
ドロップダウンで優先度・タグ・期限によるフィルタリングが可能。

### データのバックアップ

- **Export**: ツールバーの「Export」ボタン → JSON ファイルをダウンロード
- **Import**: ツールバーの「Import」ボタン → エクスポートした JSON ファイルを選択

## License

MIT
