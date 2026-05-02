import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Auth
import Login from './pages/auth/login'
import Register from './pages/auth/register'

// Guest
import HomePage from './pages/guest/home'
import EventDetail from './pages/guest/eventDetail'
import Search from './pages/guest/search'
import TicketHistory from './pages/guest/ticketHistory'
import Waitlist from './pages/guest/waitlist'
import Notifications from './pages/guest/notifications'
import TicketDetail from './pages/guest/ticketDetail'

// Host
import Dashboard from './pages/host/dashboard'
import CreateEvent from './pages/host/createEvent'
import EditEvent from './pages/host/editEvent'
import Analytics from './pages/host/analytics'
import AttendeeList from './pages/host/attendeeList'
import Scanner from './pages/host/scanner'

// General
import NotFound from './pages/notFound'
import Cart from './pages/cart'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/my-tickets" element={<TicketHistory />} />
        <Route path="/ticket/:id" element={<TicketDetail />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/host/dashboard" element={<Dashboard />} />
        <Route path="/host/create" element={<CreateEvent />} />
        <Route path="/host/edit/:id" element={<EditEvent />} />
        <Route path="/host/analytics/:id" element={<Analytics />} />
        <Route path="/host/attendees/:id" element={<AttendeeList />} />
        <Route path="/host/scanner/:id" element={<Scanner />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App