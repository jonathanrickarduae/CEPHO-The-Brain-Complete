/**
 * Team Repository
 * 
 * Handles all database operations related to SME teams, team members,
 * collaboration, partnerships, and team capabilities.
 * 
 * @module db/repositories/team
 */

import { eq, and, desc, inArray } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import { 
  smeTeams,
  smeTeamMembers,
  teamCapabilities,
  smeAssessments,
  smeFeedback,
  partnerships,
  type SmeTeam,
  type InsertSmeTeam,
  type SmeTeamMember,
  type InsertSmeTeamMember,
  type TeamCapability,
  type InsertTeamCapability,
  type SmeAssessment,
  type InsertSmeAssessment,
  type Partnership,
  type InsertPartnership
} from "../../../drizzle/schema";

/**
 * Repository for team and collaboration operations
 */
export class TeamRepository extends BaseRepository {
  constructor() {
    super("TeamRepository");
  }

  // ==================== SME Teams ====================

  /**
   * Create an SME team
   */
  async createSmeTeam(data: InsertSmeTeam): Promise<SmeTeam | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createSmeTeam", { name: data.name, createdBy: data.createdBy });

      const [team] = await db
        .insert(smeTeams)
        .values(data)
        .returning();

      return team || null;
    } catch (error) {
      this.handleError("createSmeTeam", error as Error, { data });
    }
  }

  /**
   * Get all SME teams
   */
  async getSmeTeams(userId?: number): Promise<SmeTeam[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db.select().from(smeTeams);

      if (userId) {
        query = query.where(eq(smeTeams.createdBy, userId)) as any;
      }

      return await query.orderBy(desc(smeTeams.createdAt));
    } catch (error) {
      this.handleError("getSmeTeams", error as Error, { userId });
    }
  }

  /**
   * Get SME team by ID
   */
  async getSmeTeamById(id: number): Promise<SmeTeam | null> {
    try {
      const db = await this.getDatabase();
      
      const [team] = await db
        .select()
        .from(smeTeams)
        .where(eq(smeTeams.id, id));

      return team || null;
    } catch (error) {
      this.handleError("getSmeTeamById", error as Error, { id });
    }
  }

  /**
   * Get SME team with members
   */
  async getSmeTeamWithMembers(id: number): Promise<any | null> {
    try {
      const db = await this.getDatabase();
      
      const team = await this.getSmeTeamById(id);
      if (!team) return null;

      const members = await db
        .select()
        .from(smeTeamMembers)
        .where(eq(smeTeamMembers.teamId, id));

      return {
        ...team,
        members
      };
    } catch (error) {
      this.handleError("getSmeTeamWithMembers", error as Error, { id });
    }
  }

  /**
   * Update SME team
   */
  async updateSmeTeam(id: number, data: Partial<InsertSmeTeam>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateSmeTeam", { id });

      await db
        .update(smeTeams)
        .set(data)
        .where(eq(smeTeams.id, id));
    } catch (error) {
      this.handleError("updateSmeTeam", error as Error, { id, data });
    }
  }

  /**
   * Delete SME team
   */
  async deleteSmeTeam(id: number): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("deleteSmeTeam", { id });

      // Delete team members first
      await db
        .delete(smeTeamMembers)
        .where(eq(smeTeamMembers.teamId, id));

      // Delete team
      await db
        .delete(smeTeams)
        .where(eq(smeTeams.id, id));
    } catch (error) {
      this.handleError("deleteSmeTeam", error as Error, { id });
    }
  }

  // ==================== SME Team Members ====================

  /**
   * Add member to SME team
   */
  async addSmeTeamMember(teamId: number, userId: number, role: string, expertise?: string): Promise<SmeTeamMember | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("addSmeTeamMember", { teamId, userId, role });

      const [member] = await db
        .insert(smeTeamMembers)
        .values({ teamId, userId, role, expertise })
        .returning();

      return member || null;
    } catch (error) {
      this.handleError("addSmeTeamMember", error as Error, { teamId, userId, role });
    }
  }

  /**
   * Get SME team members
   */
  async getSmeTeamMembers(teamId: number): Promise<SmeTeamMember[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(smeTeamMembers)
        .where(eq(smeTeamMembers.teamId, teamId));
    } catch (error) {
      this.handleError("getSmeTeamMembers", error as Error, { teamId });
    }
  }

  /**
   * Remove member from SME team
   */
  async removeSmeTeamMember(teamId: number, userId: number): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("removeSmeTeamMember", { teamId, userId });

      await db
        .delete(smeTeamMembers)
        .where(and(
          eq(smeTeamMembers.teamId, teamId),
          eq(smeTeamMembers.userId, userId)
        ));
    } catch (error) {
      this.handleError("removeSmeTeamMember", error as Error, { teamId, userId });
    }
  }

  // ==================== Team Capabilities ====================

  /**
   * Add team capability
   */
  async addTeamCapability(teamId: number, capability: string, level: string): Promise<TeamCapability | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("addTeamCapability", { teamId, capability });

      const [cap] = await db
        .insert(teamCapabilities)
        .values({ teamId, capability, level })
        .returning();

      return cap || null;
    } catch (error) {
      this.handleError("addTeamCapability", error as Error, { teamId, capability });
    }
  }

  /**
   * Get team capabilities
   */
  async getTeamCapabilities(teamId: number): Promise<TeamCapability[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(teamCapabilities)
        .where(eq(teamCapabilities.teamId, teamId));
    } catch (error) {
      this.handleError("getTeamCapabilities", error as Error, { teamId });
    }
  }

  // ==================== SME Assessments ====================

  /**
   * Create SME assessment
   */
  async createSmeAssessment(data: InsertSmeAssessment): Promise<SmeAssessment | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createSmeAssessment", { userId: data.userId, assessedBy: data.assessedBy });

      const [assessment] = await db
        .insert(smeAssessments)
        .values(data)
        .returning();

      return assessment || null;
    } catch (error) {
      this.handleError("createSmeAssessment", error as Error, { data });
    }
  }

  /**
   * Get SME assessments
   */
  async getSmeAssessments(userId?: number, assessedBy?: number): Promise<SmeAssessment[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db.select().from(smeAssessments);

      if (userId) {
        query = query.where(eq(smeAssessments.userId, userId)) as any;
      } else if (assessedBy) {
        query = query.where(eq(smeAssessments.assessedBy, assessedBy)) as any;
      }

      return await query.orderBy(desc(smeAssessments.createdAt));
    } catch (error) {
      this.handleError("getSmeAssessments", error as Error, { userId, assessedBy });
    }
  }

  /**
   * Get assessments by snapshot ID
   */
  async getAssessmentsBySnapshot(snapshotId: number): Promise<SmeAssessment[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(smeAssessments)
        .where(eq(smeAssessments.snapshotId, snapshotId))
        .orderBy(desc(smeAssessments.createdAt));
    } catch (error) {
      this.handleError("getAssessmentsBySnapshot", error as Error, { snapshotId });
    }
  }

  // ==================== SME Feedback ====================

  /**
   * Create SME feedback
   */
  async createSmeFeedback(assessmentId: number, providedBy: number, feedback: string, rating?: number): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createSmeFeedback", { assessmentId, providedBy });

      await db
        .insert(smeFeedback)
        .values({ assessmentId, providedBy, feedback, rating });
    } catch (error) {
      this.handleError("createSmeFeedback", error as Error, { assessmentId, providedBy });
    }
  }

  /**
   * Get SME feedback
   */
  async getSmeFeedback(assessmentId: number): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(smeFeedback)
        .where(eq(smeFeedback.assessmentId, assessmentId))
        .orderBy(desc(smeFeedback.createdAt));
    } catch (error) {
      this.handleError("getSmeFeedback", error as Error, { assessmentId });
    }
  }

  /**
   * Get feedback history for a user
   */
  async getFeedbackHistory(userId: number, limit: number = 30): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      // Get assessments for user
      const assessments = await db
        .select({ id: smeAssessments.id })
        .from(smeAssessments)
        .where(eq(smeAssessments.userId, userId));

      if (assessments.length === 0) {
        return [];
      }

      const assessmentIds = assessments.map(a => a.id);

      // Get feedback for those assessments
      return await db
        .select()
        .from(smeFeedback)
        .where(inArray(smeFeedback.assessmentId, assessmentIds))
        .orderBy(desc(smeFeedback.createdAt))
        .limit(limit);
    } catch (error) {
      this.handleError("getFeedbackHistory", error as Error, { userId, limit });
    }
  }

  /**
   * Mark feedback as applied
   */
  async markFeedbackApplied(id: number): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("markFeedbackApplied", { id });

      await db
        .update(smeFeedback)
        .set({ applied: true, appliedAt: new Date() })
        .where(eq(smeFeedback.id, id));
    } catch (error) {
      this.handleError("markFeedbackApplied", error as Error, { id });
    }
  }

  // ==================== Partnerships ====================

  /**
   * Create partnership
   */
  async createPartnership(data: InsertPartnership): Promise<Partnership | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createPartnership", { name: data.name, userId: data.userId });

      const [partnership] = await db
        .insert(partnerships)
        .values(data)
        .returning();

      return partnership || null;
    } catch (error) {
      this.handleError("createPartnership", error as Error, { data });
    }
  }

  /**
   * Get partnerships
   */
  async getPartnerships(userId?: number, status?: string): Promise<Partnership[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db.select().from(partnerships);

      if (userId && status) {
        query = query.where(and(
          eq(partnerships.userId, userId),
          eq(partnerships.status, status)
        )) as any;
      } else if (userId) {
        query = query.where(eq(partnerships.userId, userId)) as any;
      } else if (status) {
        query = query.where(eq(partnerships.status, status)) as any;
      }

      return await query.orderBy(desc(partnerships.createdAt));
    } catch (error) {
      this.handleError("getPartnerships", error as Error, { userId, status });
    }
  }

  /**
   * Update partnership
   */
  async updatePartnership(id: number, data: Partial<InsertPartnership>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updatePartnership", { id });

      await db
        .update(partnerships)
        .set(data)
        .where(eq(partnerships.id, id));
    } catch (error) {
      this.handleError("updatePartnership", error as Error, { id, data });
    }
  }

  /**
   * Delete partnership
   */
  async deletePartnership(id: number): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("deletePartnership", { id });

      await db
        .delete(partnerships)
        .where(eq(partnerships.id, id));
    } catch (error) {
      this.handleError("deletePartnership", error as Error, { id });
    }
  }
}

// Export singleton instance
export const teamRepository = new TeamRepository();
