/**
 * Mood Service Types and DTOs
 * 
 * Data Transfer Objects for the mood tracking service.
 * These types define the contract between the service layer and consumers.
 */

/**
 * DTO for creating a mood entry
 */
export interface CreateMoodDto {
  score: number; // 1-10
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  note?: string;
}

/**
 * DTO for mood entry response
 */
export interface MoodEntryDto {
  id: number;
  userId: number;
  score: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  note: string | null;
  createdAt: Date;
}

/**
 * DTO for mood pattern analysis
 */
export interface MoodPatternDto {
  morning: MoodStatsDto;
  afternoon: MoodStatsDto;
  evening: MoodStatsDto;
  overall: MoodStatsDto;
}

/**
 * DTO for mood statistics
 */
export interface MoodStatsDto {
  average: number;
  min: number;
  max: number;
  count: number;
}

/**
 * DTO for updating a mood entry
 */
export interface UpdateMoodDto {
  score?: number;
  note?: string;
}
