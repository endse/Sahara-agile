import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JobQueueService } from '../../src/services/jobQueueService';

describe('JobQueueService & Dead Letter Queue (DLQ)', () => {
  let queue: JobQueueService;

  beforeEach(() => {
    queue = new JobQueueService();
    queue.stopWorker(); // Manual control over worker steps during unit testing
  });

  afterEach(() => {
    queue.stopWorker();
  });

  describe('Exponential Backoff Calculation', () => {
    it('calculates exponential backoff delay correctly (1.0s, 2.0s, 4.0s)', () => {
      expect(queue.calculateBackoffDelay(0, 1000, 2)).toBe(1000);
      expect(queue.calculateBackoffDelay(1, 1000, 2)).toBe(2000);
      expect(queue.calculateBackoffDelay(2, 1000, 2)).toBe(4000);
      expect(queue.calculateBackoffDelay(3, 1000, 2)).toBe(8000);
    });
  });

  describe('Job Enqueueing & Successful Execution', () => {
    it('enqueues job in waiting state and processes it to completed', async () => {
      const job = queue.addJob('test_job', { foo: 'bar' });
      expect(job.state).toBe('waiting');

      await queue.processNextJob();

      const processed = queue.getJob(job.id);
      expect(processed?.state).toBe('completed');
      expect(processed?.progress).toBe(100);
      expect(processed?.result).toBeDefined();
    });
  });

  describe('Simulated Failure, Exponential Backoff & DLQ Routing', () => {
    it('retries failed jobs until max attempts, then routes to Dead Letter Queue (DLQ)', async () => {
      // Add job with 2 max attempts and simulated failure
      const job = queue.addJob('failing_job', { test: 123 }, { attempts: 2, backoffBaseMs: 10, shouldFailSimulated: true });

      // Attempt 1: Fails -> moves to 'failed' with retry scheduled
      await queue.processNextJob();
      let current = queue.getJob(job.id);
      expect(current?.state).toBe('failed');
      expect(current?.retryCount).toBe(1);

      // Wait for backoff delay to elapse
      await new Promise((r) => setTimeout(r, 20));

      // Attempt 2: Exceeds max attempts (2) -> moves to DLQ
      await queue.processNextJob();
      
      const dlqList = queue.getDlqJobs();
      expect(dlqList).toHaveLength(1);
      expect(dlqList[0].id).toBe(job.id);
      expect(dlqList[0].state).toBe('dlq');
      expect(dlqList[0].failedReason).toContain('DLQ ROUTE');
    });

    it('allows manual re-queueing of failed jobs from DLQ back to active queue', async () => {
      const job = queue.addJob('dlq_test', {}, { attempts: 1, shouldFailSimulated: true });
      await queue.processNextJob(); // Fails & routes to DLQ immediately (attempts: 1)

      expect(queue.getDlqJobs()).toHaveLength(1);

      // Re-queue from DLQ
      const requeued = queue.retryDlqJob(job.id);
      expect(requeued).not.toBeNull();
      expect(requeued?.state).toBe('waiting');
      expect(requeued?.retryCount).toBe(0);
      expect(queue.getDlqJobs()).toHaveLength(0);
    });
  });
});
