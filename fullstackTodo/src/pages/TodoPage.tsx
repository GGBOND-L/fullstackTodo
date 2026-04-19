import React from 'react'
import { Checkbox } from 'antd'
import type { CheckboxProps } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
  padding: '20px',
}

const statItemStyle: React.CSSProperties = {
  background: '#f8fafc',
  borderRadius: '14px',
  padding: '14px',
  border: '1px solid #e5e7eb',
}

const filterBtnStyle: React.CSSProperties = {
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

const activeFilterBtnStyle: React.CSSProperties = {
  ...filterBtnStyle,
  background: '#eff6ff',
  borderColor: '#bfdbfe', // 不冲突了
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

const primaryBtnStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '10px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '14px',
  background: '#1677ff',
  color: '#fff',
}

const defaultBtnStyle: React.CSSProperties = {
  borderRadius: '10px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '14px',
  background: '#fff',
  color: '#374151',
  border: '1px solid #d1d5db',
}

const dangerBtnStyle: React.CSSProperties = {
  borderRadius: '10px',
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '14px',
  background: '#fff1f0',
  color: '#cf1322',
  border: '1px solid #ffccc7',
}

const tagBaseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 600,
}

const pendingTagStyle: React.CSSProperties = {
  ...tagBaseStyle,
  background: '#fff7ed',
  color: '#b45309',
}

const doneTagStyle: React.CSSProperties = {
  ...tagBaseStyle,
  background: '#ecfdf3',
  color: '#027a48',
}

type FilterType = 'all' | 'pending' | 'completed'

interface WorkBenchPageProps {
  filterStatus: FilterType
  onFilterChange: (filterStatus: FilterType) => void
}

const WorkBenchPage: React.FC<WorkBenchPageProps> = ({
  filterStatus,
  onFilterChange,
}) => {
  const user = useAuthStore((state) => state.user)

  const filters = [
    { key: 'all', label: '全部任务' },
    { key: 'pending', label: '未完成' },
    { key: 'completed', label: '已完成' },
  ]

  const handleChangeFilter = (filterStatus: FilterType) => {
    console.log('filterStatus', filterStatus)
    onFilterChange(filterStatus)
  }

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
          {user?.username}
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          {user?.email}
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
        <div style={statItemStyle}>
          <div
            style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}
          >
            8
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>全部任务</div>
        </div>

        <div style={statItemStyle}>
          <div
            style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}
          >
            3
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>已完成</div>
        </div>

        <div style={statItemStyle}>
          <div
            style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}
          >
            5
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>未完成</div>
        </div>

        <div style={statItemStyle}>
          <div
            style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}
          >
            37%
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
        {filters.map((item) => (
          <div
            key={item.key}
            style={{
              ...tagBaseStyle,
              ...(item.key === filterStatus
                ? activeFilterBtnStyle
                : filterBtnStyle),
            }}
            onClick={() => handleChangeFilter(item.key as FilterType)}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

const TodoItem: React.FC<{
  id: number
  title: string
  completed?: boolean
  createdAt: string
  onTrigger?: (id: number, completed: boolean) => void
  onDeleteTodo?: (id: number) => void
}> = ({ id, title, completed = false, createdAt, onTrigger, onDeleteTodo }) => {
  const onChange: CheckboxProps['onChange'] = (e) => {
    console.log(`${id} checked = ${e.target.checked}`)
    onTrigger?.(id, e.target.checked)
  }
  const onDelete = () => {
    console.log('onDelete', id)
    onDeleteTodo?.(id)
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
        <Checkbox onChange={onChange} checked={completed}></Checkbox>

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
        <span style={completed ? doneTagStyle : pendingTagStyle}>
          {completed ? '已完成' : '未完成'}
        </span>
        <button style={defaultBtnStyle}>编辑</button>
        <button style={dangerBtnStyle} onClick={onDelete}>
          删除
        </button>
      </div>
    </div>
  )
}

const TodoPage: React.FC = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const mockTodos = [
    {
      id: 1,
      title: '完成 React 项目初始化111',
      completed: false,
      createdAt: '2026-04-04 10:20',
    },
    {
      id: 2,
      title: '完成登录页静态页面2222',
      completed: true,
      createdAt: '2026-04-04 09:40',
    },
    {
      id: 3,
      title: '完成登录页静态页面333',
      completed: false,
      createdAt: '2026-04-04 09:40',
    },
  ]
  const [todos, setTodos] = useState(mockTodos)
  const [filterStatus, setFilter] = useState<FilterType>('all')

  // 过滤状态
  const filteredTodos = todos.filter((todo) => {
    if (filterStatus === 'pending') {
      return !todo.completed
    }

    if (filterStatus === 'completed') {
      return todo.completed
    }

    return true
  })

  // 新增
  const [value, setValue] = useState('')
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleChange', e.target.value)
    setValue(e.target.value)
  }
  const handleAddTodo = () => {
    const newTodo = {
      id: Date.now(),
      title: value,
      completed: false,
      createdAt: new Date().toLocaleString(),
    }
    setTodos([...todos, newTodo])
    setValue('')
  }
  // 改变状态
  const handleToggleTodo = (id: number, completed: boolean) => {
    console.log('handleToggleTodo', id, completed)
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed }
      }
      return todo
    })
    setTodos(newTodos)
  }
  // 删除
  const handleDeleteTodo = (id: number) => {
    console.log('handleDeleteTodo', id)
    const newTodos = todos.filter((todo) => todo.id !== id)
    setTodos(newTodos)
  }

  // 退出登录
  const handleLogout = () => {
    console.log('logout')
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
          <WorkBenchPage
            filterStatus={filterStatus}
            onFilterChange={setFilter}
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
            <button style={defaultBtnStyle} onClick={handleLogout}>
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
              value={value}
              onChange={handleChange}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="输入新的待办事项，例如：完成登录接口联调"
            />
            <button onClick={handleAddTodo} style={primaryBtnStyle}>
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
                  {...todo}
                  onTrigger={handleToggleTodo}
                  onDeleteTodo={handleDeleteTodo}
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
            空状态参考：暂无待办事项，点击上方输入框添加第一条任务。
          </div>
        </div>
      </div>
    </div>
  )
}

export default TodoPage
