import request from './request'

export interface Project {
  id: number
  tenantId: number
  name: string
  capacity?: number
  siteManager?: string
  siteManagerPhone?: string
  financeManager?: string
  financeManagerPhone?: string
  status: string
  qrCodeUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectListParams {
  name?: string
  status?: string
  page?: number
  pageSize?: number
}

export const getProjectList = (params: ProjectListParams) =>
  request.get('/projects', { params })

export const getProjectDetail = (id: number) =>
  request.get(`/projects/${id}`)

export const createProject = (data: Partial<Project>) =>
  request.post('/projects', data)

export const updateProject = (id: number, data: Partial<Project>) =>
  request.patch(`/projects/${id}`, data)

export const changeProjectStatus = (id: number, status: string) =>
  request.patch(`/projects/${id}/status`, { status })

export const deleteProject = (id: number) =>
  request.delete(`/projects/${id}`)
