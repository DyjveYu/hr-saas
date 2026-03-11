import request from './request'

export interface RechargeOrder {
  id: number
  tenantId: number
  amount: number
  status: string
  transferVoucherUrl?: string
  remark?: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface RechargeListParams {
  status?: string
  tenantId?: number
  page?: number
  pageSize?: number
}

export const getRechargeList = (params: RechargeListParams) =>
  request.get('/recharge-orders', { params })

export const createRecharge = (data: { amount: number; transferVoucherUrl?: string; remark?: string }) =>
  request.post('/recharge-orders', data)

export const completeRecharge = (id: number) =>
  request.patch(`/recharge-orders/${id}/complete`)
