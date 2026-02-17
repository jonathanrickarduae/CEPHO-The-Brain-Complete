/**
 * Repository Index
 * 
 * Central export point for all repository classes.
 * Import repositories from this file to ensure consistency.
 * 
 * @module db/repositories
 * 
 * @example
 * ```typescript
 * import { userRepository } from "./db/repositories";
 * 
 * const user = await userRepository.findByEmail("user@example.com");
 * ```
 */

export { BaseRepository } from "./base.repository";
export { UserRepository, userRepository } from "./user.repository";
export { ProjectRepository, projectRepository } from "./project.repository";
export { ExpertRepository, expertRepository } from "./expert.repository";
export { TaskRepository, taskRepository } from "./task.repository";
export { MoodRepository, moodRepository } from "./mood.repository";
export { ReviewRepository, reviewRepository } from "./review.repository";
export { TeamRepository, teamRepository } from "./team.repository";
