import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (event, ticketType, price, quantity, isGroup, groupSize) => {
    setCartItems(prev => {
      const existing = prev.find(
        item => item.eventId === event.id && item.ticketType === ticketType
      )
      if (existing) {
        return prev.map(item =>
          item.eventId === event.id && item.ticketType === ticketType
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.startDate,
        eventVenue: event.venue,
        eventCategory: event.category,
        ticketType,
        price,
        quantity,
        isGroup,
        groupSize,
      }]
    })
  }

  const removeFromCart = (eventId, ticketType) => {
    setCartItems(prev =>
      prev.filter(item => !(item.eventId === eventId && item.ticketType === ticketType))
    )
  }

  const clearCart = () => setCartItems([])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const cartTotal = cartItems.reduce((sum, item) => {
    const size = item.isGroup ? item.groupSize : 1
    return sum + (Number(item.price) || 0) * item.quantity * size
  }, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)