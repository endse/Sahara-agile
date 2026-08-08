import { generateMidnightProductivityReport, GeneratedReport } from './productivityReportService';

export type JobState = 'waiting' | 'active' | 'completed' | 'failed' | 'dlq';

export interface JobOptions {
  attempts: number; // max retry attempts (default: 3)
  backoffBaseMs: number; // base delay for exponential backoff (default: 1000ms)
  backoffFactor: number; // backoff multiplier (default: 2)
  shouldFailSimulated?: boolean; // toggle for testing retry & DLQ logic
}

export interface QueueJob<TData = any, TResult = any> {
  id: string;
  name: string;
  data: TData;
  opts: JobOptions;
  state: JobState;
  progress: number;
  failedReason?: string;
  retryCount: number;
  nextRetryAt?: string;
  result?: TResult;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  dlq: number;
  totalJobs: number;
  workerRunning: boolean;
}

export class JobQueueService {
  private jobs: Map<string, QueueJob> = new Map();
  private dlqJobs: Map<string, QueueJob> = new Map();
  private workerInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private latestReport: GeneratedReport | null = null;

  constructor() {
    // Seed an initial completed midnight report job
    const initialReport = generateMidnightProductivityReport();
    this.latestReport = initialReport;

    const initialJob: QueueJob = {
      id: 'JOB-INIT-001',
      name: 'midnight_productivity_report',
      data: { reportType: 'daily_summary', triggeredBy: 'system_cron' },
      opts: { attempts: 3, backoffBaseMs: 1000, backoffFactor: 2 },
      state: 'completed',
      progress: 100,
      retryCount: 0,
      result: initialReport,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    this.jobs.set(initialJob.id, initialJob);

    // Start background queue processing loop
    this.startWorker();
  }

  // Calculate exponential backoff delay: base * factor^(retryCount)
  public calculateBackoffDelay(retryCount: number, baseMs = 1000, factor = 2): number {
    return baseMs * Math.pow(factor, retryCount);
  }

  // Enqueue new job
  public addJob(
    name: string,
    data: any = {},
    customOpts: Partial<JobOptions> = {}
  ): QueueJob {
    const jobId = `JOB-${Date.now().toString().slice(-6)}`;
    const opts: JobOptions = {
      attempts: customOpts.attempts ?? 3,
      backoffBaseMs: customOpts.backoffBaseMs ?? 1000,
      backoffFactor: customOpts.backoffFactor ?? 2,
      shouldFailSimulated: customOpts.shouldFailSimulated ?? false,
    };

    const job: QueueJob = {
      id: jobId,
      name,
      data,
      opts,
      state: 'waiting',
      progress: 0,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    return job;
  }

  // Trigger Midnight Report Job specifically
  public triggerMidnightReportJob(shouldFailSimulated = false): QueueJob {
    return this.addJob(
      'midnight_productivity_report',
      {
        reportType: 'productivity_and_sprint_velocity',
        triggeredBy: 'midnight_cron',
        scheduledFor: new Date().toISOString().split('T')[0],
      },
      { attempts: 3, backoffBaseMs: 1000, backoffFactor: 2, shouldFailSimulated }
    );
  }

  // Get job by ID
  public getJob(id: string): QueueJob | undefined {
    return this.jobs.get(id) || this.dlqJobs.get(id);
  }

  // Get all jobs
  public getAllJobs(): QueueJob[] {
    return Array.from(this.jobs.values());
  }

  // Get DLQ jobs
  public getDlqJobs(): QueueJob[] {
    return Array.from(this.dlqJobs.values());
  }

  // Re-queue job from Dead Letter Queue
  public retryDlqJob(id: string): QueueJob | null {
    const dlqJob = this.dlqJobs.get(id);
    if (!dlqJob) return null;

    this.dlqJobs.delete(id);
    dlqJob.state = 'waiting';
    dlqJob.retryCount = 0;
    dlqJob.failedReason = undefined;
    dlqJob.nextRetryAt = undefined;
    dlqJob.progress = 10;
    dlqJob.updatedAt = new Date().toISOString();

    this.jobs.set(id, dlqJob);
    return dlqJob;
  }

  // Clear DLQ
  public clearDlq(): void {
    this.dlqJobs.clear();
  }

  // Queue Statistics
  public getStats(): QueueStats {
    const allJobs = Array.from(this.jobs.values());
    return {
      waiting: allJobs.filter((j) => j.state === 'waiting').length,
      active: allJobs.filter((j) => j.state === 'active').length,
      completed: allJobs.filter((j) => j.state === 'completed').length,
      failed: allJobs.filter((j) => j.state === 'failed').length,
      dlq: this.dlqJobs.size,
      totalJobs: this.jobs.size + this.dlqJobs.size,
      workerRunning: this.workerInterval !== null,
    };
  }

  public getLatestReport(): GeneratedReport | null {
    return this.latestReport;
  }

  // Worker Process Execution Loop
  private startWorker(): void {
    if (this.workerInterval) return;
    this.workerInterval = setInterval(() => {
      this.processNextJob();
    }, 1000);
  }

  public stopWorker(): void {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
  }

  public async processNextJob(): Promise<void> {
    if (this.isProcessing) return;

    // Find next waiting or ready-to-retry failed job
    const now = Date.now();
    const candidate = Array.from(this.jobs.values()).find((j) => {
      if (j.state === 'waiting') return true;
      if (j.state === 'failed' && j.nextRetryAt) {
        return new Date(j.nextRetryAt).getTime() <= now;
      }
      return false;
    });

    if (!candidate) return;

    this.isProcessing = true;
    candidate.state = 'active';
    candidate.progress = 25;
    candidate.updatedAt = new Date().toISOString();

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (candidate.opts.shouldFailSimulated) {
        throw new Error('Simulated SatCom Telemetry Dispatch Timeout (504 Gateway)');
      }

      // Execute report generator logic
      if (candidate.name === 'midnight_productivity_report') {
        candidate.progress = 75;
        const report = generateMidnightProductivityReport();
        this.latestReport = report;
        candidate.result = report;
      } else {
        candidate.result = { message: 'Job executed successfully', processedAt: new Date().toISOString() };
      }

      candidate.state = 'completed';
      candidate.progress = 100;
      candidate.completedAt = new Date().toISOString();
      candidate.updatedAt = new Date().toISOString();
    } catch (err: any) {
      const errorMsg = err?.message || 'Execution error encountered';
      candidate.retryCount += 1;
      candidate.failedReason = errorMsg;
      candidate.updatedAt = new Date().toISOString();

      if (candidate.retryCount < candidate.opts.attempts) {
        // Apply Exponential Backoff Retry
        const backoffMs = this.calculateBackoffDelay(
          candidate.retryCount,
          candidate.opts.backoffBaseMs,
          candidate.opts.backoffFactor
        );
        const nextRetryDate = new Date(Date.now() + backoffMs);

        candidate.state = 'failed';
        candidate.nextRetryAt = nextRetryDate.toISOString();
        candidate.progress = Math.min(20, candidate.progress);
      } else {
        // Move to Dead Letter Queue (DLQ)
        candidate.state = 'dlq';
        candidate.progress = 0;
        candidate.failedReason = `DLQ ROUTE: Exceeded max retry attempts (${candidate.opts.attempts}/${candidate.opts.attempts}). Error: ${errorMsg}`;

        this.jobs.delete(candidate.id);
        this.dlqJobs.set(candidate.id, candidate);
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

// Singleton export
export const globalJobQueue = new JobQueueService();
