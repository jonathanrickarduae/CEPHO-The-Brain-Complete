# Render Logs Audit - Mar 1, 2026

## HTTP Status Summary from Logs

### 404 NOT FOUND (broken endpoints):

- notifications.getAll → 404
- cosTasks.getTasks → 404 (BAD_REQUEST actually - needs input)
- innovation.getIdeas → 404 (BAD_REQUEST - needs input)
- documentLibrary.list → 404 (BAD_REQUEST - needs input)
- analytics.getAll → 404
- dailyBrief.get → 404
- expertChat.getHistory → 404
- featureFlags.getAll → 404

### 500 INTERNAL SERVER ERROR:

- dashboard.getInsights → 500 (conversations query failing on live server)

### 200 OK (working):

- projectGenesis.listProjects → 200
- workflows.list → 200 (but client calls .list which may not exist)
- smeTeam.list → 200
- expertConsultation.list → 200 (but needs input)
- aiAgentsMonitoring.getAllStatus → 200
- integrations.list → 200
- subscriptionTracker.getSummary → 200
- qa.getTasksWithStatus → 200

## Key Issues:

1. The live server is running an OLD build (2026-02-27T12:50:00Z) - not the latest code
2. Many procedures that were added in recent commits are NOT on the live server
3. The dashboard.getInsights 500 error is happening on the live server with the old code
