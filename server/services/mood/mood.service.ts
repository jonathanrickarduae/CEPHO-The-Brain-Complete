import { MoodRepository } from './mood.repository';
import { CreateMoodDto, MoodEntryDto } from './mood.types';
import { logger } from '../../utils/logger';

const log = logger.module('MoodService');

/**
 * Mood Service
 * 
 * Handles business logic for mood tracking:
 * - Creating mood entries (3x daily: morning, afternoon, evening)
 * - Retrieving mood history
 * - Analyzing mood patterns
 * - Generating insights
 */
export class MoodService {
  constructor(private repository: MoodRepository) {}

  /**
   * Create a new mood entry
   * 
   * @param userId - User ID
   * @param data - Mood entry data
   * @returns Created mood entry
   */
  async createEntry(userId: number, data: CreateMoodDto): Promise<MoodEntryDto> {
    // Validation
    this.validateMoodScore(data.score);
    this.validateTimeOfDay(data.timeOfDay);

    // Check if entry already exists for this time of day
    const existing = await this.repository.findByUserIdAndTimeOfDay(
      userId,
      data.timeOfDay,
      new Date()
    );

    if (existing) {
      log.warn({ userId, timeOfDay: data.timeOfDay }, 'Mood entry already exists for this time period');
      throw new Error(`Mood already recorded for ${data.timeOfDay} today`);
    }

    // Create entry
    const entry = await this.repository.create({
      userId,
      score: data.score,
      timeOfDay: data.timeOfDay,
      note: data.note,
    });

    log.info({ userId, score: data.score, timeOfDay: data.timeOfDay }, 'Mood entry created');

    return this.toDto(entry);
  }

  /**
   * Get mood history for a user
   * 
   * @param userId - User ID
   * @param days - Number of days to retrieve (default: 30)
   * @returns Array of mood entries
   */
  async getHistory(userId: number, days: number = 30): Promise<MoodEntryDto[]> {
    const entries = await this.repository.findByUserId(userId, days);
    return entries.map(entry => this.toDto(entry));
  }

  /**
   * Get today's mood entries
   * 
   * @param userId - User ID
   * @returns Array of today's mood entries
   */
  async getTodayEntries(userId: number): Promise<MoodEntryDto[]> {
    const entries = await this.repository.findByUserIdAndDate(userId, new Date());
    return entries.map(entry => this.toDto(entry));
  }

  /**
   * Calculate average mood score
   * 
   * @param userId - User ID
   * @param days - Number of days to analyze
   * @returns Average mood score
   */
  async getAverageMood(userId: number, days: number = 7): Promise<number> {
    const entries = await this.repository.findByUserId(userId, days);
    
    if (entries.length === 0) {
      return 0;
    }

    const sum = entries.reduce((acc, entry) => acc + entry.score, 0);
    return Math.round((sum / entries.length) * 10) / 10; // Round to 1 decimal
  }

  /**
   * Analyze mood patterns
   * 
   * @param userId - User ID
   * @returns Mood pattern insights
   */
  async analyzeMoodPatterns(userId: number) {
    const entries = await this.repository.findByUserId(userId, 30);

    const morningScores = entries
      .filter(e => e.timeOfDay === 'morning')
      .map(e => e.score);
    
    const afternoonScores = entries
      .filter(e => e.timeOfDay === 'afternoon')
      .map(e => e.score);
    
    const eveningScores = entries
      .filter(e => e.timeOfDay === 'evening')
      .map(e => e.score);

    return {
      morning: this.calculateStats(morningScores),
      afternoon: this.calculateStats(afternoonScores),
      evening: this.calculateStats(eveningScores),
      overall: this.calculateStats(entries.map(e => e.score)),
    };
  }

  // Private helper methods

  private validateMoodScore(score: number): void {
    if (score < 1 || score > 10) {
      throw new Error('Mood score must be between 1 and 10');
    }
  }

  private validateTimeOfDay(timeOfDay: string): void {
    const validTimes = ['morning', 'afternoon', 'evening'];
    if (!validTimes.includes(timeOfDay)) {
      throw new Error(`Time of day must be one of: ${validTimes.join(', ')}`);
    }
  }

  private calculateStats(scores: number[]) {
    if (scores.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 };
    }

    return {
      average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      min: Math.min(...scores),
      max: Math.max(...scores),
      count: scores.length,
    };
  }

  private toDto(entry: any): MoodEntryDto {
    return {
      id: entry.id,
      userId: entry.userId,
      score: entry.score,
      timeOfDay: entry.timeOfDay,
      note: entry.note || null,
      createdAt: entry.createdAt,
    };
  }
}

// Export singleton instance
import { MoodRepository as MoodRepo } from './mood.repository';
export const moodService = new MoodService(new MoodRepo());
