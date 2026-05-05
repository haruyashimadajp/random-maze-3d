# プロジェクトコンテキスト：Random Maze 3D

## プロジェクト概要

p5.js + WEBGL を使ったブラウザで動く3Dランダム迷路探索ゲーム。
ソフトウェアエンジニアとしての最初のマイルストーンプロジェクト。

- **ライブデモ**: https://editor.p5js.org/sh_arschool/full/_wD2tj4gy
- **リポジトリ**: https://github.com/haruyashimadajp/random-maze-3d

## 技術スタック

| 技術 | 用途 |
|------|------|
| JavaScript (ES6+) | ゲームロジック全般 |
| p5.js | WEBGL 3Dレンダリング、Canvasの管理 |
| Mersenne Twister (mt.js) | 高品質な疑似乱数生成 |
| HTML5 / CSS3 | 画面構成 |

## ファイル構成

```
random-maze-3d/
├── index.html        # エントリーポイント
├── sketch.js         # メインゲームロジック（p5.js）
├── mt.js             # Mersenne Twister（乱数）
├── p5.js             # p5.jsライブラリ本体
├── style.css         # スタイル
└── .agents/
    └── rules/        # AIエージェント向けルール・コンテキスト
```

## sketch.js の関数一覧

| 関数名 | 役割 |
|--------|------|
| `setup()` | p5.js初期化、プレイヤー初期座標の設定 |
| `randomWall()` | 60%の確率で0、40%で1を返す乱数関数 |
| `generateMaze()` | 迷路データ（mazeCells配列）の生成 |
| `validateMaze()` | BFS（幅優先探索）で迷路の到達可能性を検証 |
| `isVisited(col, row)` | BFS済みノードの重複チェック |
| `checkWallCollision()` | プレイヤーの壁衝突判定 |
| `resolveCollision()` | 壁にめり込んだ際の位置補正 |
| `updateWalkBob()` | カメラの歩行アニメーション（上下揺れ）制御 |
| `updatePlayer()` | プレイヤー移動・カメラ操作・視点制御 |
| `renderMaze()` | 迷路のWEBGL描画（動的カリング付き） |
| `draw()` | メインループ（タイトル画面 / ゲーム画面の切り替え） |

## 主要なグローバル変数

| 変数 | 説明 |
|------|------|
| `playerX, playerY, playerZ` | プレイヤーの3D座標 |
| `mazeCells[]` | 迷路データ。各要素は `[col, row, wallA, wallB]` |
| `gridSize` | 迷路のマス数（現在10×10） |
| `wallSize, pathSize, wallHeight` | 壁・通路のサイズ定数 |
| `cameraAngle[0], cameraAngle[1]` | カメラの仰俯角・水平角 |
| `walkBob[]` | 歩行時カメラ揺れ: `[yOffset, pitchDelta, yawDelta, state, velocity]` |
| `lastPosition[]` | 壁補正のために直前位置を保存 |
| `showTitle` | タイトル画面フラグ |
| `isSolvable` | 迷路の到達可能性検証フラグ |
| `generateFailCount` | 迷路生成失敗時のカウンタ（UIに "Failed" 表示する期間） |

## BFS の変数（validateMaze 内で使用）

| 変数 | 説明 |
|------|------|
| `bfsFrontier[]` | BFSの現在フロンティア |
| `bfsNext[]` | 次フロンティアの仮置き場 |
| `bfsVisited[]` | 訪問済みノードの記録 |

## 座標系・迷路の構造

- `mazeCells` の各要素: `[col, row, wallA, wallB]`
  - col, row は 0〜(gridSize-1) のグリッド番号
  - wallA, wallB はそれぞれ壁の有無（1=あり、0=なし）
- 壁の物理サイズ: `wallSize=2`, 通路サイズ: `pathSize=10`
- セル1マスの物理幅: `wallSize + pathSize = 12`
- プレイヤーの初期位置: `(wallSize + pathSize/2, wallHeight/2, wallSize + pathSize/2)`
- ゴール位置: グリッドの右下端付近（半透明の白いボックス）

## walkBob の state 説明

| state | 意味 |
|-------|------|
| 1 | 上昇開始（velocity が増加） |
| 2 | 上昇終盤（velocity が減少、offset が 0.6 まで上昇） |
| 3 | 下降（velocity が減少、offset が 0.3 まで下降） |
| 4 | アイドル（velocity が増加して offset=0 でリセット） |

## コーディング規約・注意点

- 変数・関数名は**英語のキャメルケース**（例: `generateMaze`, `checkWallCollision`）
- p5.js の座標系: Y軸が下向き（画面下が正）、WEBGLでは Y軸が上向きに変わる
- `push()` / `pop()` で描画状態を保護してから `translate()` / `box()` を呼ぶこと
- 迷路の到達可能性チェック（`validateMaze()`）が失敗した場合、最大100回再生成する

## 既知の技術的課題・バグ

- `resolveCollision()` の壁補正ロジックが不完全な可能性がある（コーナーケースで埋まることがある）
- BFS の探索効率が O(n^4) 程度で、gridSize を大きくすると重くなる
- タイトル画面とゲーム画面で Canvas を再作成している（`createCanvas` を2回呼ぶ）

## 操作方法

| キー | 動作 |
|------|------|
| W / A / S / D | 移動 |
| 矢印キー | カメラ回転（視点変更） |
| Shift | 低速移動 |
