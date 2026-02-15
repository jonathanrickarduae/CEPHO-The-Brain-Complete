# PROJECT LINKING PROTOCOL

**CEPHO.AI Master Working File Integration Guide**
**Version:** 1.0
**Last Updated:** January 16, 2026

---

## Purpose

This protocol establishes how individual project folders connect to the CEPHO.AI Master Working File. By following this linking system, each project gains access to the latest processes, SME frameworks, and blueprints while maintaining its own workspace.

---

## How Linking Works

The CEPHO.AI Master Working File serves as the central repository for all core processes and frameworks. Individual projects do not duplicate these resources. Instead, they reference the master versions through direct links. This approach ensures that when processes are updated in the master file, all linked projects automatically benefit from the improvements.

When you create a new project, you register it in the 05_Active_Projects folder of the master file. This registration creates a bidirectional link: the master file knows about your project, and your project knows where to find the master resources.

---

## Linking a New Project

### Step 1: Create Project Folder

Create your project folder using the standard template from 04_Project_Templates. You can place this folder anywhere in your Google Drive, but the recommended location is within a dedicated Projects directory.

### Step 2: Register in Master Index

Add your project to the 05_Active_Projects folder in the CEPHO.AI Master Working File. Create a simple markdown file named after your project (e.g., PROJECT_ALPHA.md) containing:

```
# [Project Name]

**Status:** Active
**Start Date:** [Date]
**Project Lead:** [Name]
**Folder Link:** [Google Drive link to project folder]

## Assigned SME Team
- [Expert 1] - [Role]
- [Expert 2] - [Role]

## Key Milestones
| Milestone | Target Date | Status |
|-----------|-------------|--------|
| [Milestone 1] | [Date] | Pending |

## Process References
- Project Genesis Workflow: ../01_Core_Processes/PROJECT_GENESIS_WORKFLOW.md
- QA Protocol: ../01_Core_Processes/QA_PROTOCOL.md
```

### Step 3: Add Master Reference to Project

In your project's 00_Project_Brief folder, create a file called MASTER_REFERENCE.md containing a link back to the CEPHO.AI Master Index. This ensures anyone working in the project can quickly access the core processes.

---

## Accessing Processes from Projects

When working within a project, you can access any master resource by following the links in your MASTER_REFERENCE.md file. The key resources available include:

**Core Processes (01_Core_Processes)**
These define how work gets done. Reference the Project Genesis Workflow for phase structure and the QA Protocol for quality standards.

**SME Frameworks (02_SME_Frameworks)**
When assembling expert teams, consult the SME Framework Overview for guidance on expert selection and team composition.

**Blueprints (03_Blueprints)**
For specific methodologies and templates, browse the Blueprint Library Index to find relevant guides.

**Project Templates (04_Project_Templates)**
Use these templates when creating new project components or documentation.

---

## Keeping Links Current

Google Drive links remain stable as long as files are not deleted. If you move a file, Google Drive automatically updates the link. However, if you delete and recreate a file, the link breaks.

To maintain link integrity:

1. Never delete master files. If updates are needed, edit the existing file.
2. Use the "Get link" feature in Google Drive to obtain shareable links.
3. Periodically verify that project links in 05_Active_Projects are still valid.
4. When a project completes, update its status to "Complete" rather than deleting the registration.

---

## Authorization for Project Access

When you share the CEPHO.AI Master Working File with a project or collaborator, they gain read access to all core processes. This is the intended behavior as it ensures everyone follows the same standards.

For projects requiring restricted access, create a separate copy of only the specific blueprints needed. However, this approach means the project will not automatically receive updates when master processes change.

The recommended approach is to grant read access to the full master file while maintaining write access only for authorized administrators.

---

## Updating Master Processes

Changes to master processes should be made through this master conversation. When updates are agreed upon, they will be reflected in the master file and automatically available to all linked projects.

The update workflow:

1. Identify needed change through project experience or feedback
2. Discuss and approve change in master conversation
3. Update the relevant master document
4. Notify active projects of significant changes

Minor clarifications and corrections can be made directly. Significant changes to process flow or requirements should be communicated to active project leads.

---

## Troubleshooting

**Link not working:** Verify the file still exists in the master folder. If moved, update the link in your project reference.

**Process seems outdated:** Check the version date at the top of the master document. If your project started before a recent update, review the changes to ensure alignment.

**Cannot find relevant blueprint:** Browse the Blueprint Library Index or search within the 03_Blueprints folder. If no suitable blueprint exists, request creation through the master conversation.

**Project not appearing in Active Projects:** Ensure you completed the registration step. Create the project registration file in 05_Active_Projects.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-16 | Initial release | CEPHO.AI |
