import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/register'
import Login from './pages/login'
import HomePage from './pages/home'
import HomePageForMobile from './pages/homemobile'
import TicketHistory from './pages/ticketHistory'
import Waitlist from './pages/waitlist'
import EventDetail from './pages/eventDetail'
import Search from './pages/search'
import NotFound from './pages/notFound'
import Notifications from './pages/notifications'

import Dashboard from './pages/host/dashboard'
import CreateEvent from './pages/host/createEvent'
import EditEvent from './pages/host/editEvent'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/host/edit/:id" element={<EditEvent />} />
        <Route path="/host/create" element={<CreateEvent />} />
        <Route path="/home-mobile" element={<HomePageForMobile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/my-tickets" element={<TicketHistory />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/host/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App