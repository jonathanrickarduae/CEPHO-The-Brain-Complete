import { SkillType } from './workflow-engine';
import { getDb } from '../db';
import { cephoWorkflowValidations } from '../../drizzle/workflow-schema';
import { eq, and } from 'drizzle-orm';

/**
 * Step Validator Service
 * 
 * Validates workflow step data against defined validation rules
 */

export interface ValidationRule {
  type: string;
  rule: string;
  message: string;
}

export interface ValidationContext {
  workflowId: string;
  stepId: string;
  skillType: SkillType;
  stepNumber: number;
  stepName: string;
  stepData: Record<string, any>;
  validationRules: ValidationRule[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  rule: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export class StepValidator {
  /**
   * Validate step data against validation rules
   */
  static async validateStep(context: ValidationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Execute each validation rule
    for (const rule of context.validationRules) {
      const ruleResult = await this.executeValidationRule(context, rule);
      
      if (!ruleResult.passed) {
        errors.push({
          field: this.extractFieldFromRule(rule.rule),
          message: rule.message,
          rule: rule.rule,
        });
      }

      // Add warnings for best practices
      const warning = this.checkBestPractices(context, rule);
      if (warning) {
        warnings.push(warning);
      }
    }

    // Save validation results to database
    await this.saveValidationResults(context, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Execute a single validation rule
   */
  private static async executeValidationRule(
    context: ValidationContext,
    rule: ValidationRule
  ): Promise<{ passed: boolean }> {
    const { stepData } = context;

    switch (rule.type) {
      case 'required_field':
        return this.validateRequiredField(stepData, rule.rule);
      
      case 'required_fields':
        return this.validateRequiredFields(stepData, rule.rule);
      
      case 'minimum_count':
        return this.validateMinimumCount(stepData, rule.rule);
      
      case 'minimum_value':
        return this.validateMinimumValue(stepData, rule.rule);
      
      case 'maximum_value':
        return this.validateMaximumValue(stepData, rule.rule);
      
      case 'range':
        return this.validateRange(stepData, rule.rule);
      
      case 'format':
        return this.validateFormat(stepData, rule.rule);
      
      case 'custom':
        return this.validateCustom(stepData, rule.rule);
      
      default:
        // Unknown validation type, pass by default
        return { passed: true };
    }
  }

  /**
   * Validate required field exists and is not empty
   */
  private static validateRequiredField(
    data: Record<string, any>,
    rule: string
  ): { passed: boolean } {
    const field = rule;
    const value = data[field];

    if (value === undefined || value === null || value === '') {
      return { passed: false };
    }

    if (Array.isArray(value) && value.length === 0) {
      return { passed: false };
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return { passed: false };
    }

    return { passed: true };
  }

  /**
   * Validate multiple required fields
   */
  private static validateRequiredFields(
    data: Record<string, any>,
    rule: string
  ): { passed: boolean } {
    // Parse rule like "all_canvas_blocks" to check specific fields
    // For now, just check if data object has content
    return { passed: Object.keys(data).length > 0 };
  }

  /**
   * Validate minimum count (e.g., "competitors >= 3")
   */
  private static validateMinimumCount(
    data: Record<string, any>,
    rule: string
  ): { passed: boolean } {
    const match = rule.match(/(\w+)\s*>=\s*(\d+)/);
    if (!match) return { passed: true };

    const [, field, minCount] = match;
    const value = data[field];

    if (Array.isArray(value)) {
      return { passed: value.length >= parseInt(minCount) };
    }

    if (typeof value === 'number') {
      return { passed: value >= parseInt(minCount) };
    }

    return { passed: false };
  }

  /**
   * Validate minimum value
   */
  private static validateMinimumValue(
    data: Record<string, any>,
    rule: string
  ): { passed: boolean } {
    const match = rule.match(/(\w+)\s*>=\s*(\d+)/);
    if (!match) return { passed: true };

    const [, field, minValue] = match;
    const value = data[field];

    if (typeof value === 'number') {
      return { passed: value >= parseInt(minValue) };
    }

    return { passed: false };
  }

  /**
   * Validate maximum value
   */
  private static validateMaximumValue(
    data: Record<string, any>,
    rule: string
  ): { passed: boolean } {
    const match = rule.match(/(\w+)\s*<=\s*(\d+)/);
    if (!match) return { passed: true };

    const [, field, maxValue] = match;
    const value = data[field];

    if (typeof value === 'number') {
      return { passed: value <= parseInt(maxValue) };
    }

    return { passed: false };
  }

  /**
   * Validate value is within range
   */
  private static validateRange(
    data: Record<string, any>,
    rule: string
  ): { passed: boolean } {
    const match = rule.match(/(\w+)\s+between\s+(\d+)\s+and\s+(\d+)/);
    if (!match) return { passed: true };

    const [, field, min, max] = match;
    const value = data[field];

    if (typeof value === 'number') {
      return { passed: value >= parseInt(min) && value <= parseInt(max) };
    }

    return { passed: false };
  }

  /**
   * Validate format (email, URL, date, etc.)
   */
  private static validateFormat(
    data: Record<string, any>,
    rule: string
  ): { passed: boolean } {
    const [field, format] = rule.split(':');
    const value = data[field];

    if (!value) return { passed: false };

    switch (format) {
      case 'email':
        return { passed: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) };
      
      case 'url':
        try {
          new URL(value);
          return { passed: true };
        } catch {
          return { passed: false };
        }
      
      case 'date':
        return { passed: !isNaN(Date.parse(value)) };
      
      case 'phone':
        return { passed: /^\+?[\d\s\-()]+$/.test(value) };
      
      default:
        return { passed: true };
    }
  }

  /**
   * Validate custom rule
   */
  private static validateCustom(
    data: Record<string, any>,
    rule: string
  ): { passed: boolean } {
    // Custom validation logic can be added here
    // For now, always pass
    return { passed: true };
  }

  /**
   * Check best practices and generate warnings
   */
  private static checkBestPractices(
    context: ValidationContext,
    rule: ValidationRule
  ): ValidationWarning | null {
    const { stepData } = context;

    // Example: Warn if market size is too small
    if (rule.rule === 'market_size' && stepData.market_size) {
      const marketSize = parseInt(stepData.market_size);
      if (marketSize < 100000000) { // Less than $100M
        return {
          field: 'market_size',
          message: 'Market size seems small for venture-scale opportunity',
          suggestion: 'Consider expanding target market or validating market size estimate',
        };
      }
    }

    // Example: Warn if too few customer interviews
    if (rule.rule.includes('interviews') && stepData.interviews) {
      const interviews = Array.isArray(stepData.interviews) 
        ? stepData.interviews.length 
        : parseInt(stepData.interviews);
      
      if (interviews < 15) {
        return {
          field: 'interviews',
          message: 'More customer interviews recommended for robust validation',
          suggestion: 'Aim for 15-20 interviews to identify patterns and edge cases',
        };
      }
    }

    return null;
  }

  /**
   * Extract field name from validation rule
   */
  private static extractFieldFromRule(rule: string): string {
    // Extract field name from rules like "market_size", "competitors >= 3", etc.
    const match = rule.match(/^(\w+)/);
    return match ? match[1] : rule;
  }

  /**
   * Save validation results to database
   */
  private static async saveValidationResults(
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    const db = getDb();

    // Save each error as a validation record
    for (const error of errors) {
      await db.insert(cephoWorkflowValidations).values({
        workflowId: context.workflowId,
        stepId: context.stepId,
        validationType: error.rule,
        result: 'fail',
        message: error.message,
        details: { field: error.field },
        createdAt: new Date(),
      });
    }

    // Save each warning as a validation record
    for (const warning of warnings) {
      await db.insert(cephoWorkflowValidations).values({
        workflowId: context.workflowId,
        stepId: context.stepId,
        validationType: 'best_practice',
        result: 'warning',
        message: warning.message,
        details: { field: warning.field, suggestion: warning.suggestion },
        createdAt: new Date(),
      });
    }

    // If no errors, save a pass record
    if (errors.length === 0) {
      await db.insert(cephoWorkflowValidations).values({
        workflowId: context.workflowId,
        stepId: context.stepId,
        validationType: 'overall',
        result: 'pass',
        message: 'All validation checks passed',
        details: { warningCount: warnings.length },
        createdAt: new Date(),
      });
    }
  }

  /**
   * Get validation history for a workflow
   */
  static async getValidationHistory(workflowId: string) {
    const db = getDb();
    return await db
      .select()
      .from(cephoWorkflowValidations)
      .where(eq(cephoWorkflowValidations.workflowId, workflowId));
  }

  /**
   * Get validation results for a specific step
   */
  static async getStepValidation(workflowId: string, stepId: string) {
    const db = getDb();
    return await db
      .select()
      .from(cephoWorkflowValidations)
      .where(
        and(
          eq(cephoWorkflowValidations.workflowId, workflowId),
          eq(cephoWorkflowValidations.stepId, stepId)
        )
      );
  }
}
