import React, { useEffect, useState } from 'react'
import { Checkbox, Modal, Form, Input, Button } from 'antd'
import type { CheckboxProps, FormProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import axios from 'axios'

type TodoFilter = 'all' | 'pending' | 'completed'

interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
}

interface TodoApiItem {
  id: number
  title: string
  completed: number | boolean
  created_at: string
}

interface TodoApiResponse<T> {
  code: number
  message: string
  data: T
}

interface FilterOption {
  key: TodoFilter
  label: string
}

interface WorkbenchPanelProps {
  currentFilter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
  totalCount: number
  completedCount: number
  pendingCount: number
  completionRate: number
}

interface TodoItemProps {
  todo: Todo
  onDelete: (id: number) => void
  onRefresh: () => void
  onComplete: (id: number, completed: boolean) => void
}

type FieldType = {
  title?: string
}

const API_BASE_URL = 'http://localhost:3000/api'

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: '全部任务' },
  { key: 'pending', label: '未完成' },
  { key: 'completed', label: '已完成' },
]

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
  padding: '20px',
}

const statCardStyle: React.CSSProperties = {
  background: '#f8fafc',
  borderRadius: '14px',
  padding: '14px',
  border: '1px solid #e5e7eb',
}

const filterButtonStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  borderRadius: '12px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#e5e7eb',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
}

const activeFilterButtonStyle: React.CSSProperties = {
  ...filterButtonStyle,
  background: '#eff6ff',
  borderColor: '#bfdbfe',
  color: '#1d4ed8',
  fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '42px',
  border: '1px solid #d1d5db',
  borderRadius: '10px',
  padding: '0 12px',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
}

const primaryButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '10px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '14px',
  background: '#1677ff',
  color: '#fff',
}

const defaultButtonStyle: React.CSSProperties = {
  borderRadius: '10px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '14px',
  background: '#fff',
  color: '#374151',
  border: '1px solid #d1d5db',
}

const dangerButtonStyle: React.CSSProperties = {
  borderRadius: '10px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '14px',
  background: '#fff1f0',
  color: '#cf1322',
  border: '1px solid #ffccc7',
}

const statusTagBaseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 600,
}

const pendingStatusTagStyle: React.CSSProperties = {
  ...statusTagBaseStyle,
  background: '#fff7ed',
  color: '#b45309',
}

const completedStatusTagStyle: React.CSSProperties = {
  ...statusTagBaseStyle,
  background: '#ecfdf3',
  color: '#027a48',
}

const mapTodoFromApi = (item: TodoApiItem): Todo => {
  return {
    id: item.id,
    title: item.title,
    completed: Boolean(item.completed),
    createdAt: item.created_at,
  }
}

const WorkbenchPanel: React.FC<WorkbenchPanelProps> = ({
  currentFilter,
  onFilterChange,
  totalCount,
  completedCount,
  pendingCount,
  completionRate,
}) => {
  const user = useAuthStore((state) => state.user)

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '18px' }}>
        工作台
      </h2>
      <div style={{ color: '#6b7280', fontSize: '14px' }}>认真对待每一天</div>

      <div
        style={{
          marginTop: '18px',
          padding: '14px',
          background: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '6px' }}>当前用户</div>
        <div style={{ fontSize: '14px', color: '#374151' }}>
          {user?.username ?? '--'}
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          {user?.email ?? '--'}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginTop: '20px',
        }}
      >
        <div style={statCardStyle}>
          <div
            style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}
          >
            {totalCount}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>全部任务</div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}
          >
            {completedCount}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>已完成</div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}
          >
            {pendingCount}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>未完成</div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}
          >
            {completionRate}%
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>完成率</div>
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            style={
              option.key === currentFilter
                ? activeFilterButtonStyle
                : filterButtonStyle
            }
            onClick={() => onFilterChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onDelete,
  onRefresh,
  onComplete,
}) => {
  const { id, title, completed, createdAt } = todo

  const handleDeleteClick = () => {
    onDelete(id)
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm<FieldType>()

  const showEditModal = () => {
    // 打开弹窗时回填
    console.log('showEditModal form:', form)
    form.setFieldsValue({
      title: title,
    })
    setIsModalOpen(true)
  }

  const handleConfirmEdit = async () => {
    // TODO: 后续把编辑逻辑抽离出来放在父组件里
    try {
      const values = await form.validateFields()
      console.log('handleConfirmEdit validateFields values:', values)

      const result = await axios.put(`/api/todos/${id}`, {
        title: values.title?.trim(),
        completed,
      })

      if (result.data.code !== 0) {
        alert(result.data.message || '修改失败')
        return
      }

      setIsModalOpen(false)
      form.resetFields()
      onRefresh()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('update request error:', error)
        alert('修改失败，请检查后端服务是否正常')
      }
    }
  }

  const handleCheckboxChange: CheckboxProps['onChange'] = (e) => {
    console.log(`checked = ${e.target.checked}`)
    onComplete(id, e.target.checked)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '14px 16px',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: 0,
          flex: 1,
        }}
      >
        <Checkbox onChange={handleCheckboxChange} checked={completed} />

        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: completed ? '#9ca3af' : '#111827',
              textDecoration: completed ? 'line-through' : 'none',
              wordBreak: 'break-word',
            }}
          >
            {title}
          </p>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#9ca3af' }}>
            创建于 {createdAt}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
          alignItems: 'center',
        }}
      >
        <span
          style={completed ? completedStatusTagStyle : pendingStatusTagStyle}
        >
          {completed ? '已完成' : '未完成'}
        </span>
        <button
          type="button"
          style={defaultButtonStyle}
          onClick={showEditModal}
        >
          编辑
        </button>
        <button
          type="button"
          style={dangerButtonStyle}
          onClick={handleDeleteClick}
        >
          删除
        </button>
      </div>
      <Modal
        title="Basic Modal"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleConfirmEdit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="待办事项"
            name="title"
            rules={[{ required: true, message: '请输入待办事项!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

const TodoPage: React.FC = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const [todos, setTodos] = useState<Todo[]>([])
  const [currentFilter, setCurrentFilter] = useState<TodoFilter>('all')
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const filteredTodos = todos.filter((todo) => {
    if (currentFilter === 'pending') {
      return !todo.completed
    }

    if (currentFilter === 'completed') {
      return todo.completed
    }

    return true
  })

  const totalCount = todos.length
  const completedCount = todos.filter((todo) => todo.completed).length
  const pendingCount = totalCount - completedCount
  const completionRate =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  const fetchTodoList = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`${API_BASE_URL}/todos`)
      console.log('fetchTodoList response:', response)
      const result: TodoApiResponse<TodoApiItem[]> = await response.json()

      if (result.code !== 0) {
        alert(result.message || '获取列表失败')
        return
      }

      const mappedTodos = result.data.map(mapTodoFromApi)
      setTodos(mappedTodos)
    } catch (error) {
      console.error('fetchTodoList error:', error)
      alert('获取列表失败，请检查后端服务是否正常')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodoList()
  }, [])

  const handleNewTodoTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewTodoTitle(event.target.value)
  }

  const handleAddTodo = async () => {
    const trimmedTitle = newTodoTitle.trim()

    if (!trimmedTitle) {
      return
    }

    try {
      setIsLoading(true)

      // const response = await fetch(`${API_BASE_URL}/todos`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     title: trimmedTitle,
      //   }),
      // })

      // const result: TodoApiResponse<TodoApiItem> = await response.json()
      const result = await axios.post(`/api/todos`, {
        title: trimmedTitle,
      })

      console.log('handleAddTodo result:', result)

      if (result.data.code !== 0) {
        alert(result.data.message || '新增失败')
        return
      }

      setNewTodoTitle('')
      await fetchTodoList()
    } catch (error) {
      console.error('handleAddTodo error:', error)
      alert('新增失败，请检查后端服务是否正常')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      setIsLoading(true)

      // const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      //   method: 'DELETE',
      // })

      // const result: TodoApiResponse<null> = await response.json()
      const result = await axios.delete(`/api/todos/${id}`)

      if (result.data.code !== 0) {
        alert(result.data.message || '删除失败')
        return
      }

      await fetchTodoList()
    } catch (error) {
      console.error('handleDeleteTodo error:', error)
      alert('删除失败，请检查后端服务是否正常')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteTodo = async (id: number, completed: boolean) => {
    try {
      setIsLoading(true)
      const result = await axios.put(`/api/todos/${id}/completed`, {
        completed,
      })

      if (result.data.code !== 0) {
        alert(result.data.message || '更新失败')
        return
      }

      await fetchTodoList()
    } catch (error) {
      console.error('handleCompleteTodo error:', error)
      alert('更新失败，请检查后端服务是否正常')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div
      style={{
        padding: '32px 16px',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f5f7fb',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '24px',
        }}
      >
        <div>
          <WorkbenchPanel
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            totalCount={totalCount}
            completedCount={completedCount}
            pendingCount={pendingCount}
            completionRate={completionRate}
          />
        </div>

        <div style={cardStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 style={{ margin: 0, marginBottom: '8px', fontSize: '18px' }}>
                我的待办
              </h2>
            </div>
            <button
              type="button"
              style={defaultButtonStyle}
              onClick={handleLogout}
            >
              退出登录
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <input
              value={newTodoTitle}
              onChange={handleNewTodoTitleChange}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="输入新的待办事项，例如：完成登录接口联调"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleAddTodo}
              style={primaryButtonStyle}
              disabled={isLoading}
            >
              新增任务
            </button>
          </div>

          {isLoading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 24px',
                color: '#6b7280',
              }}
            >
              加载中...
            </div>
          ) : filteredTodos.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onDelete={handleDeleteTodo}
                  onRefresh={fetchTodoList}
                  onComplete={handleCompleteTodo}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                marginTop: '20px',
                textAlign: 'center',
                padding: '48px 24px',
                color: '#6b7280',
                border: '1px dashed #d1d5db',
                borderRadius: '16px',
                background: '#fafafa',
              }}
            >
              当前筛选条件下暂无待办事项。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TodoPage
