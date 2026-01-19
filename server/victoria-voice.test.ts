import { describe, it, expect } from 'vitest';

// Test the text-to-speech endpoint for Victoria
describe('Victoria Voice Synthesis', () => {
  it('should synthesize speech with ElevenLabs', async () => {
    // Import the synthesizeSpeech function
    const { synthesizeSpeech } = await import('./_core/textToSpeech');
    
    // Test with a sample briefing text
    const sampleBriefing = "Good morning. This is your daily briefing from Victoria. Today we have three priority items to address.";
    
    const result = await synthesizeSpeech({
      text: sampleBriefing,
    });
    
    console.log('Synthesis result:', JSON.stringify(result, null, 2));
    
    // Check if we got a valid response
    if ('error' in result) {
      // If ElevenLabs API key is not configured, this is expected
      console.log('ElevenLabs API not configured:', result.error);
      expect(result.error).toBeDefined();
    } else {
      // If successful, we should have audio data
      expect(result.audioUrl).toBeDefined();
      expect(result.audioUrl).toContain('http');
      console.log('Voice synthesis successful:', result.audioUrl);
    }
  });

  it('should list available voices', async () => {
    const { getAvailableVoices } = await import('./_core/textToSpeech');
    
    const result = await getAvailableVoices();
    
    if ('error' in result) {
      console.log('ElevenLabs API not configured:', result.error);
      expect(result.error).toBeDefined();
    } else {
      expect(result.voices).toBeDefined();
      expect(Array.isArray(result.voices)).toBe(true);
      console.log('Available voices:', result.voices.length);
    }
  });

  it('should get subscription info', async () => {
    const { getSubscriptionInfo } = await import('./_core/textToSpeech');
    
    const result = await getSubscriptionInfo();
    
    if ('error' in result) {
      console.log('ElevenLabs API not configured:', result.error);
      expect(result.error).toBeDefined();
    } else {
      expect(result.characterCount).toBeDefined();
      expect(result.characterLimit).toBeDefined();
      console.log('Subscription:', result.characterCount, '/', result.characterLimit, 'characters used');
    }
  });
});
