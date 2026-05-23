import { create } from 'zustand';

export interface MapNode {
  id: string;
  name: string;
  type: 'room' | 'lab' | 'audit' | 'restroom' | 'stairs' | 'elevator' | 'entrance' | 'service' | 'waypoint';
  floor: number;
  x: number; // Percent of width 0-100
  y: number; // Percent of height 0-100
  description?: string;
  isHidden?: boolean;
}

export interface MapEdge {
  from: string;
  to: string;
  weight: number;
}

interface CampusState {
  currentFloor: number;
  selectedNodeId: string | null;
  navigationPath: string[] | null;
  isTotemActive: boolean;
  view: 'welcome' | 'map' | 'admin' | 'chat' | 'nodes' | 'profile';
  userQuery: string;
  isDarkMode: boolean;
  
  setFloor: (floor: number) => void;
  selectNode: (id: string | null) => void;
  setNavigationPath: (path: string[] | null) => void;
  activateTotem: () => void;
  setView: (view: 'welcome' | 'map' | 'admin' | 'chat' | 'nodes' | 'profile') => void;
  setUserQuery: (query: string) => void;
  toggleDarkMode: () => void;
}

export const useCampusStore = create<CampusState>((set) => ({
  currentFloor: 0,
  selectedNodeId: null,
  navigationPath: null,
  isTotemActive: false,
  view: 'welcome',
  userQuery: '',
  isDarkMode: (() => {
    try {
      return localStorage.getItem('FECAF_DARK_MODE') === 'true';
    } catch {
      return false;
    }
  })(),

  setFloor: (floor) => set({ currentFloor: floor }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setNavigationPath: (path) => set({ navigationPath: path }),
  activateTotem: () => set({ isTotemActive: true, view: 'map' }),
  setView: (view) => set({ view: view }),
  setUserQuery: (query) => set({ userQuery: query }),
  toggleDarkMode: () => set((state) => {
    const nextDark = !state.isDarkMode;
    try {
      localStorage.setItem('FECAF_DARK_MODE', String(nextDark));
    } catch (e) {
      console.error(e);
    }
    return { isDarkMode: nextDark };
  }),
}));
