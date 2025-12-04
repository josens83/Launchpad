import { create } from "zustand";
import type { Project, Script, Thumbnail, Keyword } from "@/types";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  // Script management
  addScript: (projectId: string, script: Script) => void;
  updateScript: (projectId: string, scriptId: string, content: string) => void;
  // Thumbnail management
  addThumbnail: (projectId: string, thumbnail: Thumbnail) => void;
  selectThumbnail: (projectId: string, thumbnailId: string) => void;
  // Keyword management
  addKeywords: (projectId: string, keywords: Keyword[]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  setProjects: (projects) => set({ projects }),

  setCurrentProject: (currentProject) => set({ currentProject }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates, updated_at: new Date().toISOString() }
          : state.currentProject,
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  addScript: (projectId, script) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, scripts: [...(p.scripts || []), script] }
          : p
      ),
      currentProject:
        state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              scripts: [...(state.currentProject.scripts || []), script],
            }
          : state.currentProject,
    })),

  updateScript: (projectId, scriptId, content) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              scripts: p.scripts?.map((s) =>
                s.id === scriptId ? { ...s, content } : s
              ),
            }
          : p
      ),
    })),

  addThumbnail: (projectId, thumbnail) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, thumbnails: [...(p.thumbnails || []), thumbnail] }
          : p
      ),
      currentProject:
        state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              thumbnails: [...(state.currentProject.thumbnails || []), thumbnail],
            }
          : state.currentProject,
    })),

  selectThumbnail: (projectId, thumbnailId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              thumbnails: p.thumbnails?.map((t) => ({
                ...t,
                is_selected: t.id === thumbnailId,
              })),
            }
          : p
      ),
    })),

  addKeywords: (projectId, keywords) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, keywords: [...(p.keywords || []), ...keywords] }
          : p
      ),
    })),
}));
