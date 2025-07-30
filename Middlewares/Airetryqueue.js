const retryQueue = [];
const MAX_RETRIES = 5;

function queueAIJob(fn, req, res, retries = 0) {
  retryQueue.push({ fn, req, res, retries });
}

async function processRetryQueue() {
  for (let i = retryQueue.length - 1; i >= 0; i--) {
    const job = retryQueue[i];
    try {
      await job.fn(job.req, job.res, true); // retry mode
      retryQueue.splice(i, 1); // remove on success
    } catch (err) {
      job.retries++;
      if (job.retries >= MAX_RETRIES) {
        console.error(`Max retries reached for job. Error:`, err.message);
        retryQueue.splice(i, 1);
      }
    }
  }
}

setInterval(processRetryQueue, 60 * 1000); // retry every 1 minute

module.exports = { queueAIJob };
