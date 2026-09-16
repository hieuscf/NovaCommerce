import { getApiClient } from '@/lib/api/client';
import type { IOrderClient, OrderDto, OrderHistoryQuery, OrderListDto } from './types';

function toQueryString(query: OrderHistoryQuery = {}): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.pageSize !== undefined) {
    params.set('pageSize', String(query.pageSize));
  }
  if (query.status) {
    params.set('status', query.status);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function createGatewayOrderClient(): IOrderClient {
  return {
    getOrderHistory(query: OrderHistoryQuery = {}): Promise<OrderListDto> {
      return getApiClient().get<OrderListDto>(`/users/me/orders${toQueryString(query)}`);
    },

    getOrderById(orderId: string): Promise<OrderDto> {
      return getApiClient().get<OrderDto>(`/users/me/orders/${encodeURIComponent(orderId)}`);
    },
  };
}

export function createOrderClient(): IOrderClient {
  return createGatewayOrderClient();
}

export const orderClient: IOrderClient = createOrderClient();
