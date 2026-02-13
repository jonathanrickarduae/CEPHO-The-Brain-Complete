#!/bin/bash
for file in server/_core/dataApi.ts server/_core/imageGeneration.ts server/_core/llm.ts server/_core/map.ts server/_core/textToSpeech.ts server/_core/voiceTranscription.ts; do
  echo "Fixing $file..."
  sed -i '/^import.*ENV.*from.*env/d' "$file"
done
