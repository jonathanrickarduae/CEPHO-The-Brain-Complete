import { WorkflowEngine, WorkflowConfig, WorkflowPhase } from '../services/workflow-engine';

/**
 * Financial Modeling Workflow - Automated Financial Model Generation
 * 
 * This workflow generates comprehensive financial models including
 * P&L, balance sheets, cash flow statements, and visualizations.
 */

export const FINANCIAL_MODELING_PHASES: WorkflowPhase[] = [
  {
    phaseNumber: 1,
    phaseName: 'Modeling',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Model Selection',
        description: 'Select financial model type and template',
        validations: [
          {
            type: 'required_field',
            rule: 'model_type',
            message: 'Model type must be selected',
          },
        ],
        deliverables: [],
      },
      {
        stepNumber: 2,
        stepName: 'Data Input',
        description: 'Enter financial data and assumptions',
        validations: [
          {
            type: 'required_fields',
            rule: 'core_financials',
            message: 'Core financial data is required',
          },
        ],
        deliverables: ['Input Data Summary'],
      },
      {
        stepNumber: 3,
        stepName: 'Model Generation',
        description: 'Generate financial statements and projections',
        validations: [
          {
            type: 'model_validation',
            rule: 'balance_check',
            message: 'Financial statements must balance',
          },
        ],
        deliverables: ['P&L Statement', 'Balance Sheet', 'Cash Flow Statement'],
      },
      {
        stepNumber: 4,
        stepName: 'Visualization & Export',
        description: 'Create charts and export financial model',
        validations: [],
        deliverables: ['Financial Charts', 'Excel Model', 'PDF Report'],
      },
    ],
  },
];

/**
 * Financial Model Types
 */
export enum FinancialModelType {
  STARTUP_3_STATEMENT = 'startup_3_statement',
  DCF_VALUATION = 'dcf_valuation',
  LBO_MODEL = 'lbo_model',
  MERGER_MODEL = 'merger_model',
  PROJECT_FINANCE = 'project_finance',
  BUDGET_FORECAST = 'budget_forecast',
}

/**
 * Financial Modeling Workflow Service
 */
export class FinancialModelingWorkflow {
  /**
   * Create a new Financial Modeling workflow
   */
  static async create(
    userId: number,
    companyName: string,
    modelType: FinancialModelType
  ) {
    const config: WorkflowConfig = {
      name: `Financial Model: ${companyName}`,
      skillType: 'financial_modeling',
      phases: FINANCIAL_MODELING_PHASES,
      metadata: {
        companyName,
        modelType,
        projectionYears: 5,
      },
    };

    return await WorkflowEngine.createWorkflow(userId, config);
  }

  /**
   * Submit financial data
   */
  static async submitFinancialData(
    workflowId: string,
    data: {
      revenue: number[];
      cogs: number[];
      opex: number[];
      assumptions: Record<string, any>;
    }
  ) {
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);
    const dataInputStep = steps.find(s => s.stepName === 'Data Input');

    if (!dataInputStep) {
      throw new Error('Data Input step not found');
    }

    return await WorkflowEngine.completeStep(workflowId, dataInputStep.id, {
      ...data,
      submittedAt: new Date().toISOString(),
    });
  }

  /**
   * Generate financial model
   */
  static async generateModel(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);

    const dataInputStep = steps.find(s => s.stepName === 'Data Input');

    if (!dataInputStep || dataInputStep.status !== 'completed') {
      throw new Error('Financial data must be submitted before generating model');
    }

    const inputData = dataInputStep.data;

    // Generate financial statements
    const model = this.calculateFinancialStatements(
      inputData.revenue,
      inputData.cogs,
      inputData.opex,
      inputData.assumptions
    );

    const modelGenerationStep = steps.find(s => s.stepName === 'Model Generation');

    if (!modelGenerationStep) {
      throw new Error('Model Generation step not found');
    }

    return await WorkflowEngine.completeStep(workflowId, modelGenerationStep.id, {
      model,
      generatedAt: new Date().toISOString(),
    });
  }

  /**
   * Calculate financial statements
   */
  private static calculateFinancialStatements(
    revenue: number[],
    cogs: number[],
    opex: number[],
    assumptions: Record<string, any>
  ) {
    const years = revenue.length;

    // P&L Statement
    const profitAndLoss = [];
    for (let i = 0; i < years; i++) {
      const grossProfit = revenue[i] - cogs[i];
      const ebitda = grossProfit - opex[i];
      const depreciation = assumptions.depreciation || 0;
      const ebit = ebitda - depreciation;
      const interest = assumptions.interest || 0;
      const ebt = ebit - interest;
      const tax = ebt * (assumptions.taxRate || 0.25);
      const netIncome = ebt - tax;

      profitAndLoss.push({
        year: i + 1,
        revenue: revenue[i],
        cogs: cogs[i],
        grossProfit,
        grossMargin: (grossProfit / revenue[i]) * 100,
        opex: opex[i],
        ebitda,
        ebitdaMargin: (ebitda / revenue[i]) * 100,
        depreciation,
        ebit,
        interest,
        ebt,
        tax,
        netIncome,
        netMargin: (netIncome / revenue[i]) * 100,
      });
    }

    // Balance Sheet (simplified)
    const balanceSheet = [];
    let cumulativeCash = assumptions.initialCash || 0;

    for (let i = 0; i < years; i++) {
      const cashFromOperations = profitAndLoss[i].netIncome + (assumptions.depreciation || 0);
      cumulativeCash += cashFromOperations;

      const assets = {
        cash: cumulativeCash,
        receivables: revenue[i] * 0.15, // 15% of revenue
        inventory: cogs[i] * 0.1, // 10% of COGS
        ppe: assumptions.initialPPE || 0,
      };

      const totalAssets = Object.values(assets).reduce((sum, val) => sum + val, 0);

      const liabilities = {
        payables: cogs[i] * 0.1, // 10% of COGS
        debt: assumptions.initialDebt || 0,
      };

      const totalLiabilities = Object.values(liabilities).reduce((sum, val) => sum + val, 0);

      const equity = totalAssets - totalLiabilities;

      balanceSheet.push({
        year: i + 1,
        assets,
        totalAssets,
        liabilities,
        totalLiabilities,
        equity,
      });
    }

    // Cash Flow Statement
    const cashFlow = [];
    for (let i = 0; i < years; i++) {
      const operatingCashFlow = profitAndLoss[i].netIncome + (assumptions.depreciation || 0);
      const investingCashFlow = -(assumptions.capex || 0);
      const financingCashFlow = i === 0 ? (assumptions.initialDebt || 0) : 0;
      const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

      cashFlow.push({
        year: i + 1,
        operatingCashFlow,
        investingCashFlow,
        financingCashFlow,
        netCashFlow,
        endingCash: balanceSheet[i].assets.cash,
      });
    }

    return {
      profitAndLoss,
      balanceSheet,
      cashFlow,
      keyMetrics: {
        totalRevenue: revenue.reduce((sum, r) => sum + r, 0),
        avgGrossMargin: profitAndLoss.reduce((sum, p) => sum + p.grossMargin, 0) / years,
        avgNetMargin: profitAndLoss.reduce((sum, p) => sum + p.netMargin, 0) / years,
        cumulativeCashFlow: cashFlow.reduce((sum, c) => sum + c.netCashFlow, 0),
      },
    };
  }

  /**
   * Generate visualizations
   */
  static async generateVisualizations(workflowId: string) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);

    const modelStep = steps.find(s => s.stepName === 'Model Generation');

    if (!modelStep || modelStep.status !== 'completed') {
      throw new Error('Model must be generated before creating visualizations');
    }

    const model = modelStep.data.model;

    // Generate chart configurations
    const charts = [
      {
        type: 'line',
        title: 'Revenue Growth',
        data: model.profitAndLoss.map((p: any) => ({
          year: `Year ${p.year}`,
          value: p.revenue,
        })),
      },
      {
        type: 'bar',
        title: 'Profitability',
        data: model.profitAndLoss.map((p: any) => ({
          year: `Year ${p.year}`,
          grossProfit: p.grossProfit,
          ebitda: p.ebitda,
          netIncome: p.netIncome,
        })),
      },
      {
        type: 'line',
        title: 'Cash Flow',
        data: model.cashFlow.map((c: any) => ({
          year: `Year ${c.year}`,
          value: c.netCashFlow,
        })),
      },
    ];

    return {
      charts,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Export financial model
   */
  static async exportModel(
    workflowId: string,
    format: 'excel' | 'pdf' | 'json'
  ) {
    const workflow = await WorkflowEngine.getWorkflow(workflowId);
    const steps = await WorkflowEngine.getWorkflowSteps(workflowId);

    const modelStep = steps.find(s => s.stepName === 'Model Generation');

    if (!modelStep || modelStep.status !== 'completed') {
      throw new Error('Model must be generated before exporting');
    }

    // TODO: Implement actual export logic
    return {
      format,
      url: `/api/workflows/${workflowId}/export/${format}`,
      filename: `financial_model_${workflow.metadata.companyName}.${format}`,
      generatedAt: new Date().toISOString(),
    };
  }
}
