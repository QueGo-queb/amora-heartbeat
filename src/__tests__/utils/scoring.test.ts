import { describe, it, expect } from 'vitest';
import { 
  calculateRecencyScore, 
  calculateTagMatches,
  computeScore 
} from '@/utils/scoring';

describe('Scoring Utils', () => {
  describe('calculateRecencyScore', () => {
    it('should give higher score to recent posts', () => {
      const recent = new Date().toISOString();
      const old = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24h ago
      
      const recentScore = calculateRecencyScore(recent);
      const oldScore = calculateRecencyScore(old);
      
      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it('should return 0 for very old posts', () => {
      const veryOld = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
      const score = calculateRecencyScore(veryOld);
      
      expect(score).toBe(0);
    });
  });

  describe('calculateTagMatches', () => {
    it('should calculate correct match percentage', () => {
      const postTags = ['travel', 'food', 'culture'];
      const userInterests = ['travel', 'food', 'music', 'art'];
      
      const score = calculateTagMatches(postTags, userInterests);
      
      // 2 matches out of 3 tags = 66.67%
      expect(score).toBeCloseTo(66.67, 1);
    });

    it('should return 0 for no matches', () => {
      const postTags = ['sports', 'gaming'];
      const userInterests = ['music', 'art'];
      
      const score = calculateTagMatches(postTags, userInterests);
      
      expect(score).toBe(0);
    });

    it('should return 100 for perfect match', () => {
      const tags = ['travel', 'food'];
      const score = calculateTagMatches(tags, tags);
      
      expect(score).toBe(100);
    });
  });

  describe('computeScore', () => {
    const mockPost = {
      id: '1',
      content: 'Test post',
      created_at: new Date().toISOString(),
      tags: ['travel', 'food'],
      profiles: {
        id: 'user1',
        plan: 'premium',
        interests: ['travel', 'music']
      }
    };

    const mockViewerProfile = {
      id: 'viewer',
      interests: ['travel', 'food', 'music'],
      age: 25,
      gender: 'homme',
      country: 'France'
    };

    it('should compute total score correctly', () => {
      const score = computeScore(mockPost, mockViewerProfile);
      
      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });

    it('should return 0 for incompatible profiles', () => {
      const incompatiblePost = {
        ...mockPost,
        profiles: {
          ...mockPost.profiles,
          age: 60, // Assume this makes profiles incompatible
        }
      };

      const score = computeScore(incompatiblePost, mockViewerProfile);
      
      expect(score).toBe(0);
    });
  });
});
