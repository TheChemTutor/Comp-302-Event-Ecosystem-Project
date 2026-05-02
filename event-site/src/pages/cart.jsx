import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getCurrentUser } from '../services/auth'
import { registerForEvent } from '../services/tickets'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import './cart.css'

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, clearCart, cartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getItemTotal = (item) => {
    const size = item.isGroup ? item.groupSize : 1
    return (Number(item.price) || 0) * item.quantity * size
  }

  const handleCheckout = async () => {
    const user = getCurrentUser()
    if (!user) {
      navigate('/login')
      return
    }

    if (cartItems.length === 0) return

    setLoading(true)
    setError('')

    try {
      for (const item of cartItems) {
        for (let i = 0; i < item.quantity; i++) {
          await registerForEvent(
            item.eventId,
            user.uid,
            item.ticketType,
            Number(item.price) || 0,
            item.isGroup ? item.groupSize : 1
          )
        }
      }
      clearCart()
      navigate('/my-tickets')
    } catch (err) {
      if (err.message === 'CAPACITY_REACHED') {
        setError('One or more events in your cart is fully booked')
      } else if (err.message === 'MAX_TICKETS_REACHED') {
        setError('You have reached the maximum tickets for one of the events')
      } else {
        setError('Checkout failed. Please try again')
      }
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      Music: 'linear-gradient(135deg, #ff6b00, #ffb347)',
      Tech: 'linear-gradient(135deg, #ffd600, #ff6b00)',
      Sports: 'linear-gradient(135deg, #1a1200, #4a3800)',
      Food: 'linear-gradient(135deg, #854f0b, #ba7517)',
      Arts: 'linear-gradient(135deg, #3a1a00, #7a3a00)',
      Networking: 'linear-gradient(135deg, #0f4c75, #1b6ca8)',
    }
    return colors[category] || 'linear-gradient(135deg, #6b5200, #c4a882)'
  }

  return (
    <div>
      <Navbar />
      <div className="cart-page">
        <h1 className="cart-title">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <button className="cart-browse-btn" onClick={() => navigate('/')}>
              Browse events
            </button>
          </div>
        ) : (
          <div className="cart-body">
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <div
                    className="cart-item-thumb"
                    style={{ background: getCategoryColor(item.eventCategory) }}
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-event">{item.eventTitle}</p>
                    <p className="cart-item-meta">
                      {item.eventDate} · {item.eventVenue}
                    </p>
                    <p className="cart-item-ticket">
                      {item.ticketType}
                      {item.isGroup ? ` · Group of ${item.groupSize}` : ' · Individual'}
                      {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                    </p>
                  </div>
                  <div className="cart-item-right">
                    <p className="cart-item-price">
                      {getItemTotal(item) === 0 ? 'Free' : `P${getItemTotal(item)}`}
                    </p>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.eventId, item.ticketType)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2 className="cart-summary-title">Order summary</h2>

              {cartItems.map((item, index) => (
                <div key={index} className="cart-summary-row">
                  <span>{item.eventTitle} — {item.ticketType}</span>
                  <span>{getItemTotal(item) === 0 ? 'Free' : `P${getItemTotal(item)}`}</span>
                </div>
              ))}

              <div className="cart-summary-total">
                <span>Total</span>
                <span>{cartTotal === 0 ? 'Free' : `P${cartTotal}`}</span>
              </div>

              {error && <div className="cart-error">{error}</div>}

              <button
                className="cart-checkout-btn"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Confirm · ${cartTotal === 0 ? 'Free' : `P${cartTotal}`}`}
              </button>

              <button
                className="cart-clear-btn"
                onClick={clearCart}
              >
                Clear cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}