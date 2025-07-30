// services/aiService.js
const AiCache = require('../Models/aicache');

const CACHE_HOURS = 24;

async function handleAIWithCache({ userId, requestType, prompt, callGemini }) {
  const now = new Date();
  const cache = await AiCache.findOne({ userId, requestType });

  const isExpired =
    !cache || (now - new Date(cache.lastFetched)) / 36e5 > CACHE_HOURS;

  if (!isExpired && cache.status === 200) {
    return {
      fromCache: true,
      fallback: false,
      data: cache.responseData,
    };
  }

  try {
    const aiResponse = await callGemini(prompt);

    await AiCache.findOneAndUpdate(
      { userId, requestType },
      {
        responseData: aiResponse,
        status: 200,
        lastFetched: now,
        userId,
        requestType,
      },
      { upsert: true }
    );

    return { fromCache: false, fallback: false, data: aiResponse };
  } catch (err) {
    // Fallback with background retry
    if (cache?.responseData) {
      setTimeout(async () => {
        try {
          const retryResponse = await callGemini(prompt);
          await AiCache.findOneAndUpdate(
            { userId, requestType },
            {
              responseData: retryResponse,
              status: 200,
              lastFetched: new Date(),
            }
          );
          console.log(`[RETRY SUCCESS] ${userId}-${requestType}`);
        } catch (retryErr) {
          console.error('[RETRY FAILED]', retryErr.message);
        }
      }, 0);

      return {
        fromCache: true,
        fallback: true,
        data: cache.responseData,
      };
    }

    throw new Error('Gemini failed and no cache available');
  }
}

module.exports = { handleAIWithCache };
