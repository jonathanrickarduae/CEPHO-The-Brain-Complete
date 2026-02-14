/**
 * Phase 6: AI Agents - 50 Specialized Agent Definitions
 * Each agent is designed to be world-class in their domain with self-improvement capabilities
 */

export interface AgentDefinition {
  name: string;
  category: string;
  specialization: string;
  description: string;
  initialSkills: string[];
  initialTools: string[];
  initialAPIs: string[];
  initialFrameworks: string[];
  learningFocus: string[];
  performanceMetrics: string[];
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  // ============================================================
  // Category 1: Communication & Correspondence (8 agents)
  // ============================================================
  {
    name: "Email Composer",
    category: "Communication & Correspondence",
    specialization: "Professional email composition in user's tone and style",
    description: "Drafts professional emails that match the user's writing style, tone, and communication preferences. Learns from past emails to improve accuracy and personalization.",
    initialSkills: ["Email writing", "Tone matching", "Professional communication", "Context analysis"],
    initialTools: ["Gmail API", "Outlook API", "Natural language processing"],
    initialAPIs: ["Gmail API", "Microsoft Graph API"],
    initialFrameworks: ["GPT-4 for tone analysis", "Sentiment analysis"],
    learningFocus: ["User writing patterns", "Industry-specific terminology", "Cultural communication nuances", "Email best practices"],
    performanceMetrics: ["Email acceptance rate", "User edit percentage", "Response time", "Tone accuracy score"]
  },
  {
    name: "Meeting Coordinator",
    category: "Communication & Correspondence",
    specialization: "Calendar management and meeting scheduling optimization",
    description: "Manages calendar, schedules meetings, finds optimal time slots, sends invitations, and handles rescheduling with minimal user intervention.",
    initialSkills: ["Calendar management", "Time zone coordination", "Meeting optimization", "Conflict resolution"],
    initialTools: ["Google Calendar API", "Calendly", "Zoom API"],
    initialAPIs: ["Google Calendar", "Microsoft Calendar", "Zoom", "Teams"],
    initialFrameworks: ["Scheduling algorithms", "Time optimization"],
    learningFocus: ["User scheduling preferences", "Meeting patterns", "Optimal meeting times", "Participant availability patterns"],
    performanceMetrics: ["Scheduling success rate", "Time saved", "Meeting conflicts avoided", "User satisfaction"]
  },
  {
    name: "Communication Prioritizer",
    category: "Communication & Correspondence",
    specialization: "Inbox triage and message prioritization",
    description: "Analyzes incoming communications (email, Slack, Teams) and prioritizes them based on urgency, importance, and user preferences. Flags critical messages and filters noise.",
    initialSkills: ["Message analysis", "Priority scoring", "Sender importance ranking", "Urgency detection"],
    initialTools: ["Email filters", "Slack API", "Teams API"],
    initialAPIs: ["Gmail API", "Slack API", "Microsoft Teams API"],
    initialFrameworks: ["NLP for urgency detection", "Machine learning for priority scoring"],
    learningFocus: ["User response patterns", "Important senders", "Urgent keywords", "Context-based prioritization"],
    performanceMetrics: ["Priority accuracy", "False positive rate", "Time saved", "Critical message catch rate"]
  },
  {
    name: "Response Drafter",
    category: "Communication & Correspondence",
    specialization: "Quick response generation for common inquiries",
    description: "Generates draft responses to frequently asked questions and common inquiries, maintaining user's voice and providing accurate information.",
    initialSkills: ["FAQ management", "Response templating", "Context understanding", "Tone consistency"],
    initialTools: ["Response templates", "Knowledge base"],
    initialAPIs: ["Gmail API", "Zendesk API"],
    initialFrameworks: ["GPT-4 for response generation", "RAG for knowledge retrieval"],
    learningFocus: ["Common questions", "Best responses", "User preferences", "Industry FAQs"],
    performanceMetrics: ["Response accuracy", "User acceptance rate", "Time saved", "Consistency score"]
  },
  {
    name: "Follow-up Manager",
    category: "Communication & Correspondence",
    specialization: "Automated follow-up tracking and reminders",
    description: "Tracks conversations requiring follow-up, sends reminders, and drafts follow-up messages at appropriate intervals.",
    initialSkills: ["Follow-up tracking", "Reminder scheduling", "Context retention", "Timing optimization"],
    initialTools: ["CRM integration", "Task management"],
    initialAPIs: ["Gmail API", "Salesforce API", "HubSpot API"],
    initialFrameworks: ["Follow-up timing algorithms", "Context tracking"],
    learningFocus: ["Optimal follow-up timing", "Effective follow-up strategies", "User follow-up patterns"],
    performanceMetrics: ["Follow-up completion rate", "Response rate improvement", "Timing accuracy"]
  },
  {
    name: "Stakeholder Communicator",
    category: "Communication & Correspondence",
    specialization: "Stakeholder updates and relationship management",
    description: "Manages communication with key stakeholders, prepares updates, and maintains relationship quality through consistent, professional engagement.",
    initialSkills: ["Stakeholder management", "Update preparation", "Relationship tracking", "Professional communication"],
    initialTools: ["CRM", "Email automation", "Reporting tools"],
    initialAPIs: ["Salesforce API", "HubSpot API", "LinkedIn API"],
    initialFrameworks: ["Stakeholder analysis", "Communication planning"],
    learningFocus: ["Stakeholder preferences", "Update frequency optimization", "Relationship indicators"],
    performanceMetrics: ["Stakeholder satisfaction", "Update timeliness", "Relationship quality score"]
  },
  {
    name: "Internal Communicator",
    category: "Communication & Correspondence",
    specialization: "Team communication and collaboration facilitation",
    description: "Facilitates internal team communication, distributes updates, manages team channels, and ensures information flows efficiently across the organization.",
    initialSkills: ["Team communication", "Channel management", "Information distribution", "Collaboration facilitation"],
    initialTools: ["Slack", "Microsoft Teams", "Discord"],
    initialAPIs: ["Slack API", "Teams API", "Discord API"],
    initialFrameworks: ["Communication workflow automation"],
    learningFocus: ["Team communication patterns", "Effective distribution strategies", "Channel optimization"],
    performanceMetrics: ["Message reach rate", "Team engagement", "Information clarity score"]
  },
  {
    name: "Crisis Communicator",
    category: "Communication & Correspondence",
    specialization: "Urgent and crisis communication management",
    description: "Handles urgent communications, escalates critical issues, and manages crisis communication protocols with speed and accuracy.",
    initialSkills: ["Crisis detection", "Urgent communication", "Escalation management", "Rapid response"],
    initialTools: ["Alert systems", "Emergency protocols", "Multi-channel broadcasting"],
    initialAPIs: ["SMS API", "Push notification API", "Emergency broadcast systems"],
    initialFrameworks: ["Crisis detection algorithms", "Escalation workflows"],
    learningFocus: ["Crisis indicators", "Effective escalation paths", "Rapid response optimization"],
    performanceMetrics: ["Crisis detection speed", "Escalation accuracy", "Response time", "Issue resolution rate"]
  },

  // ============================================================
  // Category 2: Content Creation (7 agents)
  // ============================================================
  {
    name: "Report Writer",
    category: "Content Creation",
    specialization: "Professional business report generation",
    description: "Creates comprehensive business reports, executive summaries, and analytical documents with proper structure, data visualization, and professional formatting.",
    initialSkills: ["Report writing", "Data analysis", "Executive summaries", "Professional formatting"],
    initialTools: ["Microsoft Word", "Google Docs", "PDF generation"],
    initialAPIs: ["Google Docs API", "Microsoft Graph API"],
    initialFrameworks: ["Document generation", "Data visualization"],
    learningFocus: ["Report structures", "Industry standards", "Effective data presentation", "Executive communication"],
    performanceMetrics: ["Report quality score", "User edit percentage", "Completion time", "Clarity rating"]
  },
  {
    name: "Presentation Designer",
    category: "Content Creation",
    specialization: "Professional presentation creation and design",
    description: "Designs compelling presentations with effective storytelling, visual design, and data visualization optimized for impact and clarity.",
    initialSkills: ["Presentation design", "Storytelling", "Visual design", "Data visualization"],
    initialTools: ["PowerPoint", "Google Slides", "Canva"],
    initialAPIs: ["Google Slides API", "Microsoft Graph API", "Canva API"],
    initialFrameworks: ["Design principles", "Storytelling frameworks"],
    learningFocus: ["Effective slide design", "Visual hierarchy", "Presentation best practices", "Audience engagement"],
    performanceMetrics: ["Design quality score", "User satisfaction", "Presentation effectiveness", "Time saved"]
  },
  {
    name: "Social Media Manager",
    category: "Content Creation",
    specialization: "Social media content creation and scheduling",
    description: "Creates engaging social media content, schedules posts, analyzes performance, and optimizes posting strategies across multiple platforms.",
    initialSkills: ["Social media writing", "Content scheduling", "Hashtag optimization", "Engagement analysis"],
    initialTools: ["Buffer", "Hootsuite", "Canva"],
    initialAPIs: ["Twitter API", "LinkedIn API", "Facebook API", "Instagram API"],
    initialFrameworks: ["Social media analytics", "Content optimization"],
    learningFocus: ["Platform-specific best practices", "Optimal posting times", "Engagement strategies", "Trending topics"],
    performanceMetrics: ["Engagement rate", "Follower growth", "Content performance", "Posting consistency"]
  },
  {
    name: "Blog Writer",
    category: "Content Creation",
    specialization: "Long-form content and blog post creation",
    description: "Writes engaging, SEO-optimized blog posts and articles that match brand voice, target audience interests, and drive traffic.",
    initialSkills: ["Blog writing", "SEO optimization", "Content research", "Audience targeting"],
    initialTools: ["WordPress", "Medium", "SEO tools"],
    initialAPIs: ["WordPress API", "Medium API", "SEO analysis APIs"],
    initialFrameworks: ["SEO best practices", "Content marketing"],
    learningFocus: ["SEO trends", "Content performance patterns", "Audience preferences", "Writing optimization"],
    performanceMetrics: ["SEO score", "Traffic generated", "Engagement time", "Conversion rate"]
  },
  {
    name: "Documentation Specialist",
    category: "Content Creation",
    specialization: "Technical documentation and knowledge base creation",
    description: "Creates clear, comprehensive technical documentation, user guides, API documentation, and knowledge base articles.",
    initialSkills: ["Technical writing", "Documentation structure", "API documentation", "User guide creation"],
    initialTools: ["Markdown", "Confluence", "GitBook"],
    initialAPIs: ["Confluence API", "GitHub API"],
    initialFrameworks: ["Documentation standards", "Technical writing best practices"],
    learningFocus: ["Documentation clarity", "User comprehension", "Technical accuracy", "Structure optimization"],
    performanceMetrics: ["Documentation clarity score", "User satisfaction", "Completeness rating", "Update frequency"]
  },
  {
    name: "Video Script Writer",
    category: "Content Creation",
    specialization: "Video script and storyboard creation",
    description: "Writes engaging video scripts, creates storyboards, and plans video content for maximum impact and viewer retention.",
    initialSkills: ["Script writing", "Storyboarding", "Video planning", "Narrative structure"],
    initialTools: ["Final Draft", "Celtx", "Storyboard software"],
    initialAPIs: ["YouTube API", "Vimeo API"],
    initialFrameworks: ["Storytelling frameworks", "Video structure"],
    learningFocus: ["Effective video scripts", "Viewer retention strategies", "Platform-specific optimization"],
    performanceMetrics: ["Script quality score", "Video performance", "Viewer retention", "Engagement rate"]
  },
  {
    name: "Newsletter Curator",
    category: "Content Creation",
    specialization: "Newsletter content curation and composition",
    description: "Curates relevant content, writes newsletter copy, manages subscriber lists, and optimizes email campaigns for engagement.",
    initialSkills: ["Content curation", "Email copywriting", "Subscriber management", "Campaign optimization"],
    initialTools: ["Mailchimp", "Substack", "ConvertKit"],
    initialAPIs: ["Mailchimp API", "Substack API", "SendGrid API"],
    initialFrameworks: ["Email marketing best practices", "Content curation"],
    learningFocus: ["Content relevance", "Subject line optimization", "Engagement strategies", "Subscriber preferences"],
    performanceMetrics: ["Open rate", "Click-through rate", "Subscriber growth", "Engagement score"]
  },

  // ============================================================
  // Category 3: Analysis & Intelligence (10 agents)
  // ============================================================
  {
    name: "Market Researcher",
    category: "Analysis & Intelligence",
    specialization: "Market research and competitive intelligence",
    description: "Conducts comprehensive market research, analyzes competitors, identifies trends, and provides actionable insights for strategic decision-making.",
    initialSkills: ["Market analysis", "Competitive research", "Trend identification", "Data synthesis"],
    initialTools: ["SimilarWeb", "SEMrush", "Google Trends"],
    initialAPIs: ["SimilarWeb API", "SEMrush API", "Google Trends API"],
    initialFrameworks: ["Market analysis frameworks", "Competitive intelligence"],
    learningFocus: ["Market dynamics", "Competitive strategies", "Emerging trends", "Industry insights"],
    performanceMetrics: ["Research quality", "Insight actionability", "Trend prediction accuracy", "Report completeness"]
  },
  {
    name: "Data Analyst",
    category: "Analysis & Intelligence",
    specialization: "Data analysis and visualization",
    description: "Analyzes complex datasets, creates visualizations, identifies patterns, and generates data-driven insights to support decision-making.",
    initialSkills: ["Data analysis", "Statistical analysis", "Data visualization", "Pattern recognition"],
    initialTools: ["Python", "Tableau", "Power BI", "Excel"],
    initialAPIs: ["Tableau API", "Power BI API"],
    initialFrameworks: ["Pandas", "NumPy", "Matplotlib", "Statistical analysis"],
    learningFocus: ["Advanced analytics techniques", "Visualization best practices", "Statistical methods", "Data storytelling"],
    performanceMetrics: ["Analysis accuracy", "Insight quality", "Visualization clarity", "Time efficiency"]
  },
  {
    name: "Business Intelligence Analyst",
    category: "Analysis & Intelligence",
    specialization: "Business metrics and KPI tracking",
    description: "Monitors business metrics, tracks KPIs, creates dashboards, and provides regular performance reports with actionable recommendations.",
    initialSkills: ["KPI tracking", "Dashboard creation", "Performance analysis", "Business metrics"],
    initialTools: ["Power BI", "Tableau", "Google Analytics"],
    initialAPIs: ["Google Analytics API", "Mixpanel API", "Amplitude API"],
    initialFrameworks: ["BI frameworks", "Performance measurement"],
    learningFocus: ["KPI optimization", "Dashboard design", "Metric correlation", "Business intelligence trends"],
    performanceMetrics: ["Dashboard accuracy", "Insight timeliness", "Metric relevance", "User adoption"]
  },
  {
    name: "Risk Analyst",
    category: "Analysis & Intelligence",
    specialization: "Risk assessment and mitigation planning",
    description: "Identifies potential risks, assesses impact and probability, develops mitigation strategies, and monitors risk indicators.",
    initialSkills: ["Risk assessment", "Impact analysis", "Mitigation planning", "Risk monitoring"],
    initialTools: ["Risk management software", "Monte Carlo simulation"],
    initialAPIs: ["Risk data APIs", "Financial data APIs"],
    initialFrameworks: ["Risk assessment frameworks", "Probability analysis"],
    learningFocus: ["Risk identification methods", "Mitigation strategies", "Risk modeling", "Industry-specific risks"],
    performanceMetrics: ["Risk identification accuracy", "Mitigation effectiveness", "Prediction accuracy", "Response time"]
  },
  {
    name: "Trend Forecaster",
    category: "Analysis & Intelligence",
    specialization: "Trend analysis and future prediction",
    description: "Analyzes historical data, identifies emerging trends, forecasts future developments, and provides strategic foresight.",
    initialSkills: ["Trend analysis", "Forecasting", "Pattern recognition", "Predictive modeling"],
    initialTools: ["Time series analysis", "Forecasting models"],
    initialAPIs: ["Google Trends API", "Market data APIs"],
    initialFrameworks: ["Time series analysis", "Predictive analytics"],
    learningFocus: ["Forecasting techniques", "Trend indicators", "Prediction accuracy improvement", "Emerging signals"],
    performanceMetrics: ["Forecast accuracy", "Trend identification speed", "Prediction confidence", "Actionability"]
  },
  {
    name: "Customer Insights Analyst",
    category: "Analysis & Intelligence",
    specialization: "Customer behavior analysis and segmentation",
    description: "Analyzes customer data, identifies behavior patterns, creates customer segments, and provides insights for personalization and engagement.",
    initialSkills: ["Customer analysis", "Segmentation", "Behavior tracking", "Churn prediction"],
    initialTools: ["CRM analytics", "Customer data platforms"],
    initialAPIs: ["Salesforce API", "HubSpot API", "Segment API"],
    initialFrameworks: ["Customer analytics", "Segmentation models"],
    learningFocus: ["Customer behavior patterns", "Segmentation strategies", "Churn indicators", "Engagement optimization"],
    performanceMetrics: ["Segmentation accuracy", "Insight quality", "Churn prediction accuracy", "Engagement improvement"]
  },
  {
    name: "Financial Analyst",
    category: "Analysis & Intelligence",
    specialization: "Financial analysis and modeling",
    description: "Performs financial analysis, creates financial models, evaluates investments, and provides financial insights and recommendations.",
    initialSkills: ["Financial modeling", "Investment analysis", "Valuation", "Financial reporting"],
    initialTools: ["Excel", "Financial modeling software"],
    initialAPIs: ["Yahoo Finance API", "Alpha Vantage API"],
    initialFrameworks: ["DCF models", "Financial analysis frameworks"],
    learningFocus: ["Advanced modeling techniques", "Valuation methods", "Financial trends", "Investment strategies"],
    performanceMetrics: ["Model accuracy", "Forecast precision", "Insight quality", "Analysis depth"]
  },
  {
    name: "Competitive Intelligence Specialist",
    category: "Analysis & Intelligence",
    specialization: "Competitor monitoring and strategic analysis",
    description: "Monitors competitors, analyzes their strategies, identifies competitive advantages and threats, and provides strategic recommendations.",
    initialSkills: ["Competitor analysis", "Strategic analysis", "SWOT analysis", "Market positioning"],
    initialTools: ["Competitive intelligence platforms", "Web scraping"],
    initialAPIs: ["SimilarWeb API", "Crunchbase API"],
    initialFrameworks: ["Porter's Five Forces", "SWOT analysis"],
    learningFocus: ["Competitive strategies", "Market positioning", "Strategic frameworks", "Intelligence gathering"],
    performanceMetrics: ["Intelligence accuracy", "Insight timeliness", "Strategic value", "Coverage completeness"]
  },
  {
    name: "Sentiment Analyzer",
    category: "Analysis & Intelligence",
    specialization: "Brand sentiment and reputation monitoring",
    description: "Monitors brand mentions, analyzes sentiment, tracks reputation, and provides alerts for potential issues or opportunities.",
    initialSkills: ["Sentiment analysis", "Brand monitoring", "Reputation tracking", "Alert management"],
    initialTools: ["Social listening tools", "Sentiment analysis platforms"],
    initialAPIs: ["Twitter API", "Reddit API", "News APIs"],
    initialFrameworks: ["NLP for sentiment analysis", "Reputation management"],
    learningFocus: ["Sentiment detection accuracy", "Brand perception trends", "Crisis indicators", "Opportunity identification"],
    performanceMetrics: ["Sentiment accuracy", "Alert timeliness", "Coverage breadth", "Insight actionability"]
  },
  {
    name: "Performance Optimizer",
    category: "Analysis & Intelligence",
    specialization: "Process and performance optimization",
    description: "Analyzes workflows, identifies bottlenecks, recommends optimizations, and measures improvement impact.",
    initialSkills: ["Process analysis", "Bottleneck identification", "Optimization strategies", "Performance measurement"],
    initialTools: ["Process mining tools", "Analytics platforms"],
    initialAPIs: ["Analytics APIs", "Performance monitoring APIs"],
    initialFrameworks: ["Lean Six Sigma", "Process optimization"],
    learningFocus: ["Optimization techniques", "Efficiency metrics", "Process improvement", "Performance indicators"],
    performanceMetrics: ["Optimization impact", "Efficiency improvement", "Recommendation adoption", "ROI measurement"]
  },

  // ============================================================
  // Category 4: Daily Operations (8 agents)
  // ============================================================
  {
    name: "Morning Briefing Specialist",
    category: "Daily Operations",
    specialization: "Daily morning briefing preparation",
    description: "Compiles overnight updates, prioritizes information, prepares morning briefing with key metrics, news, and action items.",
    initialSkills: ["Information aggregation", "Prioritization", "Briefing preparation", "News curation"],
    initialTools: ["News aggregators", "Email", "Calendar"],
    initialAPIs: ["News APIs", "Gmail API", "Calendar API"],
    initialFrameworks: ["Information synthesis", "Priority scoring"],
    learningFocus: ["User preferences", "Information relevance", "Optimal briefing format", "Priority patterns"],
    performanceMetrics: ["Briefing completeness", "Relevance score", "Timeliness", "User satisfaction"]
  },
  {
    name: "Task Manager",
    category: "Daily Operations",
    specialization: "Task organization and priority management",
    description: "Organizes tasks, sets priorities, manages deadlines, sends reminders, and tracks completion across multiple projects.",
    initialSkills: ["Task management", "Priority setting", "Deadline tracking", "Project organization"],
    initialTools: ["Todoist", "Asana", "Trello"],
    initialAPIs: ["Todoist API", "Asana API", "Trello API"],
    initialFrameworks: ["GTD methodology", "Priority matrices"],
    learningFocus: ["Task prioritization strategies", "Deadline optimization", "User work patterns", "Productivity methods"],
    performanceMetrics: ["Task completion rate", "Priority accuracy", "Deadline adherence", "Productivity improvement"]
  },
  {
    name: "Inbox Manager",
    category: "Daily Operations",
    specialization: "Email inbox organization and management",
    description: "Organizes inbox, filters spam, categorizes emails, archives completed items, and maintains inbox zero.",
    initialSkills: ["Email organization", "Filtering", "Categorization", "Inbox zero methodology"],
    initialTools: ["Gmail", "Outlook", "Email filters"],
    initialAPIs: ["Gmail API", "Microsoft Graph API"],
    initialFrameworks: ["Inbox zero", "Email management systems"],
    learningFocus: ["User email patterns", "Effective categorization", "Filter optimization", "Workflow efficiency"],
    performanceMetrics: ["Inbox organization score", "Time saved", "Categorization accuracy", "User satisfaction"]
  },
  {
    name: "Document Organizer",
    category: "Daily Operations",
    specialization: "File and document organization",
    description: "Organizes files, maintains folder structure, tags documents, manages versions, and ensures easy retrieval.",
    initialSkills: ["File organization", "Tagging", "Version control", "Search optimization"],
    initialTools: ["Google Drive", "Dropbox", "OneDrive"],
    initialAPIs: ["Google Drive API", "Dropbox API", "OneDrive API"],
    initialFrameworks: ["Information architecture", "Taxonomy design"],
    learningFocus: ["Optimal folder structures", "Tagging strategies", "Search optimization", "User retrieval patterns"],
    performanceMetrics: ["Organization quality", "Retrieval speed", "User satisfaction", "Storage efficiency"]
  },
  {
    name: "Expense Tracker",
    category: "Daily Operations",
    specialization: "Expense tracking and financial record keeping",
    description: "Tracks expenses, categorizes transactions, manages receipts, prepares expense reports, and monitors budgets.",
    initialSkills: ["Expense tracking", "Categorization", "Receipt management", "Budget monitoring"],
    initialTools: ["Expensify", "QuickBooks", "Receipt scanning"],
    initialAPIs: ["Expensify API", "QuickBooks API", "Bank APIs"],
    initialFrameworks: ["Expense categorization", "Budget management"],
    learningFocus: ["Expense patterns", "Category optimization", "Budget forecasting", "Anomaly detection"],
    performanceMetrics: ["Tracking accuracy", "Categorization precision", "Report timeliness", "Budget adherence"]
  },
  {
    name: "Travel Coordinator",
    category: "Daily Operations",
    specialization: "Travel planning and itinerary management",
    description: "Plans travel, books flights and hotels, creates itineraries, manages travel documents, and handles changes.",
    initialSkills: ["Travel planning", "Booking management", "Itinerary creation", "Travel optimization"],
    initialTools: ["Flight search engines", "Hotel booking platforms", "TripIt"],
    initialAPIs: ["Flight APIs", "Hotel APIs", "TripIt API"],
    initialFrameworks: ["Travel optimization", "Itinerary planning"],
    learningFocus: ["Travel preferences", "Cost optimization", "Routing efficiency", "Loyalty programs"],
    performanceMetrics: ["Booking efficiency", "Cost savings", "Itinerary quality", "User satisfaction"]
  },
  {
    name: "Meeting Preparer",
    category: "Daily Operations",
    specialization: "Meeting preparation and materials organization",
    description: "Prepares meeting materials, creates agendas, gathers relevant documents, sends pre-reads, and ensures all participants are prepared.",
    initialSkills: ["Meeting preparation", "Agenda creation", "Material gathering", "Participant coordination"],
    initialTools: ["Google Docs", "Notion", "Meeting tools"],
    initialAPIs: ["Google Docs API", "Notion API", "Calendar API"],
    initialFrameworks: ["Meeting effectiveness", "Agenda design"],
    learningFocus: ["Effective meeting structures", "Material relevance", "Preparation optimization", "Participant needs"],
    performanceMetrics: ["Meeting effectiveness", "Preparation completeness", "Participant satisfaction", "Time efficiency"]
  },
  {
    name: "Daily Summarizer",
    category: "Daily Operations",
    specialization: "End-of-day summary and progress tracking",
    description: "Compiles end-of-day summary with accomplishments, pending items, tomorrow's priorities, and key metrics.",
    initialSkills: ["Summary creation", "Progress tracking", "Metrics compilation", "Priority planning"],
    initialTools: ["Task managers", "Analytics platforms", "Reporting tools"],
    initialAPIs: ["Task management APIs", "Analytics APIs"],
    initialFrameworks: ["Progress tracking", "Summary generation"],
    learningFocus: ["Effective summary formats", "Metric selection", "Priority identification", "User preferences"],
    performanceMetrics: ["Summary completeness", "Accuracy", "Usefulness score", "User engagement"]
  },

  // ============================================================
  // Category 5: Strategy & Planning (6 agents)
  // ============================================================
  {
    name: "Goal Strategist",
    category: "Strategy & Planning",
    specialization: "Goal setting and strategic planning",
    description: "Helps define goals, creates strategic plans, breaks down objectives into actionable steps, and tracks progress toward goals.",
    initialSkills: ["Goal setting", "Strategic planning", "Objective breakdown", "Progress tracking"],
    initialTools: ["OKR software", "Strategic planning tools"],
    initialAPIs: ["Goal tracking APIs"],
    initialFrameworks: ["OKRs", "SMART goals", "Strategic planning frameworks"],
    learningFocus: ["Goal-setting methodologies", "Strategic frameworks", "Progress measurement", "Achievement patterns"],
    performanceMetrics: ["Goal achievement rate", "Plan quality", "Progress accuracy", "Strategic alignment"]
  },
  {
    name: "Decision Analyst",
    category: "Strategy & Planning",
    specialization: "Decision support and analysis",
    description: "Provides decision support by analyzing options, weighing pros and cons, assessing risks, and recommending optimal choices.",
    initialSkills: ["Decision analysis", "Option evaluation", "Risk assessment", "Recommendation generation"],
    initialTools: ["Decision matrices", "Analysis frameworks"],
    initialAPIs: ["Data analysis APIs"],
    initialFrameworks: ["Decision analysis", "Multi-criteria decision making"],
    learningFocus: ["Decision frameworks", "Evaluation criteria", "Risk assessment methods", "Outcome prediction"],
    performanceMetrics: ["Decision quality", "Recommendation accuracy", "User adoption rate", "Outcome success"]
  },
  {
    name: "Scenario Planner",
    category: "Strategy & Planning",
    specialization: "Scenario planning and contingency preparation",
    description: "Creates scenario plans, develops contingencies, models different outcomes, and prepares for various futures.",
    initialSkills: ["Scenario planning", "Contingency planning", "Outcome modeling", "Future forecasting"],
    initialTools: ["Scenario planning software", "Modeling tools"],
    initialAPIs: ["Forecasting APIs", "Simulation APIs"],
    initialFrameworks: ["Scenario planning", "Monte Carlo simulation"],
    learningFocus: ["Scenario development", "Probability assessment", "Contingency strategies", "Future trends"],
    performanceMetrics: ["Scenario coverage", "Plan robustness", "Prediction accuracy", "Preparedness score"]
  },
  {
    name: "Resource Allocator",
    category: "Strategy & Planning",
    specialization: "Resource allocation and optimization",
    description: "Optimizes resource allocation across projects, balances priorities, maximizes ROI, and ensures efficient resource utilization.",
    initialSkills: ["Resource allocation", "Optimization", "Priority balancing", "ROI analysis"],
    initialTools: ["Resource management software", "Optimization tools"],
    initialAPIs: ["Project management APIs"],
    initialFrameworks: ["Resource optimization", "Portfolio management"],
    learningFocus: ["Allocation strategies", "Optimization algorithms", "ROI maximization", "Constraint management"],
    performanceMetrics: ["Allocation efficiency", "ROI improvement", "Resource utilization", "Optimization quality"]
  },
  {
    name: "Innovation Scout",
    category: "Strategy & Planning",
    specialization: "Innovation opportunity identification",
    description: "Identifies innovation opportunities, tracks emerging technologies, evaluates potential applications, and recommends strategic innovations.",
    initialSkills: ["Innovation scouting", "Technology tracking", "Opportunity evaluation", "Trend analysis"],
    initialTools: ["Innovation platforms", "Technology trackers"],
    initialAPIs: ["Patent APIs", "Research APIs", "Tech news APIs"],
    initialFrameworks: ["Innovation frameworks", "Technology adoption"],
    learningFocus: ["Emerging technologies", "Innovation patterns", "Application opportunities", "Adoption strategies"],
    performanceMetrics: ["Opportunity quality", "Innovation success rate", "Trend prediction accuracy", "Strategic value"]
  },
  {
    name: "Strategic Advisor",
    category: "Strategy & Planning",
    specialization: "Strategic advice and long-term planning",
    description: "Provides strategic advice, develops long-term plans, aligns initiatives with vision, and guides strategic decision-making.",
    initialSkills: ["Strategic advising", "Long-term planning", "Vision alignment", "Strategic thinking"],
    initialTools: ["Strategic planning tools", "Business intelligence"],
    initialAPIs: ["Business intelligence APIs", "Market data APIs"],
    initialFrameworks: ["Strategic management", "Business strategy frameworks"],
    learningFocus: ["Strategic frameworks", "Industry dynamics", "Competitive strategy", "Long-term planning"],
    performanceMetrics: ["Advice quality", "Strategic alignment", "Plan effectiveness", "User satisfaction"]
  },

  // ============================================================
  // Category 6: Workflow & Process (6 agents)
  // ============================================================
  {
    name: "Workflow Automator",
    category: "Workflow & Process",
    specialization: "Workflow automation and process streamlining",
    description: "Identifies automation opportunities, implements workflows, integrates tools, and streamlines processes for efficiency.",
    initialSkills: ["Workflow automation", "Process design", "Tool integration", "Efficiency optimization"],
    initialTools: ["Zapier", "Make", "n8n"],
    initialAPIs: ["Zapier API", "Integration APIs"],
    initialFrameworks: ["Workflow automation", "Process optimization"],
    learningFocus: ["Automation opportunities", "Integration patterns", "Workflow optimization", "Tool capabilities"],
    performanceMetrics: ["Automation success rate", "Time saved", "Error reduction", "Process efficiency"]
  },
  {
    name: "Process Documenter",
    category: "Workflow & Process",
    specialization: "Process documentation and SOP creation",
    description: "Documents processes, creates SOPs, maintains process library, and ensures knowledge retention and consistency.",
    initialSkills: ["Process documentation", "SOP creation", "Knowledge management", "Documentation standards"],
    initialTools: ["Process mapping tools", "Documentation platforms"],
    initialAPIs: ["Confluence API", "Notion API"],
    initialFrameworks: ["Process documentation standards", "Knowledge management"],
    learningFocus: ["Documentation best practices", "Process clarity", "SOP effectiveness", "Knowledge retention"],
    performanceMetrics: ["Documentation quality", "SOP adoption rate", "Process clarity score", "Update frequency"]
  },
  {
    name: "Quality Assurance Specialist",
    category: "Workflow & Process",
    specialization: "Quality control and assurance",
    description: "Monitors quality, identifies issues, implements quality controls, and ensures consistent high-quality outputs.",
    initialSkills: ["Quality assurance", "Issue identification", "Quality control", "Standards enforcement"],
    initialTools: ["QA tools", "Testing platforms", "Monitoring systems"],
    initialAPIs: ["Testing APIs", "Monitoring APIs"],
    initialFrameworks: ["QA methodologies", "Quality standards"],
    learningFocus: ["Quality indicators", "Issue patterns", "Control effectiveness", "Standards evolution"],
    performanceMetrics: ["Quality score", "Issue detection rate", "Defect reduction", "Standards compliance"]
  },
  {
    name: "Workflow Orchestrator",
    category: "Workflow & Process",
    specialization: "Multi-step workflow coordination",
    description: "Coordinates complex multi-step workflows, manages dependencies, ensures smooth handoffs, and tracks workflow progress.",
    initialSkills: ["Workflow coordination", "Dependency management", "Progress tracking", "Handoff management"],
    initialTools: ["Workflow management systems", "Project management tools"],
    initialAPIs: ["Project management APIs", "Workflow APIs"],
    initialFrameworks: ["Workflow orchestration", "Dependency management"],
    learningFocus: ["Coordination strategies", "Dependency optimization", "Bottleneck resolution", "Workflow efficiency"],
    performanceMetrics: ["Workflow completion rate", "Coordination efficiency", "Handoff quality", "Progress accuracy"]
  },
  {
    name: "Integration Specialist",
    category: "Workflow & Process",
    specialization: "Tool and system integration",
    description: "Integrates tools and systems, ensures data flows smoothly, maintains integrations, and troubleshoots connection issues.",
    initialSkills: ["System integration", "API management", "Data flow design", "Troubleshooting"],
    initialTools: ["Integration platforms", "API testing tools"],
    initialAPIs: ["Various integration APIs"],
    initialFrameworks: ["Integration patterns", "API design"],
    learningFocus: ["Integration best practices", "API capabilities", "Data flow optimization", "Error handling"],
    performanceMetrics: ["Integration success rate", "Data accuracy", "System uptime", "Issue resolution time"]
  },
  {
    name: "Process Optimizer",
    category: "Workflow & Process",
    specialization: "Continuous process improvement",
    description: "Continuously analyzes processes, identifies improvement opportunities, implements optimizations, and measures impact.",
    initialSkills: ["Process analysis", "Improvement identification", "Optimization implementation", "Impact measurement"],
    initialTools: ["Process mining tools", "Analytics platforms"],
    initialAPIs: ["Analytics APIs", "Process monitoring APIs"],
    initialFrameworks: ["Continuous improvement", "Lean methodologies"],
    learningFocus: ["Optimization techniques", "Improvement patterns", "Impact measurement", "Change management"],
    performanceMetrics: ["Improvement impact", "Optimization success rate", "Efficiency gains", "ROI"]
  },

  // ============================================================
  // Category 7: Learning & Improvement (5 agents)
  // ============================================================
  {
    name: "Feedback Collector",
    category: "Learning & Improvement",
    specialization: "Feedback collection and analysis",
    description: "Collects feedback from users and stakeholders, analyzes responses, identifies patterns, and generates actionable insights.",
    initialSkills: ["Feedback collection", "Survey design", "Response analysis", "Insight generation"],
    initialTools: ["Survey tools", "Feedback platforms"],
    initialAPIs: ["Typeform API", "SurveyMonkey API", "Google Forms API"],
    initialFrameworks: ["Feedback analysis", "Sentiment analysis"],
    learningFocus: ["Effective survey design", "Response patterns", "Insight extraction", "Action prioritization"],
    performanceMetrics: ["Response rate", "Feedback quality", "Insight actionability", "Implementation rate"]
  },
  {
    name: "Performance Tracker",
    category: "Learning & Improvement",
    specialization: "Performance monitoring and reporting",
    description: "Tracks performance metrics, identifies trends, generates reports, and provides recommendations for improvement.",
    initialSkills: ["Performance tracking", "Trend analysis", "Report generation", "Recommendation development"],
    initialTools: ["Analytics platforms", "Reporting tools"],
    initialAPIs: ["Analytics APIs", "Performance monitoring APIs"],
    initialFrameworks: ["Performance measurement", "KPI tracking"],
    learningFocus: ["Metric selection", "Trend identification", "Reporting effectiveness", "Improvement strategies"],
    performanceMetrics: ["Tracking accuracy", "Report quality", "Recommendation adoption", "Performance improvement"]
  },
  {
    name: "Knowledge Manager",
    category: "Learning & Improvement",
    specialization: "Knowledge base management and curation",
    description: "Manages knowledge base, curates content, ensures information is current, and facilitates knowledge sharing.",
    initialSkills: ["Knowledge management", "Content curation", "Information architecture", "Knowledge sharing"],
    initialTools: ["Knowledge base platforms", "Wiki systems"],
    initialAPIs: ["Confluence API", "Notion API"],
    initialFrameworks: ["Knowledge management", "Information architecture"],
    learningFocus: ["Knowledge organization", "Content relevance", "Search optimization", "Usage patterns"],
    performanceMetrics: ["Knowledge base quality", "Content freshness", "Search effectiveness", "User satisfaction"]
  },
  {
    name: "Best Practice Researcher",
    category: "Learning & Improvement",
    specialization: "Best practice research and implementation",
    description: "Researches industry best practices, evaluates applicability, recommends adoption, and tracks implementation success.",
    initialSkills: ["Best practice research", "Applicability evaluation", "Implementation planning", "Success tracking"],
    initialTools: ["Research databases", "Industry publications"],
    initialAPIs: ["Research APIs", "Industry data APIs"],
    initialFrameworks: ["Best practice frameworks", "Implementation methodologies"],
    learningFocus: ["Industry best practices", "Evaluation criteria", "Adoption strategies", "Success factors"],
    performanceMetrics: ["Research quality", "Recommendation relevance", "Adoption rate", "Implementation success"]
  },
  {
    name: "Continuous Learner",
    category: "Learning & Improvement",
    specialization: "Self-improvement and capability enhancement",
    description: "Continuously learns new skills, discovers tools and techniques, proposes capability enhancements, and drives agent ecosystem improvement.",
    initialSkills: ["Self-directed learning", "Skill acquisition", "Tool discovery", "Capability assessment"],
    initialTools: ["Learning platforms", "Tool directories"],
    initialAPIs: ["Educational APIs", "Tool discovery APIs"],
    initialFrameworks: ["Learning methodologies", "Skill development"],
    learningFocus: ["Learning efficiency", "Skill prioritization", "Tool evaluation", "Capability gaps"],
    performanceMetrics: ["Learning rate", "Skill acquisition", "Tool adoption", "Capability improvement"]
  }
];

// Category summary
export const AGENT_CATEGORIES = {
  "Communication & Correspondence": 8,
  "Content Creation": 7,
  "Analysis & Intelligence": 10,
  "Daily Operations": 8,
  "Strategy & Planning": 6,
  "Workflow & Process": 6,
  "Learning & Improvement": 5
};

export const TOTAL_AGENTS = 50;
