/**
 * Morning Signal PDF Generation Service
 * 
 * Generates branded PDF briefings following CEPHO design guidelines:
 * - Black, white, grey palette with pink accents
 * - Calibri font, professional consulting style
 * - Clean dividers and clear structure
 */

interface SignalItem {
  id: string;
  type: 'accepted' | 'deferred' | 'insight' | 'overnight';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
}

interface MorningSignalData {
  userName: string;
  date: string;
  greeting: string;
  acceptedTasks: SignalItem[];
  deferredTasks: SignalItem[];
  insights: SignalItem[];
  overnightWork: SignalItem[];
  patterns?: {
    productivityScore?: number;
    focusAreas?: string[];
    recommendations?: string[];
  };
}

/**
 * Generate HTML content for the Morning Signal PDF
 * Following CEPHO design guidelines
 */
export function generateMorningSignalHtml(data: MorningSignalData): string {
  const {
    userName,
    date,
    greeting,
    acceptedTasks,
    deferredTasks,
    insights,
    overnightWork,
    patterns
  } = data;

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: '#ff4081',
      medium: '#666666',
      low: '#999999'
    };
    return `<span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: ${colors[priority] || '#666'}; color: white; font-size: 10px; text-transform: uppercase;">${priority}</span>`;
  };

  const renderItems = (items: SignalItem[], emptyMessage: string) => {
    if (items.length === 0) {
      return `<p style="color: #666; font-style: italic;">${emptyMessage}</p>`;
    }
    return items.map(item => `
      <div style="margin-bottom: 12px; padding: 12px; background: #f9f9f9; border-left: 3px solid ${item.priority === 'high' ? '#ff4081' : '#333'};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong style="color: #000;">${item.title}</strong>
          ${priorityBadge(item.priority)}
        </div>
        <p style="margin: 0; color: #444; font-size: 12px;">${item.description}</p>
        <p style="margin: 4px 0 0 0; color: #888; font-size: 10px;">Source: ${item.source}</p>
      </div>
    `).join('');
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', 'Calibri', sans-serif;
      color: #000;
      background: #fff;
      line-height: 1.5;
      padding: 40px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #000;
      margin-bottom: 30px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #00d4ff, #ff4081);
      border-radius: 8px;
    }
    
    .logo-text {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    
    .date {
      color: #666;
      font-size: 14px;
    }
    
    .greeting {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .subtitle {
      color: #666;
      font-size: 16px;
      margin-bottom: 30px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #000;
      padding-bottom: 8px;
      border-bottom: 1px solid #ddd;
      margin-bottom: 16px;
    }
    
    .divider {
      height: 1px;
      background: #eee;
      margin: 30px 0;
    }
    
    .patterns-box {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .patterns-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    
    .pattern-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
    }
    
    .pattern-bullet {
      width: 6px;
      height: 6px;
      background: #ff4081;
      border-radius: 50%;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #888;
      font-size: 11px;
    }
    
    .score-badge {
      display: inline-block;
      padding: 4px 12px;
      background: linear-gradient(135deg, #00d4ff, #ff4081);
      color: white;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-icon"></div>
      <span class="logo-text">CEPHO</span>
    </div>
    <div class="date">${date}</div>
  </div>
  
  <h1 class="greeting">${greeting}, ${userName}</h1>
  <p class="subtitle">Your Morning Signal is ready. Here's what needs your attention today.</p>
  
  ${acceptedTasks.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Ready for Today</h2>
    ${renderItems(acceptedTasks, 'No tasks ready for today')}
  </div>
  ` : ''}
  
  ${deferredTasks.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Needs Attention</h2>
    ${renderItems(deferredTasks, 'No deferred tasks')}
  </div>
  ` : ''}
  
  ${insights.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Chief of Staff Insights</h2>
    ${renderItems(insights, 'No insights available')}
  </div>
  ` : ''}
  
  ${overnightWork.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Overnight Progress</h2>
    ${renderItems(overnightWork, 'No overnight work completed')}
  </div>
  ` : ''}
  
  ${patterns ? `
  <div class="patterns-box">
    <h3 class="patterns-title">
      Pattern Analysis 
      ${patterns.productivityScore ? `<span class="score-badge">${patterns.productivityScore}/10</span>` : ''}
    </h3>
    ${patterns.focusAreas && patterns.focusAreas.length > 0 ? `
      <div style="margin-bottom: 12px;">
        <strong style="font-size: 12px; color: #666;">Focus Areas:</strong>
        ${patterns.focusAreas.map(area => `
          <div class="pattern-item">
            <span class="pattern-bullet"></span>
            <span>${area}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
    ${patterns.recommendations && patterns.recommendations.length > 0 ? `
      <div>
        <strong style="font-size: 12px; color: #666;">Recommendations:</strong>
        ${patterns.recommendations.map(rec => `
          <div class="pattern-item">
            <span class="pattern-bullet"></span>
            <span>${rec}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Generated by CEPHO Chief of Staff</p>
    <p style="margin-top: 4px;">Your AI powered executive assistant</p>
  </div>
</body>
</html>
`;
}

export type { MorningSignalData, SignalItem };
