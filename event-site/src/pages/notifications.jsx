import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../database/firebaseConfig'
import Navbar from '../components/Navbar'
import './notifications.css'

const TABS = ['All', 'Tickets', 'Host', 'Reminders']

function Notifications() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) navigate('/login')
      else setUser(u)
    })
    return () => unsubscribe()
  }, [])

  const notifications = [
    {
      id: 1,
      type: 'ticket',
      icon: '🎟',
      title: 'Ticket confirmed',
      body: 'Your ticket is ready. Show the QR code at the entrance.',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'reminder',
      icon: '🔔',
      title: 'Event tomorrow',
      body: 'Don\'t forget! Your event starts tomorrow. Check your tickets.',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'host',
      icon: '📊',
      title: 'Your event hit 90% capacity',
      body: 'Consider enabling a waitlist for remaining ticket types.',
      time: '3 hours ago',
      unread: false
    },
    {
      id: 4,
      type: 'ticket',
      icon: '✅',
      title: 'Waitlist spot available',
      body: 'A ticket you were waiting for is now available. You have 30 minutes to claim it.',
      time: 'Yesterday',
      unread: false
    },
  ]

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => n.type === activeTab.toLowerCase())

  return (
    <div>
      <Navbar />
      <div className="notif-page">
        <div className="notif-header">
          <h1 className="notif-title">Notifications</h1>
        </div>

        <div className="notif-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`notif-tab ${activeTab === tab ? 'notif-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="notif-list">
          {filtered.length === 0 ? (
            <p className="notif-empty">No notifications</p>
          ) : (
            filtered.map(notif => (
              <div
                key={notif.id}
                className={`notif-item ${notif.unread ? 'notif-unread' : ''}`}
              >
                <div className={`notif-icon ni-${notif.type}`}>
                  {notif.icon}
                </div>
                <div className="notif-content">
                  <p className="notif-item-title">{notif.title}</p>
                  <p className="notif-item-body">{notif.body}</p>
                  <p className="notif-item-time">{notif.time}</p>
                </div>
                {notif.unread && <div className="notif-dot"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
