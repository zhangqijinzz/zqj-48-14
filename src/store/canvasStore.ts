import { create } from 'zustand';
import type { CanvasElement, Theme, ColorPalette, ThemeId } from '@/types';
import { themes } from '@/data/themes';
import { generateColorPalette } from '@/lib/colorUtils';

export type ScaleMode = 'scale' | 'keep';

interface PositionSnapshot {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  borderRadius?: number;
  borderWidth?: number;
}

const applySnapshot = (
  elements: CanvasElement[],
  snapshots: Record<string, PositionSnapshot>
): CanvasElement[] => {
  return elements.map((el) => {
    const snap = snapshots[el.id];
    if (!snap) return el;
    return {
      ...el,
      x: snap.x,
      y: snap.y,
      width: snap.width,
      height: snap.height,
      ...(snap.fontSize !== undefined ? { fontSize: snap.fontSize } : {}),
      ...(snap.borderRadius !== undefined ? { borderRadius: snap.borderRadius } : {}),
      ...(snap.borderWidth !== undefined ? { borderWidth: snap.borderWidth } : {}),
    };
  });
};

const computeOutOfBoundsIds = (
  elements: CanvasElement[],
  canvasWidth: number,
  canvasHeight: number
): string[] => {
  return elements
    .filter(
      (el) =>
        el.x + el.width > canvasWidth ||
        el.y + el.height > canvasHeight ||
        el.x < 0 ||
        el.y < 0
    )
    .map((el) => el.id);
};

interface CanvasState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  currentTheme: Theme;
  currentThemeId: ThemeId;
  colorPalette: ColorPalette;
  canvasBackground: string;
  canvasWidth: number;
  canvasHeight: number;
  nextZIndex: number;
  scaleMode: ScaleMode;
  keptSnapshots: Record<string, PositionSnapshot> | null;
  scaledSnapshots: Record<string, PositionSnapshot> | null;
  outOfBoundsIds: string[];

  addElement: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  duplicateElement: (id: string) => void;
  clearCanvas: () => void;

  setTheme: (themeId: ThemeId) => void;
  setPrimaryColor: (color: string) => void;
  setCanvasBackground: (color: string) => void;
  changeCanvasSize: (width: number, height: number) => void;
  setScaleMode: (mode: ScaleMode) => void;
  resetOutOfBoundsElement: (id: string) => void;
  resetAllOutOfBounds: () => void;
}

let elementIdCounter = 0;
const generateId = () => `elem_${Date.now()}_${elementIdCounter++}`;

export const useCanvasStore = create<CanvasState>((set, get) => ({
  elements: [],
  selectedElementId: null,
  currentTheme: themes.retro,
  currentThemeId: 'retro',
  colorPalette: generateColorPalette(themes.retro.primaryColor),
  canvasBackground: themes.retro.backgroundColor,
  canvasWidth: 800,
  canvasHeight: 1000,
  nextZIndex: 1,
  scaleMode: 'scale',
  keptSnapshots: null,
  scaledSnapshots: null,
  outOfBoundsIds: [],

  addElement: (elementData) => {
    const state = get();
    const newElement: CanvasElement = {
      ...elementData,
      id: generateId(),
      zIndex: state.nextZIndex,
    };
    const updatedElements = [...state.elements, newElement];
    set({
      elements: updatedElements,
      selectedElementId: newElement.id,
      nextZIndex: state.nextZIndex + 1,
      outOfBoundsIds: computeOutOfBoundsIds(updatedElements, state.canvasWidth, state.canvasHeight),
    });
  },

  updateElement: (id, updates) => {
    const state = get();
    const updatedElements = state.elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    const shouldRecheck =
      'x' in updates ||
      'y' in updates ||
      'width' in updates ||
      'height' in updates;
    set({
      elements: updatedElements,
      ...(shouldRecheck
        ? { outOfBoundsIds: computeOutOfBoundsIds(updatedElements, state.canvasWidth, state.canvasHeight) }
        : {}),
    });
  },

  deleteElement: (id) => {
    set((state) => {
      const newKept = state.keptSnapshots ? { ...state.keptSnapshots } : null;
      const newScaled = state.scaledSnapshots ? { ...state.scaledSnapshots } : null;
      if (newKept) delete newKept[id];
      if (newScaled) delete newScaled[id];
      return {
        elements: state.elements.filter((el) => el.id !== id),
        selectedElementId:
          state.selectedElementId === id ? null : state.selectedElementId,
        outOfBoundsIds: state.outOfBoundsIds.filter((oid) => oid !== id),
        keptSnapshots: newKept,
        scaledSnapshots: newScaled,
      };
    });
  },

  selectElement: (id) => {
    set({ selectedElementId: id });
  },

  moveElement: (id, x, y) => {
    const state = get();
    const updatedElements = state.elements.map((el) =>
      el.id === id ? { ...el, x, y } : el
    );
    set({
      elements: updatedElements,
      outOfBoundsIds: computeOutOfBoundsIds(updatedElements, state.canvasWidth, state.canvasHeight),
    });
  },

  resizeElement: (id, width, height) => {
    const state = get();
    const updatedElements = state.elements.map((el) =>
      el.id === id ? { ...el, width, height } : el
    );
    set({
      elements: updatedElements,
      outOfBoundsIds: computeOutOfBoundsIds(updatedElements, state.canvasWidth, state.canvasHeight),
    });
  },

  bringToFront: (id) => {
    const state = get();
    set({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: state.nextZIndex } : el
      ),
      nextZIndex: state.nextZIndex + 1,
    });
  },

  sendToBack: (id) => {
    set((state) => {
      const minZ = Math.min(...state.elements.map((el) => el.zIndex));
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, zIndex: minZ - 1 } : el
        ),
      };
    });
  },

  duplicateElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (element) {
      const newElement: CanvasElement = {
        ...element,
        id: generateId(),
        x: element.x + 20,
        y: element.y + 20,
        zIndex: state.nextZIndex,
      };
      const updatedElements = [...state.elements, newElement];
      set({
        elements: updatedElements,
        selectedElementId: newElement.id,
        nextZIndex: state.nextZIndex + 1,
        outOfBoundsIds: computeOutOfBoundsIds(updatedElements, state.canvasWidth, state.canvasHeight),
      });
    }
  },

  clearCanvas: () => {
    set({
      elements: [],
      selectedElementId: null,
      nextZIndex: 1,
      keptSnapshots: null,
      scaledSnapshots: null,
      outOfBoundsIds: [],
    });
  },

  setTheme: (themeId) => {
    const theme = themes[themeId];
    set({
      currentTheme: theme,
      currentThemeId: themeId,
      colorPalette: generateColorPalette(theme.primaryColor),
      canvasBackground: theme.backgroundColor,
    });
  },

  setPrimaryColor: (color) => {
    set({
      colorPalette: generateColorPalette(color),
    });
  },

  setCanvasBackground: (color) => {
    set({ canvasBackground: color });
  },

  changeCanvasSize: (width, height) => {
    const state = get();
    const oldWidth = state.canvasWidth;
    const oldHeight = state.canvasHeight;

    if (oldWidth === width && oldHeight === height) return;

    const scaleX = width / oldWidth;
    const scaleY = height / oldHeight;
    const avgScale = (scaleX + scaleY) / 2;

    const keptSnapshots: Record<string, PositionSnapshot> = {};
    const scaledSnapshots: Record<string, PositionSnapshot> = {};

    for (const el of state.elements) {
      keptSnapshots[el.id] = {
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fontSize: el.fontSize,
        borderRadius: el.borderRadius,
        borderWidth: el.borderWidth,
      };

      scaledSnapshots[el.id] = {
        x: Math.round(el.x * scaleX),
        y: Math.round(el.y * scaleY),
        width: Math.max(10, Math.round(el.width * scaleX)),
        height: Math.max(10, Math.round(el.height * scaleY)),
        fontSize: el.fontSize
          ? Math.max(8, Math.round(el.fontSize * avgScale))
          : undefined,
        borderRadius: el.borderRadius
          ? Math.max(0, Math.round(el.borderRadius * avgScale))
          : undefined,
        borderWidth: el.borderWidth
          ? Math.max(0, Math.round(el.borderWidth * avgScale))
          : undefined,
      };
    }

    const currentSnapshots =
      state.scaleMode === 'scale' ? scaledSnapshots : keptSnapshots;
    const updatedElements = applySnapshot(state.elements, currentSnapshots);
    const outOfBoundsIds = computeOutOfBoundsIds(
      updatedElements,
      width,
      height
    );

    set({
      canvasWidth: width,
      canvasHeight: height,
      elements: updatedElements,
      keptSnapshots,
      scaledSnapshots,
      outOfBoundsIds,
    });
  },

  setScaleMode: (mode) => {
    const state = get();
    if (state.scaleMode === mode) return;

    const snapshots =
      mode === 'scale' ? state.scaledSnapshots : state.keptSnapshots;
    if (!snapshots) {
      set({ scaleMode: mode });
      return;
    }

    const updatedElements = applySnapshot(state.elements, snapshots);
    const outOfBoundsIds = computeOutOfBoundsIds(
      updatedElements,
      state.canvasWidth,
      state.canvasHeight
    );

    set({
      scaleMode: mode,
      elements: updatedElements,
      outOfBoundsIds,
    });
  },

  resetOutOfBoundsElement: (id) => {
    const state = get();
    const el = state.elements.find((e) => e.id === id);
    if (!el) return;

    const newX = Math.max(
      0,
      Math.min(el.x, state.canvasWidth - el.width)
    );
    const newY = Math.max(
      0,
      Math.min(el.y, state.canvasHeight - el.height)
    );

    set({
      elements: state.elements.map((e) =>
        e.id === id ? { ...e, x: newX, y: newY } : e
      ),
      outOfBoundsIds: state.outOfBoundsIds.filter((oid) => oid !== id),
    });
  },

  resetAllOutOfBounds: () => {
    const state = get();
    if (state.outOfBoundsIds.length === 0) return;

    const updatedElements = state.elements.map((el) => {
      if (!state.outOfBoundsIds.includes(el.id)) return el;
      const newX = Math.max(
        0,
        Math.min(el.x, state.canvasWidth - el.width)
      );
      const newY = Math.max(
        0,
        Math.min(el.y, state.canvasHeight - el.height)
      );
      return { ...el, x: newX, y: newY };
    });

    set({
      elements: updatedElements,
      outOfBoundsIds: [],
    });
  },
}));
