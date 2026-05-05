# AIエージェント向け作業ルール

## 基本姿勢

- 日本語で回答する
- コードを書く前に、既存の構造・命名規則・コーディングスタイルを `project_context.md` で確認する
- 変数・関数名は**英語のキャメルケース**で統一する（日本語ローマ字は使わない）
- 変更は最小限に留め、既存の動作を壊さないようにする
- p5.js の API を使う際は、必ず p5.js のドキュメントに沿った書き方をする

## コード変更のルール

### やること
- 関数を変更する前に、その関数が呼ばれている箇所を全て確認する
- グローバル変数を変更する場合は、参照している全ての箇所を確認する
- WEBGL モードと 2D モードの切り替えに注意する（タイトル画面と迷路画面で異なる）
- `push()` / `pop()` を使って描画状態を適切に保護する

### やらないこと
- ライブラリファイル（`p5.js`, `mt.js`）は直接編集しない
- グローバル変数を不必要に増やさない
- パフォーマンスを悪化させる変更（特に `draw()` ループ内）は避ける
- `mazeK()` などの迷路生成アルゴリズムの本質的なロジックを壊さない

## デバッグのヒント

- `checkWallCollision()` が true を返し続ける場合 → `resolveCollision()` の補正ループで詰まっている
- 迷路が生成されない場合 → `validateMaze()` が `isSolvable = true` を設定できていない
- カメラがおかしい場合 → `cameraAngle[0]`（仰俯角）と `cameraAngle[1]`（水平角）を確認
- WEBGL で色が真っ暗な場合 → `ambientLight()` か `pointLight()` が設定されていない
- `walkBob` の state が意図せず変わる場合 → state の遷移条件（1→2→3→4→idle）を確認

## 追加機能を実装する際のガイドライン

### UI / タイトル画面
- 2D Canvas で描画するため、WEBGL の関数（`box()`, `ambientLight()` 等）は使えない
- `showTitle` フラグで画面を切り替えている

### 3Dオブジェクトの追加
- `renderMaze()` 関数内に追加する
- 必ず `push()` / `translate()` / `box()` or `sphere()` / `pop()` の順で書く
- パフォーマンスのために距離チェックを入れること（現在は半径8グリッド以内のみ描画）

### プレイヤーの当たり判定
- `checkWallCollision()` と `resolveCollision()` を参照すること
- 当たり判定の範囲は現在 ±1 単位

### 迷路の座標計算
- セル1マスの物理幅: `const step = wallSize + pathSize`（= 12）
- セル (col, row) の中心X: `(col + 0.5) * wallSize + col * pathSize`
- BFS は 1-indexed（1〜gridSize）、mazeCells は 0-indexed に注意

