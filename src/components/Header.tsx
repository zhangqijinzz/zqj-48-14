import { useState, useEffect } from 'react';
import { BookOpen, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Sparkles, Grid3X3, TriangleAlert, Move, Lock } from 'lucide-react';
import { useCanvasStore, type ScaleMode } from '@/store/canvasStore';

const sizePresets = [
  { name: 'A4竖版', width: 800, height: 1131 },
  { name: 'A4横版', width: 1131, height: 800 },
  { name: '方形', width: 800, height: 800 },
  { name: '手机壁纸', width: 1080, height: 1920 },
  { name: '海报', width: 900, height: 1200 },
  { name: '小红书', width: 1080, height: 1440 },
];

export default function Header() {
  const {
    canvasWidth,
    canvasHeight,
    changeCanvasSize,
    clearCanvas,
    currentTheme,
    scaleMode,
    setScaleMode,
    outOfBoundsIds,
    resetAllOutOfBounds,
  } = useCanvasStore();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [customWidth, setCustomWidth] = useState(canvasWidth);
  const [customHeight, setCustomHeight] = useState(canvasHeight);

  useEffect(() => {
    if (showSizeModal) {
      setCustomWidth(canvasWidth);
      setCustomHeight(canvasHeight);
    }
  }, [showSizeModal, canvasWidth, canvasHeight]);

  const applyCustomSize = () => {
    const w = Math.max(200, Math.min(4000, customWidth || 200));
    const h = Math.max(200, Math.min(4000, customHeight || 200));
    setCustomWidth(w);
    setCustomHeight(h);
    changeCanvasSize(w, h);
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyCustomSize();
    }
  };

  const modeOptions: { value: ScaleMode; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'scale', label: '按比例缩放', desc: '元素位置和大小随画布等比调整', icon: Move },
    { value: 'keep', label: '保持原位', desc: '元素位置和大小保持不变', icon: Lock },
  ];

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">手账排版实验室</h1>
            <p className="text-[10px] text-gray-500">
              当前主题: <span className="font-medium" style={{ color: currentTheme.primaryColor }}>{currentTheme.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
              title="撤销"
              disabled
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
              title="重做"
              disabled
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
              title="缩小"
              disabled
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-medium text-gray-600 tabular-nums">100%</span>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
              title="放大"
              disabled
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <button
            onClick={() => setShowSizeModal(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-white hover:text-gray-800"
            title="画布尺寸"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            {canvasWidth} × {canvasHeight}
          </button>

          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              onClick={() => setScaleMode('scale')}
              className={`flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors ${
                scaleMode === 'scale'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="按比例缩放"
            >
              <Move className="h-3 w-3" />
              缩放
            </button>
            <button
              onClick={() => setScaleMode('keep')}
              className={`flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors ${
                scaleMode === 'keep'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="保持原位"
            >
              <Lock className="h-3 w-3" />
              原位
            </button>
          </div>

          {outOfBoundsIds.length > 0 && (
            <button
              onClick={resetAllOutOfBounds}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
              title={`${outOfBoundsIds.length}个元素超出画布边界，点击全部归位`}
            >
              <TriangleAlert className="h-3.5 w-3.5" />
              {outOfBoundsIds.length}个越界
            </button>
          )}

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <button
            onClick={() => setShowClearModal(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="清空画布"
          >
            <Sparkles className="h-3.5 w-3.5" />
            重新开始
          </button>
        </div>
      </header>

      {showSizeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowSizeModal(false)}
        >
          <div
            className="w-[460px] rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">🎨 画布尺寸设置</h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-blue-50/80 p-3">
              <h4 className="mb-2 text-xs font-semibold text-blue-700">📐 缩放模式</h4>
              <div className="grid grid-cols-2 gap-2">
                {modeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setScaleMode(opt.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2.5 transition-all ${
                        scaleMode === opt.value
                          ? 'border-blue-500 bg-white shadow-sm'
                          : 'border-blue-100 bg-white/60 hover:border-blue-200'
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 ${scaleMode === opt.value ? 'text-blue-600' : 'text-gray-500'}`}>
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">{opt.label}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
              {outOfBoundsIds.length > 0 && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-100/80 px-3 py-2">
                  <TriangleAlert className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-[11px] text-amber-700">
                    {outOfBoundsIds.length}个元素超出画布边界
                  </span>
                  <button
                    onClick={resetAllOutOfBounds}
                    className="ml-auto rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-amber-600"
                  >
                    全部归位
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {sizePresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => changeCanvasSize(preset.width, preset.height)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                    canvasWidth === preset.width && canvasHeight === preset.height
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Maximize2 className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700">{preset.name}</span>
                  <span className="text-[10px] text-gray-400">{preset.width}×{preset.height}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 rounded-xl bg-gray-50 p-4">
              <h4 className="text-xs font-semibold text-gray-600">自定义尺寸</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] text-gray-500">宽度 (px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    min={200}
                    max={4000}
                    onChange={(e) => setCustomWidth(Number(e.target.value) || 200)}
                    onBlur={applyCustomSize}
                    onKeyDown={handleCustomKeyDown}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-gray-500">高度 (px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    min={200}
                    max={4000}
                    onChange={(e) => setCustomHeight(Number(e.target.value) || 200)}
                    onBlur={applyCustomSize}
                    onKeyDown={handleCustomKeyDown}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="w-[380px] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Sparkles className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">重新开始</h3>
                <p className="text-xs text-gray-500">清空当前画布的所有内容</p>
              </div>
            </div>

            <div className="mb-6 rounded-xl bg-amber-50/80 p-4">
              <p className="text-sm leading-relaxed text-amber-900">
                ⚠️ 确定要清空画布吗？此操作将永久删除当前画布上的所有元素，包括日期、便签、照片、胶带和贴纸等，且<strong>无法撤销</strong>。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  clearCanvas();
                  setShowClearModal(false);
                }}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-red-500/35 active:scale-[0.98]"
              >
                确定清空
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
