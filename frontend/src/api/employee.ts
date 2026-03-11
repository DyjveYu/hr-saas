import request from './request'

export interface Employee {
  id: number
  tenantId: number
  projectId?: number
  name: string
  idCard: string
  phone: string
  status: string
  emergencyContact?: string
  emergencyPhone?: string
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface EmployeeListParams {
  name?: string
  projectId?: number
  status?: string
  page?: number
  pageSize?: number
}

export const getEmployeeList = (params: EmployeeListParams) =>
  request.get('/employees', { params })

export const getEmployeeDetail = (id: number) =>
  request.get(`/employees/${id}`)

export const createEmployee = (data: Partial<Employee>) =>
  request.post('/employees', data)

export const updateEmployee = (id: number, data: Partial<Employee>) =>
  request.patch(`/employees/${id}`, data)

export const changeEmployeeStatus = (id: number, status: string) =>
  request.patch(`/employees/${id}/status`, { status })

export const deleteEmployee = (id: number) =>
  request.delete(`/employees/${id}`)

export const assignProject = (id: number, projectId: number) =>
  request.patch(`/employees/${id}/project`, { projectId })
