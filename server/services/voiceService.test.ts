import { describe, it, expect } from 'vitest';

describe('ElevenLabs API Key Validation', () => {
  it('should validate the ElevenLabs API key by testing text-to-speech', async () => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    // Skip test if no API key is configured
    if (!apiKey) {
      console.log('ELEVENLABS_API_KEY not set, skipping test');
      return;
    }
    
    console.log('Testing ElevenLabs API with key starting with:', apiKey.substring(0, 8) + '...');
    
    // Use a default voice ID (Adam - deep male voice)
    const voiceId = 'pNInz6obpgDQGcFmaJgB';
    
    // Call ElevenLabs TTS API with a short test message
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: 'Hello',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });
    
    // Log response status for debugging
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API returned ${response.status}: ${errorText}`);
    }
    
    // Verify we got audio back
    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('audio');
    
    const audioBuffer = await response.arrayBuffer();
    expect(audioBuffer.byteLength).toBeGreaterThan(0);
    
    console.log(`ElevenLabs API key is valid. Generated ${audioBuffer.byteLength} bytes of audio.`);
  }, 30000); // 30 second timeout
});
