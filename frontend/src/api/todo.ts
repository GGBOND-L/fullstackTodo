import { request } from './request'

export interface TodoApiItem {
  id: number
  title: string
  completed: number | boolean
  created_at: string
}

export const getTodoListApi = () => {
  return request<TodoApiItem[]>({
    url: '/todos',
    method: 'GET',
  })
}

export const createTodoApi = (title: string) => {
  return request<TodoApiItem>({
    url: '/todos',
    method: 'POST',
    data: { title },
  })
}

export const updateTodoApi = (id: number, { title, completed }: { title: string; completed: boolean }) => {
  return request<null>({
    url: `/todos/${id}`,
    method: 'PUT',
    data: { completed, title },
  })
}

export const deleteTodoApi = (id: number) => {
  return request<null>({
    url: `/todos/${id}`,
    method: 'DELETE',
  })
}