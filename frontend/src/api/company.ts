import request from './request'

export interface Company {
  id: number
  name: string
  shortName?: string
  status: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface CompanyListParams {
  name?: string
  status?: string
  page?: number
  pageSize?: number
}

export const getCompanyList = (params: CompanyListParams) =>
  request.get('/companies', { params })

export const getCompanyDetail = (id: number) =>
  request.get(`/companies/${id}`)

export const createCompany = (data: Partial<Company> & { adminUsername?: string; adminPassword?: string; adminRealName?: string; adminPhone?: string }) =>
  request.post('/companies', data)

export const updateCompany = (id: number, data: Partial<Company>) =>
  request.patch(`/companies/${id}`, data)

export const changeCompanyStatus = (id: number, status: string) =>
  request.patch(`/companies/${id}/status`, { status })
