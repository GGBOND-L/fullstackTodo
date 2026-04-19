import React, { useState } from 'react'
import { Checkbox } from 'antd'
import type { CheckboxProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

type TodoFilter = 'all' | 'pending' | 'completed'

interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
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
  onToggleCompleted: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: '全部任务' },
  { key: 'pending', label: '未完成' },
  { key: 'completed', label: '已完成' },
]

const MOCK_TODOS: Todo[] = [
  {
    id: 1,
    title: '完成 React 项目初始化',
    completed: false,
    createdAt: '2026-04-04 10:20',
  },
  {
    id: 2,
    title: '完成登录页静态页面',
    completed: true,
    createdAt: '2026-04-04 09:40',
  },
  {
    id: 3,
    title: '打通 Todo 本地交互逻辑',
    completed: false,
    createdAt: '2026-04-04 11:10',
  },
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
  onToggleCompleted,
  onDelete,
}) => {
  const { id, title, completed, createdAt } = todo

  const handleCheckboxChange: CheckboxProps['onChange'] = (event) => {
    onToggleCompleted(id, event.target.checked)
  }

  const handleDeleteClick = () => {
    onDelete(id)
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
        <span style={completed ? completedStatusTagStyle : pendingStatusTagStyle}>
          {completed ? '已完成' : '未完成'}
        </span>
        <button type="button" style={defaultButtonStyle}>
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
    </div>
  )
}

const TodoPage: React.FC = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const [todos, setTodos] = useState<Todo[]>(MOCK_TODOS)
  const [currentFilter, setCurrentFilter] = useState<TodoFilter>('all')
  const [newTodoTitle, setNewTodoTitle] = useState('')

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

  const handleNewTodoTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewTodoTitle(event.target.value)
  }

  const handleAddTodo = () => {
    const trimmedTitle = newTodoTitle.trim()

    if (!trimmedTitle) {
      return
    }

    const newTodo: Todo = {
      id: Date.now(),
      title: trimmedTitle,
      completed: false,
      createdAt: new Date().toLocaleString(),
    }

    setTodos((previousTodos) => [...previousTodos, newTodo])
    setNewTodoTitle('')
  }

  const handleToggleTodoCompleted = (id: number, completed: boolean) => {
    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === id ? { ...todo, completed } : todo
      )
    )
  }

  const handleDeleteTodo = (id: number) => {
    setTodos((previousTodos) =>
      previousTodos.filter((todo) => todo.id !== id)
    )
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
            <button type="button" style={defaultButtonStyle} onClick={handleLogout}>
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
            />
            <button type="button" onClick={handleAddTodo} style={primaryButtonStyle}>
              新增任务
            </button>
          </div>

          {filteredTodos.length > 0 ? (
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
                  onToggleCompleted={handleToggleTodoCompleted}
                  onDelete={handleDeleteTodo}
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