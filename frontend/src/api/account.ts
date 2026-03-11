import request from './request'

export interface Account {
  id: number
  tenantId: number
  balance: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: number
  tenantId: number
  type: string
  direction: string
  amount: number
  balanceAfter: number
  remark?: string
  createdAt: string
}

export interface TransactionListParams {
  type?: string
  direction?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export const getAccountBalance = () =>
  request.get('/account/balance')

export const changeAccountStatus = (status: string, tenantId?: number) =>
  request.patch('/account/status', { status, tenantId })

export const getTransactionList = (params: TransactionListParams) =>
  request.get('/transactions', { params })

export const getTransactionDetail = (id: number) =>
  request.get(`/transactions/${id}`)
