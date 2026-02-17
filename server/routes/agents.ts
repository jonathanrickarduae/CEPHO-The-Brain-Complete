import express from 'express';
import { agentService } from '../services/agent-service';
import { chiefOfStaffOrchestrator } from '../services/chief-of-staff-orchestrator';

const router = express.Router();

// Agent Management
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    let agents;
    
    if (category) {
      agents = await agentService.getAgentsByCategory(category as string);
    } else {
      agents = await agentService.getAllAgents();
    }
    
    if (status) {
      agents = agents.filter(a => a.status === status);
    }
    
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const agent = await agentService.createAgent(req.body);
    res.status(201).json(agent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const agent = await agentService.updateAgent(req.params.id, req.body);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const success = await agentService.deleteAgent(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Capabilities
router.get('/:id/capabilities', async (req, res) => {
  try {
    const capabilities = await agentService.getAgentCapabilities(req.params.id);
    res.json(capabilities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/capabilities', async (req, res) => {
  try {
    const capability = await agentService.addCapability({
      ...req.body,
      agentId: req.params.id
    });
    res.status(201).json(capability);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/capabilities/:capId', async (req, res) => {
  try {
    const success = await agentService.removeCapability(req.params.capId);
    if (!success) {
      return res.status(404).json({ error: 'Capability not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Daily Reports
router.get('/:id/reports', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const reports = await agentService.getDailyReports(req.params.id, limit);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/reports/latest', async (req, res) => {
  try {
    const report = await agentService.getLatestReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'No reports found' });
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/reports', async (req, res) => {
  try {
    const report = await agentService.submitDailyReport({
      ...req.body,
      agentId: req.params.id
    });
    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports/pending', async (req, res) => {
  try {
    const reports = await agentService.getPendingReports();
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reports/:reportId/review', async (req, res) => {
  try {
    const { status, reviewedBy } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const report = await agentService.reviewReport(req.params.reportId, status, reviewedBy);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approval Requests
router.get('/approvals/pending', async (req, res) => {
  try {
    const approvals = await agentService.getPendingApprovals();
    res.json(approvals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/approvals', async (req, res) => {
  try {
    const approvals = await agentService.getAgentApprovals(req.params.id);
    res.json(approvals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/approvals', async (req, res) => {
  try {
    const request = await agentService.createApprovalRequest({
      ...req.body,
      agentId: req.params.id
    });
    res.status(201).json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/approvals/:requestId/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const request = await agentService.approveRequest(req.params.requestId, approvedBy);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/approvals/:requestId/reject', async (req, res) => {
  try {
    const { approvedBy, reason } = req.body;
    const request = await agentService.rejectRequest(req.params.requestId, approvedBy, reason);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Performance
router.get('/:id/performance', async (req, res) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({
      performanceRating: agent.performanceRating,
      tasksCompleted: agent.tasksCompleted,
      successRate: agent.successRate,
      avgResponseTime: agent.avgResponseTime,
      userSatisfaction: agent.userSatisfaction
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/performance/update', async (req, res) => {
  try {
    const rating = await agentService.updatePerformanceRating(req.params.id);
    res.json({ performanceRating: rating });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const agents = await agentService.getLeaderboard(limit);
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/underperformers', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 60;
    const agents = await agentService.getUnderperformers(threshold);
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chief of Staff Operations
router.post('/orchestrate/delegate', async (req, res) => {
  try {
    const assignment = await chiefOfStaffOrchestrator.delegateTask(req.body);
    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/orchestrate/review-reports', async (req, res) => {
  try {
    const result = await chiefOfStaffOrchestrator.reviewDailyReports();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/orchestrate/review-approvals', async (req, res) => {
  try {
    const result = await chiefOfStaffOrchestrator.reviewApprovalRequests();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orchestrate/monitor', async (req, res) => {
  try {
    const result = await chiefOfStaffOrchestrator.monitorAgentPerformance();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/orchestrate/coordinate', async (req, res) => {
  try {
    const { goal, categories } = req.body;
    const result = await chiefOfStaffOrchestrator.coordinateAgents(goal, categories);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orchestrate/daily-summary', async (req, res) => {
  try {
    const summary = await chiefOfStaffOrchestrator.generateDailySummary();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
