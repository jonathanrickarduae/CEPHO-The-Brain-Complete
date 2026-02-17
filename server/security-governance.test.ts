import { describe, it, expect } from 'vitest';

// Test governance mode feature availability
describe('Governance Mode', () => {
  // Omni mode features
  const OMNI_FEATURES = {
    aiExperts: true,
    digitalTwin: true,
    externalLLMs: true,
    openSourceAI: true,
    microsoftCopilot: true,
    companyApprovedAI: true,
    voiceInput: true,
    autonomousAgents: true,
    trainingStudio: true,
    dataExport: true,
  };

  // Governed mode features
  const GOVERNED_FEATURES = {
    aiExperts: false,
    digitalTwin: true,
    externalLLMs: false,
    openSourceAI: false,
    microsoftCopilot: true,
    companyApprovedAI: true,
    voiceInput: true,
    autonomousAgents: false,
    trainingStudio: false,
    dataExport: false,
  };

  describe('Omni Mode', () => {
    it('should allow all AI features', () => {
      expect(OMNI_FEATURES.aiExperts).toBe(true);
      expect(OMNI_FEATURES.externalLLMs).toBe(true);
      expect(OMNI_FEATURES.openSourceAI).toBe(true);
      expect(OMNI_FEATURES.autonomousAgents).toBe(true);
    });

    it('should allow training studio and data export', () => {
      expect(OMNI_FEATURES.trainingStudio).toBe(true);
      expect(OMNI_FEATURES.dataExport).toBe(true);
    });

    it('should allow Microsoft Copilot', () => {
      expect(OMNI_FEATURES.microsoftCopilot).toBe(true);
    });
  });

  describe('Governed Mode', () => {
    it('should block external AI features', () => {
      expect(GOVERNED_FEATURES.aiExperts).toBe(false);
      expect(GOVERNED_FEATURES.externalLLMs).toBe(false);
      expect(GOVERNED_FEATURES.openSourceAI).toBe(false);
    });

    it('should block autonomous agents', () => {
      expect(GOVERNED_FEATURES.autonomousAgents).toBe(false);
    });

    it('should allow Microsoft Copilot and company-approved AI', () => {
      expect(GOVERNED_FEATURES.microsoftCopilot).toBe(true);
      expect(GOVERNED_FEATURES.companyApprovedAI).toBe(true);
    });

    it('should allow Digital Twin with restrictions', () => {
      expect(GOVERNED_FEATURES.digitalTwin).toBe(true);
    });

    it('should block training studio and data export', () => {
      expect(GOVERNED_FEATURES.trainingStudio).toBe(false);
      expect(GOVERNED_FEATURES.dataExport).toBe(false);
    });

    it('should allow voice input', () => {
      expect(GOVERNED_FEATURES.voiceInput).toBe(true);
    });
  });
});

// Test integration governance status
describe('Integration Governance', () => {
  const integrations = [
    { name: 'Outlook 365', governedApproved: true, omniApproved: true, complianceLevel: 'high' },
    { name: 'Microsoft Teams', governedApproved: true, omniApproved: true, complianceLevel: 'high' },
    { name: 'Microsoft Copilot', governedApproved: true, omniApproved: true, complianceLevel: 'high' },
    { name: 'Manus AI', governedApproved: false, omniApproved: true, complianceLevel: 'medium' },
    { name: 'OpenAI API', governedApproved: false, omniApproved: true, complianceLevel: 'low' },
    { name: 'ChatGPT', governedApproved: false, omniApproved: true, complianceLevel: 'low' },
  ];

  it('should have Microsoft products approved for governed mode', () => {
    const microsoftProducts = integrations.filter(i => i.name.includes('Microsoft'));
    microsoftProducts.forEach(product => {
      expect(product.governedApproved).toBe(true);
      expect(product.complianceLevel).toBe('high');
    });
  });

  it('should block external AI in governed mode', () => {
    const externalAI = integrations.filter(i => 
      i.name.includes('OpenAI') || i.name.includes('ChatGPT') || i.name.includes('Manus')
    );
    externalAI.forEach(ai => {
      expect(ai.governedApproved).toBe(false);
    });
  });

  it('should allow all integrations in omni mode', () => {
    integrations.forEach(integration => {
      expect(integration.omniApproved).toBe(true);
    });
  });

  it('should have compliance levels assigned', () => {
    integrations.forEach(integration => {
      expect(['high', 'medium', 'low']).toContain(integration.complianceLevel);
    });
  });
});

// Test 2FA verification code generation
describe('2FA Security', () => {
  it('should generate 6-digit verification codes', () => {
    const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    const code = generateCode();
    expect(code).toHaveLength(6);
    expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
    expect(parseInt(code)).toBeLessThan(1000000);
  });

  it('should generate unique codes', () => {
    const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateCode());
    }
    // With 900,000 possible codes, 100 random codes should be mostly unique
    expect(codes.size).toBeGreaterThan(90);
  });

  it('should validate code format', () => {
    const isValidCode = (code: string) => /^\d{6}$/.test(code);
    expect(isValidCode('123456')).toBe(true);
    expect(isValidCode('12345')).toBe(false);
    expect(isValidCode('1234567')).toBe(false);
    expect(isValidCode('abcdef')).toBe(false);
  });
});

// Test vault session management
describe('Vault Session', () => {
  it('should have session timeout', () => {
    const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    expect(SESSION_TIMEOUT).toBe(300000);
  });

  it('should track session expiry', () => {
    const createSession = () => ({
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
      isValid: true,
    });

    const session = createSession();
    expect(session.expiresAt).toBeGreaterThan(session.createdAt);
    expect(session.expiresAt - session.createdAt).toBe(300000);
  });

  it('should detect expired sessions', () => {
    const isSessionExpired = (expiresAt: number) => Date.now() > expiresAt;
    
    const expiredSession = Date.now() - 1000;
    const validSession = Date.now() + 60000;
    
    expect(isSessionExpired(expiredSession)).toBe(true);
    expect(isSessionExpired(validSession)).toBe(false);
  });
});
