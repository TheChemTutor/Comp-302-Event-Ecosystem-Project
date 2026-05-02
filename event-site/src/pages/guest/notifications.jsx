import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthChange } from '../../services/auth'
import { getUserNotifications, markAsRead, markAllAsRead } from '../../services/notifications'
import Navbar from '../../components/Navbar'
import './notifications.css'

const TABS = ['All', 'Tickets', 'Waitlist', 'Reminders']

const ICONS = {
  ticket: '🎟',
  waitlist: '⏳',
  host: '📊',
  reminder: '🔔',
}

function Notifications() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All')
  const [notifications, setNotifications] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      setUser(u)
      await fetchNotifications(u.uid)
    })
    return () => unsubscribe()
  }, [])

  const fetchNotifications = async (userId) => {
    try {
      const data = await getUserNotifications(userId)
      setNotifications(data)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    if (!user) return
    try {
      await markAsRead(user.uid, notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    try {
      await markAllAsRead(user.uid)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const getRelativeTime = (createdAt) => {
    const now = new Date()
    const then = new Date(createdAt)
    const diff = Math.floor((now - then) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    if (diff < 172800) return 'Yesterday'
    return then.toLocaleDateString()
  }

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => {
        if (activeTab === 'Tickets') return n.type === 'ticket'
        if (activeTab === 'Waitlist') return n.type === 'waitlist'
        if (activeTab === 'Reminders') return n.type === 'reminder' || n.type === 'host'
        return true
      })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div>
      <Navbar />
      <div className="notif-page">
        <div className="notif-header">
          <h1 className="notif-title">Notifications</h1>
          {unreadCount > 0 && (
            <button className="notif-mark-all" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="notif-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`notif-tab ${activeTab === tab ? 'notif-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'All' && unreadCount > 0 && (
                <span className="notif-unread-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="notif-list">
          {loading ? (
            <p className="notif-empty">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="notif-empty">No notifications</p>
          ) : (
            filtered.map(notif => (
              <div
                key={notif.id}
                className={`notif-item ${!notif.read ? 'notif-unread' : ''}`}
                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              >
                <div className={`notif-icon ni-${notif.type}`}>
                  {ICONS[notif.type] || '🔔'}
                </div>
                <div className="notif-content">
                  <p className="notif-item-title">{notif.title}</p>
                  <p className="notif-item-body">{notif.body}</p>
                  <p className="notif-item-time">{getRelativeTime(notif.createdAt)}</p>
                </div>
                {!notif.read && <div className="notif-dot"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications