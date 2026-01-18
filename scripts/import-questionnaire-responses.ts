/**
 * Import Digital Twin Questionnaire Responses to Database
 * Extracted from conversation screenshots - Part 2 (Sections 6-10)
 * 18 January 2026
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { eq, and } from 'drizzle-orm';
import { questionnaireResponses, digitalTwinProfile } from '../drizzle/schema';

const db = drizzle(process.env.DATABASE_URL!);

const responses: Array<{
  questionId: string;
  questionType: 'scale' | 'boolean';
  scaleValue?: number;
  booleanValue?: boolean;
  section: string;
}> = [
  // Section 6 - Business Operations
  { questionId: 'A51', questionType: 'scale', scaleValue: 5, section: 'Business Operations' },
  { questionId: 'A52', questionType: 'scale', scaleValue: 9, section: 'Business Operations' },
  { questionId: 'A53', questionType: 'scale', scaleValue: 8, section: 'Business Operations' },
  { questionId: 'A54', questionType: 'scale', scaleValue: 7, section: 'Business Operations' },
  { questionId: 'A55', questionType: 'scale', scaleValue: 9, section: 'Business Operations' },
  { questionId: 'A56', questionType: 'scale', scaleValue: 7, section: 'Business Operations' },
  { questionId: 'A57', questionType: 'scale', scaleValue: 9, section: 'Business Operations' },
  { questionId: 'A58', questionType: 'scale', scaleValue: 4, section: 'Business Operations' },
  { questionId: 'A59', questionType: 'scale', scaleValue: 4, section: 'Business Operations' },
  { questionId: 'A60', questionType: 'scale', scaleValue: 9, section: 'Business Operations' },
  { questionId: 'B51', questionType: 'boolean', booleanValue: true, section: 'Business Operations' },
  { questionId: 'B52', questionType: 'boolean', booleanValue: true, section: 'Business Operations' },
  { questionId: 'B53', questionType: 'boolean', booleanValue: true, section: 'Business Operations' },
  { questionId: 'B54', questionType: 'boolean', booleanValue: true, section: 'Business Operations' },
  { questionId: 'B55', questionType: 'boolean', booleanValue: true, section: 'Business Operations' },
  { questionId: 'B56', questionType: 'boolean', booleanValue: false, section: 'Business Operations' },
  { questionId: 'B57', questionType: 'boolean', booleanValue: true, section: 'Business Operations' },
  { questionId: 'B58', questionType: 'boolean', booleanValue: true, section: 'Business Operations' },
  { questionId: 'B59', questionType: 'boolean', booleanValue: false, section: 'Business Operations' },
  { questionId: 'B60', questionType: 'boolean', booleanValue: true, section: 'Business Operations' },
  // Section 7 - Technology Innovation
  { questionId: 'A61', questionType: 'scale', scaleValue: 10, section: 'Technology Innovation' },
  { questionId: 'A62', questionType: 'scale', scaleValue: 10, section: 'Technology Innovation' },
  { questionId: 'A63', questionType: 'scale', scaleValue: 7, section: 'Technology Innovation' },
  { questionId: 'A64', questionType: 'scale', scaleValue: 10, section: 'Technology Innovation' },
  { questionId: 'A65', questionType: 'scale', scaleValue: 8, section: 'Technology Innovation' },
  { questionId: 'A66', questionType: 'scale', scaleValue: 9, section: 'Technology Innovation' },
  { questionId: 'A67', questionType: 'scale', scaleValue: 9, section: 'Technology Innovation' },
  { questionId: 'A68', questionType: 'scale', scaleValue: 8, section: 'Technology Innovation' },
  { questionId: 'A69', questionType: 'scale', scaleValue: 9, section: 'Technology Innovation' },
  { questionId: 'A70', questionType: 'scale', scaleValue: 10, section: 'Technology Innovation' },
  { questionId: 'B61', questionType: 'boolean', booleanValue: true, section: 'Technology Innovation' },
  { questionId: 'B62', questionType: 'boolean', booleanValue: true, section: 'Technology Innovation' },
  { questionId: 'B63', questionType: 'boolean', booleanValue: false, section: 'Technology Innovation' },
  { questionId: 'B64', questionType: 'boolean', booleanValue: true, section: 'Technology Innovation' },
  { questionId: 'B65', questionType: 'boolean', booleanValue: true, section: 'Technology Innovation' },
  { questionId: 'B66', questionType: 'boolean', booleanValue: false, section: 'Technology Innovation' },
  { questionId: 'B67', questionType: 'boolean', booleanValue: false, section: 'Technology Innovation' },
  { questionId: 'B68', questionType: 'boolean', booleanValue: true, section: 'Technology Innovation' },
  { questionId: 'B69', questionType: 'boolean', booleanValue: false, section: 'Technology Innovation' },
  { questionId: 'B70', questionType: 'boolean', booleanValue: false, section: 'Technology Innovation' },
  // Section 8 - Market Competition
  { questionId: 'A71', questionType: 'scale', scaleValue: 4, section: 'Market Competition' },
  { questionId: 'A72', questionType: 'scale', scaleValue: 7, section: 'Market Competition' },
  { questionId: 'A73', questionType: 'scale', scaleValue: 5, section: 'Market Competition' },
  { questionId: 'A74', questionType: 'scale', scaleValue: 3, section: 'Market Competition' },
  { questionId: 'A75', questionType: 'scale', scaleValue: 4, section: 'Market Competition' },
  { questionId: 'A76', questionType: 'scale', scaleValue: 5, section: 'Market Competition' },
  { questionId: 'A77', questionType: 'scale', scaleValue: 9, section: 'Market Competition' },
  { questionId: 'A78', questionType: 'scale', scaleValue: 7, section: 'Market Competition' },
  { questionId: 'A79', questionType: 'scale', scaleValue: 7, section: 'Market Competition' },
  { questionId: 'A80', questionType: 'scale', scaleValue: 7, section: 'Market Competition' },
  { questionId: 'B71', questionType: 'boolean', booleanValue: true, section: 'Market Competition' },
  { questionId: 'B72', questionType: 'boolean', booleanValue: true, section: 'Market Competition' },
  { questionId: 'B73', questionType: 'boolean', booleanValue: true, section: 'Market Competition' },
  { questionId: 'B74', questionType: 'boolean', booleanValue: true, section: 'Market Competition' },
  { questionId: 'B75', questionType: 'boolean', booleanValue: false, section: 'Market Competition' },
  { questionId: 'B76', questionType: 'boolean', booleanValue: true, section: 'Market Competition' },
  { questionId: 'B77', questionType: 'boolean', booleanValue: true, section: 'Market Competition' },
  { questionId: 'B78', questionType: 'boolean', booleanValue: true, section: 'Market Competition' },
  { questionId: 'B79', questionType: 'boolean', booleanValue: false, section: 'Market Competition' },
  { questionId: 'B80', questionType: 'boolean', booleanValue: true, section: 'Market Competition' },
  // Section 9 - Personal Productivity
  { questionId: 'A81', questionType: 'scale', scaleValue: 7, section: 'Personal Productivity' },
  { questionId: 'A82', questionType: 'scale', scaleValue: 7, section: 'Personal Productivity' },
  { questionId: 'A83', questionType: 'scale', scaleValue: 6, section: 'Personal Productivity' },
  { questionId: 'A84', questionType: 'scale', scaleValue: 6, section: 'Personal Productivity' },
  { questionId: 'A85', questionType: 'scale', scaleValue: 4, section: 'Personal Productivity' },
  { questionId: 'A86', questionType: 'scale', scaleValue: 9, section: 'Personal Productivity' },
  { questionId: 'A87', questionType: 'scale', scaleValue: 3, section: 'Personal Productivity' },
  { questionId: 'A88', questionType: 'scale', scaleValue: 9, section: 'Personal Productivity' },
  { questionId: 'A89', questionType: 'scale', scaleValue: 6, section: 'Personal Productivity' },
  { questionId: 'A90', questionType: 'scale', scaleValue: 8, section: 'Personal Productivity' },
  { questionId: 'B81', questionType: 'boolean', booleanValue: true, section: 'Personal Productivity' },
  { questionId: 'B82', questionType: 'boolean', booleanValue: true, section: 'Personal Productivity' },
  { questionId: 'B83', questionType: 'boolean', booleanValue: true, section: 'Personal Productivity' },
  { questionId: 'B84', questionType: 'boolean', booleanValue: false, section: 'Personal Productivity' },
  { questionId: 'B85', questionType: 'boolean', booleanValue: true, section: 'Personal Productivity' },
  { questionId: 'B86', questionType: 'boolean', booleanValue: true, section: 'Personal Productivity' },
  { questionId: 'B87', questionType: 'boolean', booleanValue: true, section: 'Personal Productivity' },
  { questionId: 'B88', questionType: 'boolean', booleanValue: true, section: 'Personal Productivity' },
  { questionId: 'B89', questionType: 'boolean', booleanValue: true, section: 'Personal Productivity' },
  { questionId: 'B90', questionType: 'boolean', booleanValue: true, section: 'Personal Productivity' },
  // Section 10 - Vision Legacy
  { questionId: 'A91', questionType: 'scale', scaleValue: 7, section: 'Vision Legacy' },
  { questionId: 'A92', questionType: 'scale', scaleValue: 3, section: 'Vision Legacy' },
  { questionId: 'A93', questionType: 'scale', scaleValue: 4, section: 'Vision Legacy' },
  { questionId: 'A94', questionType: 'scale', scaleValue: 9, section: 'Vision Legacy' },
  { questionId: 'A95', questionType: 'scale', scaleValue: 9, section: 'Vision Legacy' },
  { questionId: 'A96', questionType: 'scale', scaleValue: 8, section: 'Vision Legacy' },
  { questionId: 'A97', questionType: 'scale', scaleValue: 7, section: 'Vision Legacy' },
  { questionId: 'A98', questionType: 'scale', scaleValue: 6, section: 'Vision Legacy' },
  { questionId: 'A99', questionType: 'scale', scaleValue: 10, section: 'Vision Legacy' },
  { questionId: 'A100', questionType: 'scale', scaleValue: 6, section: 'Vision Legacy' },
  { questionId: 'B91', questionType: 'boolean', booleanValue: true, section: 'Vision Legacy' },
  { questionId: 'B92', questionType: 'boolean', booleanValue: true, section: 'Vision Legacy' },
  { questionId: 'B93', questionType: 'boolean', booleanValue: true, section: 'Vision Legacy' },
  { questionId: 'B94', questionType: 'boolean', booleanValue: true, section: 'Vision Legacy' },
  { questionId: 'B95', questionType: 'boolean', booleanValue: true, section: 'Vision Legacy' },
  { questionId: 'B96', questionType: 'boolean', booleanValue: false, section: 'Vision Legacy' },
  { questionId: 'B97', questionType: 'boolean', booleanValue: false, section: 'Vision Legacy' },
  { questionId: 'B98', questionType: 'boolean', booleanValue: false, section: 'Vision Legacy' },
  { questionId: 'B99', questionType: 'boolean', booleanValue: false, section: 'Vision Legacy' },
  { questionId: 'B100', questionType: 'boolean', booleanValue: true, section: 'Vision Legacy' },
];

async function importResponses() {
  console.log('Starting import of Digital Twin questionnaire responses...');
  console.log('Total responses to import:', responses.length);
  
  const userId = 1;
  let successCount = 0;
  let errorCount = 0;

  for (const response of responses) {
    try {
      const existing = await db.select()
        .from(questionnaireResponses)
        .where(and(
          eq(questionnaireResponses.userId, userId),
          eq(questionnaireResponses.questionId, response.questionId)
        ))
        .limit(1);

      if (existing.length > 0) {
        await db.update(questionnaireResponses)
          .set({
            scaleValue: response.scaleValue || null,
            booleanValue: response.booleanValue ?? null,
            section: response.section,
          })
          .where(eq(questionnaireResponses.id, existing[0].id));
        console.log('Updated:', response.questionId);
      } else {
        await db.insert(questionnaireResponses).values({
          userId,
          questionId: response.questionId,
          questionType: response.questionType,
          scaleValue: response.scaleValue || null,
          booleanValue: response.booleanValue ?? null,
          section: response.section,
        });
        console.log('Inserted:', response.questionId);
      }
      successCount++;
    } catch (error: any) {
      console.error('Error importing', response.questionId + ':', error.message);
      errorCount++;
    }
  }

  console.log('\nImport complete!');
  console.log('Success:', successCount);
  console.log('Errors:', errorCount);
  
  console.log('\nCalculating Digital Twin profile...');
  
  const profileData = {
    userId,
    measurementDriven: 9,
    processStandardization: 7,
    automationPreference: 9,
    ambiguityTolerance: 4,
    techAdoptionSpeed: 10,
    aiBeliefLevel: 10,
    dataVsIntuition: 10,
    buildVsBuy: 'build' as const,
    nicheVsMass: 9,
    firstMoverVsFollower: 8,
    organicVsMA: 'organic' as const,
    structurePreference: 9,
    interruptionTolerance: 3,
    batchingPreference: 9,
    pivotComfort: 4,
    trendLeadership: 8,
    portfolioDiversification: 3,
    cosUnderstandingLevel: 50,
    questionnaireCompletion: 100,
  };

  try {
    const existingProfile = await db.select()
      .from(digitalTwinProfile)
      .where(eq(digitalTwinProfile.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      await db.update(digitalTwinProfile)
        .set({
          ...profileData,
          lastCalculated: new Date(),
        })
        .where(eq(digitalTwinProfile.id, existingProfile[0].id));
      console.log('Updated Digital Twin profile');
    } else {
      await db.insert(digitalTwinProfile).values({
        ...profileData,
        lastCalculated: new Date(),
      });
      console.log('Created Digital Twin profile');
    }
  } catch (error: any) {
    console.error('Error updating profile:', error.message);
  }

  process.exit(0);
}

importResponses().catch(console.error);
