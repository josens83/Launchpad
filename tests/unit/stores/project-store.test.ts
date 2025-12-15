/**
 * Project Store Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '@/stores/project-store';
import type { Project, Script, Thumbnail, Keyword } from '@/types';

// Helper to reset store state
const resetStore = () => {
  useProjectStore.setState({
    projects: [],
    currentProject: null,
    isLoading: false,
  });
};

// Mock data
const mockProject: Project = {
  id: 'project-1',
  user_id: 'user-1',
  title: 'Test Project',
  description: 'Test description',
  status: 'idea',
  scheduled_date: null,
  youtube_video_id: null,
  tags: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  scripts: [],
  thumbnails: [],
  keywords: [],
};

const mockScript: Script = {
  id: 'script-1',
  project_id: 'project-1',
  content: 'Test script content',
  word_count: 100,
  estimated_duration: 60,
  version: 1,
  created_at: '2024-01-01T00:00:00Z',
};

const mockThumbnail: Thumbnail = {
  id: 'thumbnail-1',
  project_id: 'project-1',
  image_url: 'https://example.com/thumbnail.jpg',
  prompt: 'Test prompt',
  ctr_score: null,
  is_selected: false,
  created_at: '2024-01-01T00:00:00Z',
};

const mockKeyword: Keyword = {
  id: 'keyword-1',
  project_id: 'project-1',
  keyword: 'test keyword',
  search_volume: 1000,
  competition: 'low',
  created_at: '2024-01-01T00:00:00Z',
};

describe('ProjectStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Project Management', () => {
    it('should initialize with empty state', () => {
      const state = useProjectStore.getState();
      expect(state.projects).toEqual([]);
      expect(state.currentProject).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should set projects', () => {
      const projects = [mockProject];
      useProjectStore.getState().setProjects(projects);

      expect(useProjectStore.getState().projects).toEqual(projects);
    });

    it('should set current project', () => {
      useProjectStore.getState().setCurrentProject(mockProject);

      expect(useProjectStore.getState().currentProject).toEqual(mockProject);
    });

    it('should clear current project', () => {
      useProjectStore.getState().setCurrentProject(mockProject);
      useProjectStore.getState().setCurrentProject(null);

      expect(useProjectStore.getState().currentProject).toBeNull();
    });

    it('should add project to beginning of list', () => {
      const existingProject = { ...mockProject, id: 'project-0' };
      useProjectStore.getState().setProjects([existingProject]);
      useProjectStore.getState().addProject(mockProject);

      const projects = useProjectStore.getState().projects;
      expect(projects).toHaveLength(2);
      expect(projects[0].id).toBe('project-1');
      expect(projects[1].id).toBe('project-0');
    });

    it('should update project', () => {
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().updateProject('project-1', { title: 'Updated Title' });

      const project = useProjectStore.getState().projects[0];
      expect(project.title).toBe('Updated Title');
      expect(project.updated_at).not.toBe(mockProject.updated_at);
    });

    it('should update current project when it matches', () => {
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().setCurrentProject(mockProject);
      useProjectStore.getState().updateProject('project-1', { title: 'Updated Title' });

      expect(useProjectStore.getState().currentProject?.title).toBe('Updated Title');
    });

    it('should not update current project when it does not match', () => {
      const otherProject = { ...mockProject, id: 'project-2' };
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().setCurrentProject(otherProject);
      useProjectStore.getState().updateProject('project-1', { title: 'Updated Title' });

      expect(useProjectStore.getState().currentProject?.title).toBe('Test Project');
    });

    it('should delete project', () => {
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().deleteProject('project-1');

      expect(useProjectStore.getState().projects).toHaveLength(0);
    });

    it('should clear current project when deleted project matches', () => {
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().setCurrentProject(mockProject);
      useProjectStore.getState().deleteProject('project-1');

      expect(useProjectStore.getState().currentProject).toBeNull();
    });

    it('should set loading state', () => {
      useProjectStore.getState().setLoading(true);
      expect(useProjectStore.getState().isLoading).toBe(true);

      useProjectStore.getState().setLoading(false);
      expect(useProjectStore.getState().isLoading).toBe(false);
    });
  });

  describe('Script Management', () => {
    beforeEach(() => {
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().setCurrentProject(mockProject);
    });

    it('should add script to project', () => {
      useProjectStore.getState().addScript('project-1', mockScript);

      const project = useProjectStore.getState().projects[0];
      expect(project.scripts).toHaveLength(1);
      expect(project.scripts![0]).toEqual(mockScript);
    });

    it('should add script to current project', () => {
      useProjectStore.getState().addScript('project-1', mockScript);

      const currentProject = useProjectStore.getState().currentProject;
      expect(currentProject?.scripts).toHaveLength(1);
    });

    it('should not add script to different project', () => {
      useProjectStore.getState().addScript('project-2', mockScript);

      const project = useProjectStore.getState().projects[0];
      expect(project.scripts).toHaveLength(0);
    });

    it('should update script content', () => {
      useProjectStore.getState().addScript('project-1', mockScript);
      useProjectStore.getState().updateScript('project-1', 'script-1', 'Updated content');

      const project = useProjectStore.getState().projects[0];
      expect(project.scripts![0].content).toBe('Updated content');
    });
  });

  describe('Thumbnail Management', () => {
    beforeEach(() => {
      useProjectStore.getState().setProjects([mockProject]);
      useProjectStore.getState().setCurrentProject(mockProject);
    });

    it('should add thumbnail to project', () => {
      useProjectStore.getState().addThumbnail('project-1', mockThumbnail);

      const project = useProjectStore.getState().projects[0];
      expect(project.thumbnails).toHaveLength(1);
      expect(project.thumbnails![0]).toEqual(mockThumbnail);
    });

    it('should add thumbnail to current project', () => {
      useProjectStore.getState().addThumbnail('project-1', mockThumbnail);

      const currentProject = useProjectStore.getState().currentProject;
      expect(currentProject?.thumbnails).toHaveLength(1);
    });

    it('should select thumbnail', () => {
      const thumbnail2: Thumbnail = { ...mockThumbnail, id: 'thumbnail-2' };
      useProjectStore.getState().addThumbnail('project-1', mockThumbnail);
      useProjectStore.getState().addThumbnail('project-1', thumbnail2);

      useProjectStore.getState().selectThumbnail('project-1', 'thumbnail-1');

      const project = useProjectStore.getState().projects[0];
      expect(project.thumbnails![0].is_selected).toBe(true);
      expect(project.thumbnails![1].is_selected).toBe(false);
    });
  });

  describe('Keyword Management', () => {
    beforeEach(() => {
      useProjectStore.getState().setProjects([mockProject]);
    });

    it('should add keywords to project', () => {
      useProjectStore.getState().addKeywords('project-1', [mockKeyword]);

      const project = useProjectStore.getState().projects[0];
      expect(project.keywords).toHaveLength(1);
      expect(project.keywords![0]).toEqual(mockKeyword);
    });

    it('should append keywords to existing keywords', () => {
      const keyword2: Keyword = { ...mockKeyword, id: 'keyword-2', keyword: 'another keyword' };
      useProjectStore.getState().addKeywords('project-1', [mockKeyword]);
      useProjectStore.getState().addKeywords('project-1', [keyword2]);

      const project = useProjectStore.getState().projects[0];
      expect(project.keywords).toHaveLength(2);
    });
  });
});
