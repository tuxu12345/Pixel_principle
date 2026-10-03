# PIXEL / RAIL · 车窗点阵屏互动概念

汽车侧窗下沿的滑轨式像素屏概念：三块可拼接的 240 × 120 mm 显示模组，通过交互 3D 模型演示安装、滑动和连续显示效果。

## 在线预览

https://tuxu12345.github.io/Pixel_principle/

`main` 分支有新提交时，GitHub Actions 会自动构建并更新网页。

## 直接打开 Demo

无需安装依赖：解压发布包后，直接打开 [`dist/pixel-rail-offline.html`](dist/pixel-rail-offline.html)。页面提供鼠标旋转、滚轮缩放、右键平移、整体／滑槽剖面／点亮特写视角，以及屏幕滑动、多屏联动、小狗／爱心／波浪／滚动文字演示。

新增 **快拆连接件**：每块屏幕通过两组银色插舌、青色快拆座及带拉环锁销连接 T 形滑块。点击动作面板的“快拆连接件”，查看 12 秒的“拔销 → 上提 → 回装 → 锁定”动效；滑块留在轨道中，屏幕可从上方单独拆下。支持暂停、拖动进度，并可切换整体视角查看三屏同步拆装。Rhino 文件同步包含带连接孔的插舌、快拆座及独立锁销图层与分组。

## 文件

- [`dist/assets/pixel-rail.3dm`](dist/assets/pixel-rail.3dm)：Rhino 7/8 可打开，毫米单位；屏幕模组、滑槽、安装基座分别分层。
- [`dist/assets/concept.png`](dist/assets/concept.png)：夜间车内氛围效果图。
- `dist/assets/model-overall.png`、`model-section.png`、`model-close.png`：从互动 3D 模型导出的三张视图。
- `dist/assets/demo-desktop.png`、`demo-mobile.png`、`demo-section.png`、`demo-close.png`：Demo 界面截图。
- [`dist/assets/README.txt`](dist/assets/README.txt)：尺寸、结构、使用说明和概念设计边界。
- `src/`、`scripts/`：网页与 Rhino 模型生成源码。

## 本地修改

安装 Node.js 20 或更新版本后，运行 `npm ci` 和 `npm run build`。构建后的静态网站位于 `dist/`，推送到 `main` 后自动通过 GitHub Pages 发布。Rhino 模型可通过 `python scripts/model.py` 重新生成；需要安装 Python 包 `rhino3dm`。

屏幕单块 48 × 24 像素，中心间距 4.75 mm。尺寸和轨道结构用于概念展示，非量产工程图；设计依据和验证说明见 [`DESIGN.md`](DESIGN.md)。
