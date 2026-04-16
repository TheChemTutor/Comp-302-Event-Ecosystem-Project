import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/register'
import Login from './pages/Login'
import Frame from './pages/home'
import HomePageForMobile from './pages/homemobile'
import TicketHistory from './pages/ticketHistory'
import Waitlist from './pages/waitlist'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Frame />} />
        <Route path="/home-mobile" element={<HomePageForMobile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-tickets" element={<TicketHistory />} />
        <Route path="/waitlist" element={<Waitlist />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App