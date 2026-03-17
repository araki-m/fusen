# フセン 仕様書

**バージョン**: 2026-03-17
**リポジトリ**: https://github.com/araki-m/fusen
**ライブデモ**: https://araki-m.github.io/fusen/

---

## 1. 概要

フセン は、ブラウザだけで動作する純粋な HTML/CSS/JavaScript 製のカンバンボードアプリです。
ビルド不要で `index.html` を開くだけで使用できます。データは `localStorage` に自動保存されます。

---

## 2. 画面構成

```
┌─────────────────────────────────────────────────────┐
│ ツールバー（タイトル / 検索・フィルター / Export・Import）│
├─────────────────────────────────────────────────────┤
│ タブナビ：ボード │ カレンダー │ タスク一覧 │ タスク分析 │ 設定 │
├─────────────────────────────────────────────────────┤
│ コンテンツエリア（アクティブタブのビューを表示）         │
└─────────────────────────────────────────────────────┘
```

---

## 3. データモデル

### 3-1. ボードデータ（localStorage キー: `fusen-board`）

```json
{
  "version": 1,
  "board": {
    "title": "My Board",
    "columnOrder": ["col-xxx", ...],
    "columns": {
      "col-xxx": {
        "id": "col-xxx",
        "title": "Back Log",
        "noteOrder": ["note-xxx", ...]
      }
    },
    "notes": {
      "note-xxx": { ...ノートオブジェクト... }
    },
    "tags": ["タグA", "タグB"],
    "settings": {
      "defaultColor": "yellow",
      "defaultPriority": "medium"
    }
  }
}
```

### 3-2. ノートオブジェクト

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | string | 一意ID（`note-` プレフィックス） |
| `title` | string | タイトル（必須） |
| `description` | string | 説明文 |
| `color` | string | カードの色（下記参照） |
| `priority` | string | 優先度（`high` / `medium` / `low`） |
| `dueDate` | string | 期限日（`YYYY-MM-DD`、空文字可） |
| `completedDate` | string | 完了日（`YYYY-MM-DD`、空文字可） |
| `estimatedTime` | number \| string | 予定時間（時間単位、例: `2.5`） |
| `actualTime` | number \| string | 実績時間（時間単位、例: `3`） |
| `tags` | string[] | タグ一覧 |
| `createdAt` | string | 作成日時（ISO 8601） |
| `updatedAt` | string | 更新日時（ISO 8601） |

#### カード色一覧

`yellow` / `pink` / `blue` / `green` / `orange` / `purple` / `mint` / `peach`

---

## 4. デフォルトカラム

新規データ作成時（初期化・初回起動時）に以下の4カラムが生成される。

| 順序 | カラム名 |
|---|---|
| 1 | Back Log |
| 2 | To Do |
| 3 | In Progress |
| 4 | Done |

> 既存データには影響しない。

---

## 5. タブ仕様

### 5-1. ボードタブ

カンバンボードを表示する。

#### カラム操作

| 操作 | 方法 |
|---|---|
| カラム追加 | 右端の「+ Add Column」ボタン |
| カラム名変更 | ヘッダーのタイトル部分をクリックして入力、Enter または フォーカスアウトで確定 |
| カラム削除 | ヘッダーの × ボタン（ノート数を確認ダイアログ表示） |
| カラム並び替え | ヘッダー左端の ≡ ハンドルをドラッグ＆ドロップ |

#### ノート操作

| 操作 | 方法 |
|---|---|
| ノート追加 | 各カラム下部の「+ Add Note」ボタン |
| ノート編集 | カードをクリックしてモーダルを開く |
| ノート削除 | カード右上の × ボタン（確認ダイアログあり） |
| ノート移動 | カードをドラッグ＆ドロップ（カラム間・カラム内並び替え対応） |

#### ボードへの表示条件（完了日ルール）

| 完了日の状態 | ボード表示 |
|---|---|
| 未設定（空） | 表示する |
| 本日 | 表示する |
| 過去日 | **表示しない** |

#### ツールバーフィルター（ボードタブのみ表示）

| フィルター | 選択肢 |
|---|---|
| テキスト検索 | タイトル・説明・タグを対象にリアルタイム絞り込み |
| 優先度 | All / High / Medium / Low |
| タグ | All / 存在するタグ一覧 |
| 期限 | All / 期限切れ / 今日期限 / 今週中 |

---

### 5-2. カレンダータブ

ひと月分のカレンダーを表示し、`dueDate` が設定された付箋を対応する日に表示する。

#### 機能

| 機能 | 説明 |
|---|---|
| 月移動 | `<` `>` ボタンで前後の月へ移動 |
| 今日へ戻る | 「今日」ボタンで当月へ戻る |
| 始まりの曜日 | 月曜日始まり |
| 土日の色分け | 土曜=青、日曜=赤 |
| 今日のハイライト | 日付を青丸で強調表示 |

#### 付箋の表示ルール

| 条件 | 表示 |
|---|---|
| `dueDate` あり | 該当日に表示 |
| `dueDate` なし | カレンダーに表示しない |
| 孤立ノート | 表示しない |

#### 完了判定（✓ + 打ち消し線で表示）

以下のいずれかを満たす場合、完了扱いとして表示する。

- ノートに `completedDate` が設定されている
- ノートが "Done" / "完了" / "済" を含むカラムに属している

#### インタラクション

付箋をクリック → 編集モーダルが開く

---

### 5-3. タスク一覧タブ

全ノートを一覧テーブルで表示する。

#### 表示列

| 列 | 内容 |
|---|---|
| 優先 | 優先度カラードット（赤=高、橙=中、緑=低） |
| タスク名 | ノートタイトル |
| カラム | 所属カラム名 |
| 期限 | `dueDate`（期限切れ=赤、今日=オレンジ） |
| 完了日 | `completedDate`（設定時は緑で表示、行を打ち消し線） |
| 予定 | `estimatedTime` |
| 実績 | `actualTime` |
| タグ | タグチップ一覧 |

#### 並び替え

ボタンクリックで切り替え。

| キー | 内容 |
|---|---|
| 期限 | `dueDate` 昇順（未設定は末尾） |
| 優先度 | 高→中→低 |
| カラム | カラム表示順 |
| タイトル | 50音・アルファベット順 |

#### インタラクション

行クリック → 編集モーダルが開く
孤立ノートは表示しない

---

### 5-4. タスク分析タブ

`estimatedTime` または `actualTime` が設定されたノートを対象に分析を表示する。

#### サマリーカード

- 合計予定時間
- 合計実績時間
- 合計差異（実績 − 予定、プラス=赤・マイナス=緑）
- 対象タスク数

#### 予定 vs 実績テーブル

差異の絶対値が大きい順に表示。

| 列 | 内容 |
|---|---|
| タスク名 | ノートタイトル |
| カラム | 所属カラム名 |
| 予定 | `estimatedTime` |
| 実績 | `actualTime` |
| 差異 | 実績 − 予定（1h 以上の差異がある行はハイライト） |

#### 作業時間ランキング

`actualTime` が大きい順に全件表示。
1位=金メダル、2位=銀メダル、3位=銅メダル + バーグラフ付き。

孤立ノートは表示しない

---

### 5-5. 設定タブ

#### データ初期化

「初期化する」ボタンを押すと確認ダイアログが表示される。
OK を選択するとすべての付箋・カラムが削除され、デフォルトの4カラム構成に戻る。

---

## 6. ノート編集モーダル

カードクリックまたは「+ Add Note」から開く。

| 入力項目 | 型 | 備考 |
|---|---|---|
| Title | テキスト | 必須。空の場合は保存不可 |
| Description | テキストエリア | 任意 |
| Color | カラーパレット | 8色から選択 |
| Priority | セレクト | Low / Medium / High |
| 期限日 | 日付 | `dueDate` |
| 完了日 | 日付 | `completedDate` |
| Estimated Time (h) | 数値 | 0.25 刻み |
| Actual Time (h) | 数値 | 0.25 刻み |
| Tags | テキスト入力 | Enter で追加、× で削除、Backspace で末尾タグ削除 |

---

## 7. データ保存・復元

### 自動保存

状態変更のたびにデバウンス（300ms）で `localStorage` に保存される。

### Export

ツールバーの「Export」ボタンを押すと `fusen-board-YYYY-MM-DD.json` がダウンロードされる。

### Import

ツールバーの「Import」ボタンから JSON ファイルを選択する。
読み込み時に以下の自動修復が行われる。

- **孤立ノートの除去**: `board.notes` に存在するが、どのカラムの `noteOrder` にも含まれないノートを自動削除する（`repairOrphans`）
- **設定の補完**: `settings` / `tags` フィールドが欠落している場合はデフォルト値を補完する

---

## 8. 孤立ノート（Orphaned Notes）

`board.notes` に存在するが、どのカラムの `noteOrder` にも属さないノート。

| タブ | 扱い |
|---|---|
| ボード | 表示されない（カラム経由で描画するため） |
| カレンダー | 表示しない（意図的に除外） |
| タスク一覧 | 表示しない（意図的に除外） |
| タスク分析 | 表示しない（意図的に除外） |
| Import 時 | 自動削除（`repairOrphans`） |

外部ツールで JSON を編集する際は、`board.notes` へのノート追加と同時に対応カラムの `noteOrder` へのID追記を必ず行うこと。

---

## 9. アーキテクチャ

### スクリプト読み込み順（依存関係）

```
util.js → store.js → note.js → column.js → board.js → drag.js
→ modal.js → filter.js → io.js → calendar.js → tasklist.js
→ analytics.js → settings.js → app.js
```

### モジュール一覧

| モジュール | グローバル変数 | 役割 |
|---|---|---|
| util.js | `Util` | ID生成・日時・HTMLエスケープ・デバウンス |
| store.js | `Store` | 状態管理・localStorage・Import/Export |
| note.js | `NoteView` | ノートカード DOM 生成 |
| column.js | `ColumnView` | カラム DOM 生成 |
| board.js | `Board` | ボード全体の描画・フィルター適用 |
| drag.js | `Drag` | HTML5 Drag and Drop（ノート・カラム） |
| modal.js | `Modal` | ノート編集モーダル |
| filter.js | `Filter` | 検索・フィルター状態管理 |
| io.js | `IO` | JSON ファイル Export / Import |
| calendar.js | `Calendar` | カレンダータブの描画 |
| tasklist.js | `TaskList` | タスク一覧タブの描画 |
| analytics.js | `Analytics` | タスク分析タブの描画 |
| settings.js | `Settings` | 設定タブの描画 |
| app.js | `App` | 初期化・タブ切り替え・イベント委譲 |

### 状態変更フロー

```
ユーザー操作
  → Store.update系メソッド
  → CustomEvent("fusen:state-changed") を dispatch
  → Filter.updateTagOptions()
  → Board.render()
  → アクティブタブが calendar / tasklist / analytics の場合は各 render()
  → persistDebounced()（localStorage に保存）
```

### イベント委譲

`#board` 要素にイベントをまとめてバインドし、`data-action` 属性でアクションを判別する。

---

## 10. ファイル構成

```
fusen/
├── index.html
├── css/
│   ├── reset.css
│   ├── variables.css    # CSS カスタムプロパティ
│   ├── layout.css       # ボード・カラムレイアウト
│   ├── note.css         # ノートカードスタイル
│   ├── modal.css        # モーダルスタイル
│   ├── toolbar.css      # ツールバー・フィルタースタイル
│   ├── drag.css         # ドラッグ状態スタイル
│   └── tabs.css         # タブナビ・カレンダー・一覧・分析・設定スタイル
├── js/
│   ├── util.js
│   ├── store.js
│   ├── note.js
│   ├── column.js
│   ├── board.js
│   ├── drag.js
│   ├── modal.js
│   ├── filter.js
│   ├── io.js
│   ├── calendar.js
│   ├── tasklist.js
│   ├── analytics.js
│   ├── settings.js
│   └── app.js
├── data/                # インポート用データ
├── debug/               # デバッグ・調査用ファイル
└── docs/
    └── spec.md          # 本ドキュメント
```
