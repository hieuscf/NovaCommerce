import type { ReturnRequest } from '../aggregates/return-request';

export interface IReturnRequestRepository {
  findById(id: string): Promise<ReturnRequest | null>;
  findActiveByOrderId(orderId: string): Promise<ReturnRequest | null>;
  save(returnRequest: ReturnRequest): Promise<void>;
}
