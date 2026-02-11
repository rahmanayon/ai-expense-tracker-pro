// backend/src/types/index.ts
// Comprehensive type definitions for the entire platform

// Core domain types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredCurrency: CurrencyCode;
  timezone: string;
  isEmailVerified: boolean;
  subscriptionPlan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  tenantId: string;
  categoryId: number;
  type: TransactionType;
  amount: Decimal;
  currency: CurrencyCode;
  description?: string;
  transactionDate: Date;
  receiptImageUrl?: string;
  isOcrProcessed: boolean;
  ocrConfidence?: number;
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  emoji: string;
  type: TransactionType;
  tenantId?: string;
  isDefault: boolean;
  color?: string;
  parentId?: number;
}

export interface Budget {
  id: string;
  userId: string;
  tenantId: string;
  categoryId: number;
  amount: Decimal;
  periodType: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  alertThreshold: number;
  isActive: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ResponseMeta;
  error?: ApiError;
}

export interface ResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  stack?: string; // Only in development
}

// Service interfaces
export interface ITransactionService {
  create(data: CreateTransactionDto): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByUser(userId: string, filters: TransactionFilters): Promise<PaginatedResult<Transaction>>;
  update(id: string, data: UpdateTransactionDto): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getMonthlySummary(userId: string, year: number, month: number): Promise<MonthlySummary>;
}

export interface IAnalyticsService {
  getDashboardData(userId: string, dateRange: DateRange): Promise<DashboardData>;
  getSpendingTrends(userId: string, period: TrendPeriod): Promise<TrendData[]>;
  getPredictions(userId: string): Promise<PredictionResult>;
  generateReport(userId: string, config: ReportConfig): Promise<Report>;
}

// DTOs with validation
export class CreateTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsDecimal({ decimal_digits: '2' })
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}

// Union types for state management
export type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Branded types for type safety
export type TransactionId = string & { __brand: 'TransactionId' };
export type UserId = string & { __brand: 'UserId' };
export type TenantId = string & { __brand: 'TenantId' };

// Helper functions for branded types
export const asTransactionId = (id: string): TransactionId => id as TransactionId;
export const asUserId = (id: string): UserId => id as UserId;
export const asTenantId = (id: string): TenantId => id as TenantId;