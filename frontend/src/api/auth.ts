import request from './request'

export const login = (data: { username: string; password: string }) =>
  request.post('/auth/login', data)

export const getUserInfo = () =>
  request.get('/auth/info')

export const logout = () =>
  request.post('/auth/logout')
