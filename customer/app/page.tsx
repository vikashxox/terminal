'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coffee,
  CreditCard,
  FileText,
  Home,
  Info,
  Minus,
  PackageCheck,
  Plus,
  QrCode,
  Receipt,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react'

// --- TYPES ---
export type Item = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  veg?: boolean
  available: boolean
  addOnOptions?: { name: string; price: number }[]
}

export type CartLine = {
  item: Item
  quantity: number
  addOns: string[]
  note?: string
  lineTotal: number
}

export type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED'
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PENDING' | 'PARTIALLY_PAID' | 'FAILED'

export type CustomerOrder = {
  id: string
  table: string
  session: string
  time: string
  timestamp: number
  items: CartLine[]
  subtotal: number
  tax: number
  total: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: 'online' | 'counter'
  specialInstructions?: string
  estimatedTime: string
}

export type View = 'welcome' | 'menu' | 'cart' | 'checkout' | 'payment' | 'confirmed' | 'tracking' | 'orders'

// --- MOCK MENU DATA ---
const MENU_ITEMS: Item[] = [
  {
    id: 'chicken-burger',
    name: 'Chicken Burger',
    description: 'Grilled chicken patty, melted cheese, crisp lettuce & house sauce',
    price: 180,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
    veg: false,
    available: true,
    addOnOptions: [
      { name: 'Extra Cheese', price: 30 },
      { name: 'Extra Patty', price: 60 },
      { name: 'Extra Sauce', price: 20 },
    ],
  },
  {
    id: 'veg-burger',
    name: 'Veg Burger',
    description: 'Crispy vegetable patty, cheese & fresh greens with herb spread',
    price: 150,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85',
    veg: true,
    available: true,
    addOnOptions: [
      { name: 'Extra Cheese', price: 30 },
      { name: 'Extra Patty', price: 40 },
      { name: 'Extra Sauce', price: 20 },
    ],
  },
  {
    id: 'fries',
    name: 'French Fries',
    description: 'Golden, crisp and lightly seasoned with signature herb sea salt',
    price: 100,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85',
    veg: true,
    available: true,
    addOnOptions: [
      { name: 'Cheese Dip', price: 30 },
      { name: 'Peri-Peri Seasoning', price: 20 },
    ],
  },
  {
    id: 'cold-coffee',
    name: 'Cold Coffee',
    description: 'Smooth slow-brewed coffee, chilled rich milk & subtle sweetness',
    price: 120,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85',
    veg: true,
    available: true,
    addOnOptions: [
      { name: 'Vanilla Ice Cream', price: 40 },
      { name: 'Extra Espresso Shot', price: 30 },
    ],
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    description: 'Rich dark espresso with velvety textured steamed milk foam',
    price: 110,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=85',
    veg: true,
    available: false, // Currently unavailable demonstration
    addOnOptions: [
      { name: 'Extra Shot', price: 30 },
      { name: 'Oat Milk', price: 35 },
    ],
  },
  {
    id: 'latte',
    name: 'Latte',
    description: 'Mild espresso poured over steamed milk with a silky microfoam crown',
    price: 130,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=85',
    veg: true,
    available: true,
    addOnOptions: [
      { name: 'Caramel Drizzle', price: 25 },
      { name: 'Hazelnut Syrup', price: 25 },
    ],
  },
  {
    id: 'chocolate-cake',
    name: 'Chocolate Cake',
    description: 'Warm chocolate sponge layered with decadent dark ganache',
    price: 160,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85',
    veg: true,
    available: true,
    addOnOptions: [
      { name: 'Vanilla Ice Cream', price: 40 },
    ],
  },
  {
    id: 'chicken-pizza',
    name: 'Chicken Pizza',
    description: 'Roasted chicken, mozzarella, bell peppers and Mediterranean herbs',
    price: 280,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85',
    veg: false,
    available: true,
    addOnOptions: [
      { name: 'Extra Mozzarella', price: 40 },
      { name: 'Olives & Jalapeños', price: 30 },
    ],
  },
  {
    id: 'veg-pizza',
    name: 'Veg Pizza',
    description: 'Crisp bell peppers, sweet corn, mushrooms & melted mozzarella',
    price: 240,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
    veg: true,
    available: true,
    addOnOptions: [
      { name: 'Extra Mozzarella', price: 40 },
      { name: 'Garlic Crust', price: 30 },
    ],
  },
]

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Snacks', 'Coffee', 'Beverages', 'Desserts']

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'NEW', label: 'Order Received' },
  { status: 'ACCEPTED', label: 'Order Accepted' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'READY', label: 'Ready' },
  { status: 'SERVED', label: 'Served' },
  { status: 'COMPLETED', label: 'Completed' },
]

export const money = (n: number) => `₹${n.toLocaleString('en-IN')}`

function computeLineTotal(item: Item, quantity: number, addOnNames: string[]): number {
  const addOnsSum = addOnNames.reduce((sum, name) => {
    const opt = item.addOnOptions?.find((o) => o.name === name)
    return sum + (opt ? opt.price : 0)
  }, 0)
  return (item.price + addOnsSum) * quantity
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CustomerApp />
    </Suspense>
  )
}

function LoadingFallback() {
  return (
    <Shell>
      <div className="flex min-h-dvh flex-col items-center justify-center p-8 text-center">
        <div className="size-10 animate-spin rounded-full border-4 border-[#ead9ca] border-t-[#4a2d20]" />
        <p className="mt-4 text-sm font-semibold text-[#705b4f]">Loading Terminal 2...</p>
      </div>
    </Shell>
  )
}

function CustomerApp() {
  const searchParams = useSearchParams()
  const rawTableParam = searchParams?.get('table')

  // 1. PRESERVE TABLE CONTEXT - initialize synchronously where possible
  const [table, setTable] = useState<string>(() => {
    if (rawTableParam) {
      const clean = rawTableParam.replace(/^t/i, '')
      if (/^\d+$/.test(clean)) return clean
    }
    return '12'
  })
  const [isValidTable, setIsValidTable] = useState<boolean>(() => {
    if (rawTableParam) {
      const clean = rawTableParam.replace(/^t/i, '')
      return /^\d+$/.test(clean)
    }
    return true
  })

  useEffect(() => {
    if (rawTableParam) {
      const clean = rawTableParam.replace(/^t/i, '')
      if (/^\d+$/.test(clean)) {
        setTable(clean)
        setIsValidTable(true)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('t2_customer_table', clean)
        }
      } else {
        setIsValidTable(false)
      }
    } else if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('t2_customer_table')
      if (stored && /^\d+$/.test(stored)) {
        setTable(stored)
        setIsValidTable(true)
      }
    }
  }, [rawTableParam])

  // Keep table param active in browser URL throughout the entire journey
  useEffect(() => {
    if (typeof window !== 'undefined' && isValidTable && table) {
      const params = new URLSearchParams(window.location.search)
      if (params.get('table') !== table) {
        params.set('table', table)
        const newUrl = `${window.location.pathname}?${params.toString()}`
        window.history.replaceState(null, '', newUrl)
      }
    }
  }, [table, isValidTable])

  const sessionId = `#7825`

  // Customer navigation state
  const [view, setView] = useState<View>('welcome')
  const [category, setCategory] = useState<string>('All')
  const [query, setQuery] = useState<string>('')

  // Cart state
  const [cart, setCart] = useState<CartLine[]>([])

  // Item customization modal
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [itemQty, setItemQty] = useState<number>(1)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [itemNote, setItemNote] = useState<string>('')

  // Payment method on checkout
  const [paymentChoice, setPaymentChoice] = useState<'online' | 'counter'>('online')

  // Multiple Orders per Table Session
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)

  // Bill requested status
  const [billRequested, setBillRequested] = useState<boolean>(false)

  // Toast feedback
  const [toast, setToast] = useState<string>('')

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  // Cart totals
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0)
  const cartSubtotal = cart.reduce((sum, line) => sum + line.lineTotal, 0)
  const cartTax = Math.round(cartSubtotal * 0.05)
  const cartTotal = cartSubtotal + cartTax

  // Filtered menu
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesSearch = `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [category, query])

  // Cart actions
  function handleAddToCart(item: Item, quantity = 1, addOns: string[] = [], note = '') {
    if (!item.available) return

    setCart((current) => {
      const sortedAddOns = [...addOns].sort()
      const existingIndex = current.findIndex(
        (line) =>
          line.item.id === item.id &&
          line.note === note &&
          line.addOns.length === sortedAddOns.length &&
          line.addOns.slice().sort().every((v, i) => v === sortedAddOns[i])
      )

      if (existingIndex > -1) {
        return current.map((line, idx) => {
          if (idx !== existingIndex) return line
          const newQty = line.quantity + quantity
          return {
            ...line,
            quantity: newQty,
            lineTotal: computeLineTotal(line.item, newQty, line.addOns),
          }
        })
      }

      const lineTotal = computeLineTotal(item, quantity, sortedAddOns)
      return [...current, { item, quantity, addOns: sortedAddOns, note, lineTotal }]
    })

    showToast(`${item.name} added to cart`)
    setSelectedItem(null)
    setItemQty(1)
    setSelectedAddOns([])
    setItemNote('')
  }

  function handleChangeQty(index: number, delta: number) {
    setCart((current) =>
      current
        .map((line, idx) => {
          if (idx !== index) return line
          const newQty = line.quantity + delta
          if (newQty <= 0) return null
          return {
            ...line,
            quantity: newQty,
            lineTotal: computeLineTotal(line.item, newQty, line.addOns),
          }
        })
        .filter((l): l is CartLine => l !== null)
    )
  }

  function handleRemoveLine(index: number) {
    setCart((current) => current.filter((_, idx) => idx !== index))
    showToast('Item removed')
  }

  // Open item modal
  function handleOpenItem(item: Item) {
    setSelectedItem(item)
    setItemQty(1)
    setSelectedAddOns([])
    setItemNote('')
  }

  // Order placement (supports both Pay Now & Pay at Counter)
  function handlePlaceOrder(method: 'online' | 'counter') {
    if (cart.length === 0) return

    // Auto-generate order number starting at #1048
    let nextNum = 1048
    if (orders.length > 0) {
      const highestNum = Math.max(
        ...orders.map((o) => {
          const n = parseInt(o.id.replace('#', ''), 10)
          return isNaN(n) ? 1047 : n
        })
      )
      nextNum = Math.max(1048, highestNum + 1)
    }

    const now = new Date()
    const timeString = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

    const newOrder: CustomerOrder = {
      id: `#${nextNum}`,
      table,
      session: sessionId,
      time: timeString,
      timestamp: Date.now(),
      items: [...cart],
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      orderStatus: method === 'online' ? 'PREPARING' : 'NEW',
      paymentStatus: method === 'online' ? 'PAID' : 'UNPAID',
      paymentMethod: method,
      specialInstructions: cart.map((c) => c.note).filter(Boolean).join('; ') || undefined,
      estimatedTime: '15–20 min',
    }

    setOrders((prev) => [newOrder, ...prev])
    setActiveOrderId(newOrder.id)
    setCart([]) // Reset cart for subsequent orders
    setView('confirmed')
  }

  // Current active order for tracking
  const activeOrder = useMemo(() => {
    if (activeOrderId) {
      const found = orders.find((o) => o.id === activeOrderId)
      if (found) return found
    }
    return orders[0] || null
  }, [orders, activeOrderId])

  // Session totals (Total, Paid, Balance)
  const sessionTotal = orders.reduce((sum, o) => sum + o.total, 0)
  const sessionPaid = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0)
  const sessionBalance = Math.max(0, sessionTotal - sessionPaid)

  // Status simulation helper for demo testing all 6 order states
  function handleAdvanceOrderStatus(orderId: string) {
    setOrders((current) =>
      current.map((o) => {
        if (o.id !== orderId) return o
        const orderSteps: OrderStatus[] = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED']
        const currIdx = orderSteps.indexOf(o.orderStatus)
        const nextStatus = orderSteps[(currIdx + 1) % orderSteps.length]
        return { ...o, orderStatus: nextStatus }
      })
    )
    showToast(`Order status updated`)
  }

  // Demo helpers for testing
  function handleLoadDemoOrders() {
    const demoOrders: CustomerOrder[] = [
      {
        id: '#1050',
        table,
        session: sessionId,
        time: '7:55 PM',
        timestamp: Date.now() - 5 * 60 * 1000,
        items: [
          {
            item: MENU_ITEMS[1], // Veg Burger
            quantity: 1,
            addOns: ['Extra Cheese'],
            lineTotal: 180,
          },
          {
            item: MENU_ITEMS[3], // Cold Coffee
            quantity: 1,
            addOns: [],
            lineTotal: 120,
          },
        ],
        subtotal: 300,
        tax: 15,
        total: 315,
        orderStatus: 'NEW',
        paymentStatus: 'UNPAID',
        paymentMethod: 'counter',
        estimatedTime: '15–20 min',
      },
      {
        id: '#1049',
        table,
        session: sessionId,
        time: '7:48 PM',
        timestamp: Date.now() - 15 * 60 * 1000,
        items: [
          {
            item: MENU_ITEMS[7], // Chicken Pizza
            quantity: 1,
            addOns: ['Extra Mozzarella'],
            lineTotal: 320,
          },
          {
            item: MENU_ITEMS[2], // Fries
            quantity: 1,
            addOns: [],
            lineTotal: 100,
          },
        ],
        subtotal: 420,
        tax: 0,
        total: 420,
        orderStatus: 'SERVED',
        paymentStatus: 'UNPAID',
        paymentMethod: 'counter',
        estimatedTime: 'Served',
      },
      {
        id: '#1048',
        table,
        session: sessionId,
        time: '7:32 PM',
        timestamp: Date.now() - 30 * 60 * 1000,
        items: [
          {
            item: MENU_ITEMS[0], // Chicken Burger
            quantity: 1,
            addOns: ['Extra Cheese'],
            lineTotal: 210,
          },
          {
            item: MENU_ITEMS[3], // Cold Coffee
            quantity: 1,
            addOns: [],
            lineTotal: 120,
          },
        ],
        subtotal: 330,
        tax: 20,
        total: 350,
        orderStatus: 'PREPARING',
        paymentStatus: 'PAID',
        paymentMethod: 'online',
        estimatedTime: 'Ready in ~5 min',
      },
    ]
    setOrders(demoOrders)
    setActiveOrderId(demoOrders[0].id)
    showToast('Example table session loaded')
  }

  function handleClearOrders() {
    setOrders([])
    setActiveOrderId(null)
    setBillRequested(false)
    showToast('Session orders cleared')
  }

  // Invalid table QR screen
  if (!isValidTable) {
    return (
      <Shell>
        <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
          <div className="mb-6 grid size-20 place-items-center rounded-full bg-[#ead9ca] text-[#4a2d20]">
            <X size={34} />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#2c211b]">Invalid Table QR</h1>
          <p className="mt-3 text-[#77685f]">We couldn&apos;t identify your table from the scanned QR code.</p>
          <button
            className="primary-button mt-8"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.search = '?table=12'
              }
            }}
          >
            Use Table 12
          </button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      {/* 1. WELCOME SCREEN */}
      {view === 'welcome' && (
        <WelcomeView table={table} onStart={() => setView('menu')} />
      )}

      {/* 2. MENU SCREEN */}
      {view === 'menu' && (
        <>
          <CustomerHeader
            table={table}
            count={cartCount}
            onCart={() => setView('cart')}
          />
          <main className="px-5 pb-32 pt-5">
            <p className="eyebrow">Terminal 2 · Coimbatore</p>
            <h1 className="mt-1 font-serif text-[32px] leading-tight text-[#2c211b]">
              What would you like
              <br />
              to have today?
            </h1>

            {/* Search Input */}
            <div className="search-box mt-5">
              <Search size={18} className="text-[#a18d80]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food, coffee or desserts..."
                aria-label="Search food or drinks"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs font-semibold text-[#8a7263]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Navigation */}
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`category-chip ${category === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items Grid/List */}
            {filteredItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onOpen={() => handleOpenItem(item)}
                    onAdd={() => handleAddToCart(item, 1, [], '')}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search Results */
              <div className="rounded-3xl border border-[#eadfd5] bg-white p-8 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#f8f1ea] text-[#b17a5b]">
                  <Search size={24} />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold text-[#2c211b]">No items found</h3>
                <p className="mt-1 text-sm text-[#77685f]">Try another search or select a different category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setCategory('All')
                  }}
                  className="mt-5 rounded-xl border border-[#c99475] px-4 py-2 text-xs font-bold text-[#9a6245]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>

          {/* Floating Cart Bar if cart has items */}
          {cartCount > 0 && (
            <div className="floating-cart-bar">
              <div className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-[#df9b70] text-xs font-black text-[#38251e]">
                  {cartCount}
                </span>
                <div>
                  <p className="text-xs text-[#d9c2b2]">Cart Total</p>
                  <p className="text-sm font-bold text-[#fffaf4]">{money(cartTotal)}</p>
                </div>
              </div>
              <button onClick={() => setView('cart')} aria-label="View cart">
                View Cart <ArrowRight size={16} />
              </button>
            </div>
          )}

          <BottomNav
            active="menu"
            ordersCount={orders.length}
            onHome={() => setView('welcome')}
            onMenu={() => setView('menu')}
            onOrders={() => setView('orders')}
          />
        </>
      )}

      {/* 3. CART SCREEN */}
      {view === 'cart' && (
        <CartView
          table={table}
          cart={cart}
          subtotal={cartSubtotal}
          tax={cartTax}
          total={cartTotal}
          onBack={() => setView('menu')}
          onChangeQty={handleChangeQty}
          onRemoveLine={handleRemoveLine}
          onMore={() => setView('menu')}
          onCheckout={() => setView('checkout')}
        />
      )}

      {/* 4. CHECKOUT SCREEN */}
      {view === 'checkout' && (
        <CheckoutView
          table={table}
          cart={cart}
          subtotal={cartSubtotal}
          tax={cartTax}
          total={cartTotal}
          paymentChoice={paymentChoice}
          setPaymentChoice={setPaymentChoice}
          onBack={() => setView('cart')}
          onProceed={() => {
            if (paymentChoice === 'online') {
              setView('payment')
            } else {
              handlePlaceOrder('counter')
            }
          }}
        />
      )}

      {/* 5. MOCK PAYMENT SCREEN */}
      {view === 'payment' && (
        <PaymentView
          table={table}
          total={cartTotal}
          onBack={() => setView('checkout')}
          onSuccess={() => handlePlaceOrder('online')}
          onSwitchToCounter={() => handlePlaceOrder('counter')}
        />
      )}

      {/* 6. ORDER CONFIRMATION SCREEN */}
      {view === 'confirmed' && activeOrder && (
        <ConfirmedView
          table={table}
          order={activeOrder}
          onTrack={() => setView('tracking')}
          onOrders={() => setView('orders')}
          onMore={() => setView('menu')}
        />
      )}

      {/* 7. TRACKING SCREEN */}
      {view === 'tracking' && activeOrder && (
        <TrackingView
          table={table}
          order={activeOrder}
          onMore={() => setView('menu')}
          onViewOrders={() => setView('orders')}
          onAdvanceStatus={() => handleAdvanceOrderStatus(activeOrder.id)}
        />
      )}

      {/* 8. CUSTOMER ORDERS SCREEN */}
      {view === 'orders' && (
        <OrdersView
          table={table}
          sessionId={sessionId}
          orders={orders}
          sessionTotal={sessionTotal}
          sessionPaid={sessionPaid}
          sessionBalance={sessionBalance}
          billRequested={billRequested}
          onRequestBill={() => {
            setBillRequested(true)
            showToast('Bill request sent to staff')
          }}
          onBack={() => setView('menu')}
          onMore={() => setView('menu')}
          onTrackOrder={(orderId) => {
            setActiveOrderId(orderId)
            setView('tracking')
          }}
          onLoadDemo={handleLoadDemoOrders}
          onClearOrders={handleClearOrders}
        />
      )}

      {/* ITEM DETAILS / CUSTOMIZATION SHEET */}
      {selectedItem && (
        <ItemSheet
          item={selectedItem}
          qty={itemQty}
          setQty={setItemQty}
          addOns={selectedAddOns}
          setAddOns={setSelectedAddOns}
          note={itemNote}
          setNote={setItemNote}
          total={computeLineTotal(selectedItem, itemQty, selectedAddOns)}
          onClose={() => setSelectedItem(null)}
          onAdd={() => handleAddToCart(selectedItem, itemQty, selectedAddOns, itemNote)}
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Check size={16} /> {toast}
        </div>
      )}
    </Shell>
  )
}

// ==========================================
// SHELL WRAPPER (MOBILE ONLY 390px / 430px)
// ==========================================
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto min-h-dvh max-w-[430px] bg-[#f8f3ed] shadow-2xl selection:bg-[#df9b70] selection:text-[#38251e]">
      {children}
    </div>
  )
}

// ==========================================
// 1. WELCOME VIEW
// ==========================================
function WelcomeView({ table, onStart }: { table: string; onStart: () => void }) {
  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-hidden bg-[#38251e] p-7 text-[#fffaf4]">
      {/* Background Hero Image */}
      <img
        className="absolute inset-0 size-full object-cover opacity-50"
        src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=90"
        alt="Terminal 2 Cafe"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#241712]/40 via-[#241712]/30 to-[#241712]" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="brand-light">
            TERMINAL <span>2</span>
          </p>
          <p className="mt-1 text-xs tracking-[.2em] text-[#e8d4c3]">COIMBATORE, TAMIL NADU</p>
        </div>
        <div className="table-badge light">TABLE {table}</div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 pb-6 pt-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#e8d4c3]">
          <Sparkles size={16} className="text-[#df9b70]" /> Your table, your way
        </div>
        <h1 className="font-serif text-[50px] leading-[.98] tracking-tight">
          Welcome to
          <br />
          <em className="text-[#df9b70]">Terminal 2</em>
        </h1>
        <p className="mt-5 max-w-[290px] text-[16px] leading-relaxed text-[#eadbd0]">
          Order directly from Table {table}. Freshly crafted meals & artisanal coffee delivered right to you.
        </p>

        <button
          type="button"
          className="primary-button light mt-8 w-full shadow-lg"
          onClick={onStart}
        >
          View Menu <ArrowRight size={18} />
        </button>

        <p className="mt-4 text-center text-xs text-[#cdb9aa]">
          No login required · Table {table} session
        </p>
      </div>
    </main>
  )
}

// ==========================================
// HEADER COMPONENT
// ==========================================
function CustomerHeader({
  table,
  count,
  onCart,
}: {
  table: string
  count: number
  onCart: () => void
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#eadfd5]/80 bg-[#f8f3ed]/95 px-5 py-4 backdrop-blur-md">
      <div>
        <p className="brand">
          TERMINAL <span>2</span>
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="table-dot" />
          <span className="text-xs font-bold tracking-wider text-[#705b4f]">TABLE {table}</span>
        </div>
      </div>
      <button
        type="button"
        className="cart-button shadow-sm"
        onClick={onCart}
        aria-label={`Open cart with ${count} items`}
      >
        <ShoppingBag size={21} />
        {count > 0 && <span>{count}</span>}
      </button>
    </header>
  )
}

// ==========================================
// MENU CARD
// ==========================================
function MenuCard({
  item,
  onAdd,
  onOpen,
}: {
  item: Item
  onAdd: () => void
  onOpen: () => void
}) {
  return (
    <article
      className={`menu-card transition-all ${!item.available ? 'menu-card unavailable opacity-75' : ''}`}
    >
      <button
        type="button"
        className="block w-full text-left"
        onClick={onOpen}
      >
        <div className="relative">
          <img src={item.image} alt={item.name} className="h-[160px] w-full object-cover" />
          {!item.available && (
            <div className="absolute bottom-3 left-3">
              <span className="unavailable-tag">Currently unavailable</span>
            </div>
          )}
        </div>
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`food-dot ${item.veg ? 'veg' : ''}`} />
                <h2 className="font-semibold text-[#33251e]">{item.name}</h2>
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-[#88766b] line-clamp-2">
                {item.description}
              </p>
            </div>
            <span className="font-bold text-[#4a2d20]">{money(item.price)}</span>
          </div>
        </div>
      </button>

      <div className="px-4 pb-4">
        {item.available ? (
          <button
            type="button"
            className="add-button"
            onClick={onAdd}
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus size={16} /> Add
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="add-button disabled"
            aria-label={`${item.name} is unavailable`}
          >
            Unavailable
          </button>
        )}
      </div>
    </article>
  )
}

// ==========================================
// ITEM DETAILS / CUSTOMIZATION SHEET
// ==========================================
function ItemSheet({
  item,
  qty,
  setQty,
  addOns,
  setAddOns,
  note,
  setNote,
  total,
  onClose,
  onAdd,
}: {
  item: Item
  qty: number
  setQty: React.Dispatch<React.SetStateAction<number>>
  addOns: string[]
  setAddOns: React.Dispatch<React.SetStateAction<string[]>>
  note: string
  setNote: React.Dispatch<React.SetStateAction<string>>
  total: number
  onClose: () => void
  onAdd: () => void
}) {
  const options = item.addOnOptions || []

  return (
    <div className="sheet-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <section className="item-sheet" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="sheet-close shadow-md"
          onClick={onClose}
          aria-label="Close details"
        >
          <X size={18} />
        </button>

        <img src={item.image} alt={item.name} className="h-[210px] w-full object-cover" />

        <div className="p-5 pb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`food-dot ${item.veg ? 'veg' : ''}`} />
                <h2 className="font-serif text-2xl text-[#2c211b]">{item.name}</h2>
              </div>
              <p className="mt-2 text-sm text-[#77685f]">{item.description}</p>
            </div>
            <strong className="text-xl text-[#4a2d20]">{money(item.price)}</strong>
          </div>

          {/* Availability State */}
          {!item.available ? (
            <div className="mt-6 rounded-2xl border border-[#e2d5cb] bg-[#fbf4ee] p-5 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-full bg-[#eee0d6] text-[#8c563e]">
                <AlertCircle size={22} />
              </div>
              <h3 className="mt-3 font-semibold text-[#4a2d20]">Currently unavailable</h3>
              <p className="mt-1 text-xs text-[#827167]">
                This item is sold out for today. Please explore our other delicious selections.
              </p>
              <button
                type="button"
                className="primary-button mt-6 w-full opacity-60"
                disabled
              >
                Currently unavailable
              </button>
            </div>
          ) : (
            <>
              {/* Optional Add-ons */}
              {options.length > 0 && (
                <div className="mt-6">
                  <p className="section-label">OPTIONAL ADD-ONS</p>
                  <div className="mt-2 flex flex-col divide-y divide-[#eadfd5]">
                    {options.map((opt) => {
                      const checked = addOns.includes(opt.name)
                      return (
                        <label
                          key={opt.name}
                          className="addon-row cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setAddOns((prev) =>
                                prev.includes(opt.name)
                                  ? prev.filter((x) => x !== opt.name)
                                  : [...prev, opt.name]
                              )
                            }}
                          />
                          <span className="font-medium text-[#44352d]">{opt.name}</span>
                          <strong>+{money(opt.price)}</strong>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-6 flex items-center justify-between border-t border-[#eadfd5] pt-5">
                <p className="section-label">QUANTITY</p>
                <div className="quantity">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mt-6">
                <p className="section-label mb-2">SPECIAL INSTRUCTIONS</p>
                <textarea
                  className="note-input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="E.g., less spicy, extra hot, no onions..."
                  maxLength={160}
                />
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                className="primary-button mt-6 w-full shadow-lg"
                onClick={onAdd}
              >
                Add to Cart — {money(total)}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

// ==========================================
// 3. CART VIEW
// ==========================================
function CartView({
  table,
  cart,
  subtotal,
  tax,
  total,
  onBack,
  onChangeQty,
  onRemoveLine,
  onMore,
  onCheckout,
}: {
  table: string
  cart: CartLine[]
  subtotal: number
  tax: number
  total: number
  onBack: () => void
  onChangeQty: (idx: number, delta: number) => void
  onRemoveLine: (idx: number) => void
  onMore: () => void
  onCheckout: () => void
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#eadfd5]/80 bg-[#f8f3ed]/95 px-5 py-4 backdrop-blur-md">
        <button
          type="button"
          className="icon-button"
          onClick={onBack}
          aria-label="Back to menu"
        >
          <ArrowLeft size={19} />
        </button>
        <div>
          <p className="eyebrow">TABLE {table}</p>
          <h1 className="font-serif text-2xl font-bold text-[#2c211b]">Your Order</h1>
        </div>
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="flex flex-1 flex-col items-center justify-center px-8 pb-20 text-center">
          <div className="mb-6 grid size-20 place-items-center rounded-full bg-[#ead9ca] text-[#8f5c40]">
            <ShoppingBag size={32} />
          </div>
          <h2 className="font-serif text-2xl text-[#2c211b]">Your cart is empty</h2>
          <p className="mt-2 text-sm text-[#77685f]">
            Browse the menu to add something delicious.
          </p>
          <button type="button" className="primary-button mt-7" onClick={onMore}>
            View Menu
          </button>
        </div>
      ) : (
        <>
          <main className="flex flex-1 flex-col gap-4 px-5 py-5 pb-32">
            {cart.map((line, index) => (
              <div
                className="cart-line relative border border-[#ede2d8] shadow-sm"
                key={`${line.item.id}-${index}`}
              >
                <img src={line.item.image} alt={line.item.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`food-dot ${line.item.veg ? 'veg' : ''}`} />
                    <p className="font-semibold text-[#33251e]">{line.item.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-[#77685f]">
                    {money(line.item.price)} each
                    {line.addOns.length > 0 && ` · +${line.addOns.join(', ')}`}
                  </p>
                  {line.note && (
                    <p className="mt-1 inline-block rounded bg-[#f5ede4] px-2 py-0.5 text-[11px] text-[#826a5c]">
                      Note: {line.note}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="quantity">
                      <button
                        type="button"
                        onClick={() => onChangeQty(index, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onChangeQty(index, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveLine(index)}
                      className="p-1.5 text-[#b09687] hover:text-[#c45a45]"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#4a2d20]">{money(line.lineTotal)}</p>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="mt-2 flex items-center gap-2 self-start text-sm font-semibold text-[#9a6245]"
              onClick={onMore}
            >
              <Plus size={16} /> Add more items
            </button>

            <div className="mt-4 rounded-2xl border border-[#eadfd5] bg-white p-5">
              <PriceBreakdown subtotal={subtotal} tax={tax} total={total} />
            </div>
          </main>

          <FooterBar>
            <button
              type="button"
              className="primary-button w-full shadow-lg"
              onClick={onCheckout}
            >
              Proceed to Checkout · {money(total)} <ChevronRight size={18} />
            </button>
          </FooterBar>
        </>
      )}
    </div>
  )
}

// ==========================================
// 4. CHECKOUT VIEW
// ==========================================
function CheckoutView({
  table,
  cart,
  subtotal,
  tax,
  total,
  paymentChoice,
  setPaymentChoice,
  onBack,
  onProceed,
}: {
  table: string
  cart: CartLine[]
  subtotal: number
  tax: number
  total: number
  paymentChoice: 'online' | 'counter'
  setPaymentChoice: (choice: 'online' | 'counter') => void
  onBack: () => void
  onProceed: () => void
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#eadfd5]/80 bg-[#f8f3ed]/95 px-5 py-4 backdrop-blur-md">
        <button
          type="button"
          className="icon-button"
          onClick={onBack}
          aria-label="Back to cart"
        >
          <ArrowLeft size={19} />
        </button>
        <div>
          <p className="eyebrow">TABLE {table}</p>
          <h1 className="font-serif text-2xl font-bold text-[#2c211b]">Review Order</h1>
        </div>
      </div>

      <main className="flex flex-1 flex-col gap-6 px-5 py-5 pb-32">
        {/* Table Banner */}
        <div className="flex items-center justify-between rounded-2xl border border-[#eadfd5] bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#f2e6dc] text-[#70442f]">
              <Store size={20} />
            </span>
            <div>
              <p className="text-xs text-[#8c786c]">Dine-In Table</p>
              <p className="font-bold text-[#33251e]">Table {table}</p>
            </div>
          </div>
          <span className="table-badge">SESSION #7825</span>
        </div>

        {/* Order Items */}
        <section className="rounded-2xl border border-[#eadfd5] bg-white p-5">
          <p className="section-label">YOUR ITEMS</p>
          <div className="mt-3 flex flex-col divide-y divide-[#f2e7de]">
            {cart.map((line, i) => (
              <div key={i} className="flex justify-between py-2.5 text-sm">
                <div>
                  <span className="font-medium text-[#4a3930]">
                    {line.item.name}{' '}
                    <span className="text-xs font-bold text-[#9e7c69]">× {line.quantity}</span>
                  </span>
                  {line.addOns.length > 0 && (
                    <p className="text-[11px] text-[#8e7a6d]">
                      +{line.addOns.join(', ')}
                    </p>
                  )}
                  {line.note && (
                    <p className="text-[11px] italic text-[#a38a7c]">Note: {line.note}</p>
                  )}
                </div>
                <span className="font-semibold text-[#38251e]">{money(line.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-[#eadfd5] pt-4">
            <PriceBreakdown subtotal={subtotal} tax={tax} total={total} />
          </div>
        </section>

        {/* Payment Selection */}
        <section>
          <p className="section-label">HOW WOULD YOU LIKE TO PAY?</p>
          <div className="mt-3 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setPaymentChoice('online')}
              className={`pay-card ${paymentChoice === 'online' ? 'active' : ''}`}
            >
              <span className="pay-icon">
                <ReceiptText size={20} />
              </span>
              <span className="flex-1 text-left">
                <strong className="block text-sm">Pay Now</strong>
                <small>Pay securely online via UPI, Cards, Net Banking</small>
              </span>
              {paymentChoice === 'online' && <Check size={19} className="text-[#b17a5b]" />}
            </button>

            <button
              type="button"
              onClick={() => setPaymentChoice('counter')}
              className={`pay-card ${paymentChoice === 'counter' ? 'active' : ''}`}
            >
              <span className="pay-icon">
                <UtensilsCrossed size={20} />
              </span>
              <span className="flex-1 text-left">
                <strong className="block text-sm">Pay at Counter</strong>
                <small>Pay cash or card at the counter after your meal</small>
              </span>
              {paymentChoice === 'counter' && <Check size={19} className="text-[#b17a5b]" />}
            </button>
          </div>
        </section>
      </main>

      <FooterBar>
        <button
          type="button"
          className="primary-button w-full shadow-lg"
          onClick={onProceed}
        >
          {paymentChoice === 'online'
            ? `Proceed to Payment · ${money(total)}`
            : `Place Order · ${money(total)}`}
        </button>
      </FooterBar>
    </div>
  )
}

// ==========================================
// 5. MOCK PAYMENT VIEW
// ==========================================
function PaymentView({
  table,
  total,
  onBack,
  onSuccess,
  onSwitchToCounter,
}: {
  table: string
  total: number
  onBack: () => void
  onSuccess: () => void
  onSwitchToCounter: () => void
}) {
  const [method, setMethod] = useState<'UPI' | 'Cards' | 'Net Banking' | 'Wallets'>('UPI')
  const [state, setState] = useState<'idle' | 'processing' | 'failed'>('idle')
  const [failSimulated, setFailSimulated] = useState<boolean>(false)

  function handleTriggerPay() {
    setState('processing')
    window.setTimeout(() => {
      if (failSimulated) {
        setState('failed')
      } else {
        onSuccess()
      }
    }, 1100)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#eadfd5]/80 bg-[#f8f3ed]/95 px-5 py-4 backdrop-blur-md">
        <button
          type="button"
          className="icon-button"
          onClick={onBack}
          aria-label="Back to checkout"
          disabled={state === 'processing'}
        >
          <ArrowLeft size={19} />
        </button>
        <div>
          <p className="eyebrow">TABLE {table} · PROTOTYPE PAYMENT</p>
          <h1 className="font-serif text-2xl font-bold text-[#2c211b]">Secure Payment</h1>
        </div>
      </div>

      <main className="flex flex-1 flex-col px-5 py-5 pb-32">
        {/* Amount Card */}
        <div className="rounded-3xl bg-[#38251e] p-6 text-[#fffaf4] shadow-md">
          <p className="text-xs uppercase tracking-wider text-[#d9c2b2]">Amount to pay</p>
          <p className="mt-2 font-serif text-4xl font-bold">{money(total)}</p>
          <div className="mt-4 flex items-center justify-between border-t border-[#543b31] pt-3 text-xs text-[#d9c2b2]">
            <span>Terminal 2 · Table {table}</span>
            <span>Mock payment flow</span>
          </div>
        </div>

        {/* Payment Methods */}
        <p className="section-label mt-7">CHOOSE PAYMENT METHOD</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(['UPI', 'Cards', 'Net Banking', 'Wallets'] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMethod(m)}
              className={`payment-tile ${method === m ? 'selected' : ''}`}
            >
              <span>{m === 'UPI' ? '◉' : m === 'Cards' ? '▣' : m === 'Net Banking' ? '↔' : '▤'}</span>
              <span>{m}</span>
            </button>
          ))}
        </div>

        {/* UPI Details Mock */}
        {method === 'UPI' && (
          <div className="mt-5 rounded-2xl border border-[#eadfd5] bg-white p-4">
            <p className="text-xs font-bold text-[#705b4f]">POPULAR UPI APPS</p>
            <div className="mt-3 flex gap-2">
              {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                <span
                  key={app}
                  className="rounded-lg bg-[#f8f3ed] px-2.5 py-1.5 text-xs font-semibold text-[#57473d]"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Payment Failure State (Requirement 7) */}
        {state === 'failed' && (
          <div className="mt-6 rounded-2xl border border-[#f5c6cb] bg-[#fbf0ef] p-5 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#fae2df] text-[#a84236]">
              <AlertTriangle size={24} />
            </div>
            <h3 className="mt-3 font-serif text-lg font-bold text-[#72201b]">Payment Failed</h3>
            <p className="mt-1 text-xs text-[#8d3931]">
              We couldn&apos;t complete your payment. Don&apos;t worry, your cart and order items are safe.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                className="primary-button w-full"
                onClick={() => {
                  setFailSimulated(false)
                  setState('idle')
                }}
              >
                Try Again
              </button>
              <button
                type="button"
                className="rounded-xl border border-[#c99475] bg-white py-3 text-xs font-bold text-[#9a6245]"
                onClick={onSwitchToCounter}
              >
                Pay at Counter Instead
              </button>
            </div>
          </div>
        )}

        {/* Prototype simulation toggle for evaluator testing */}
        {state !== 'failed' && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-dashed border-[#d9c4b7] p-3 text-xs text-[#7d675b]">
            <span>Test payment failure flow:</span>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={failSimulated}
                onChange={(e) => setFailSimulated(e.target.checked)}
                className="accent-[#b17a5b]"
              />
              <span className="font-semibold text-[#4a2d20]">Simulate Failure</span>
            </label>
          </div>
        )}
      </main>

      {state !== 'failed' && (
        <FooterBar>
          {state === 'processing' ? (
            <button type="button" className="primary-button w-full" disabled>
              <Clock3 className="animate-spin" size={18} /> Processing payment…
            </button>
          ) : (
            <button
              type="button"
              className="primary-button w-full shadow-lg"
              onClick={handleTriggerPay}
            >
              Pay {money(total)}
            </button>
          )}
        </FooterBar>
      )}
    </div>
  )
}

// ==========================================
// 6. ORDER CONFIRMED VIEW (Requirement 8 & 9)
// ==========================================
function ConfirmedView({
  table,
  order,
  onTrack,
  onOrders,
  onMore,
}: {
  table: string
  order: CustomerOrder
  onTrack: () => void
  onOrders: () => void
  onMore: () => void
}) {
  const isPaid = order.paymentStatus === 'PAID'

  return (
    <div className="flex min-h-dvh flex-col items-center px-5 pb-8 pt-12 text-center">
      <div className="success-mark shadow-lg">
        <Check size={36} />
      </div>

      <p className="eyebrow mt-6">ORDER {order.id}</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-[#2c211b]">Order Confirmed!</h1>
      <p className="mt-2 max-w-[280px] text-sm text-[#77685f]">
        Your order has been sent to the kitchen.
      </p>

      {/* Confirmation Card */}
      <div className="mt-6 w-full rounded-3xl border border-[#eadfd5] bg-white p-5 text-left shadow-sm">
        <div className="flex justify-between py-1">
          <span className="text-sm text-[#77685f]">Table</span>
          <strong className="text-[#33251e]">TABLE {table}</strong>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-[#77685f]">Order Number</span>
          <strong className="text-[#33251e]">{order.id}</strong>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-[#77685f]">Estimated preparation</span>
          <strong className="text-[#33251e]">{order.estimatedTime}</strong>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-[#77685f]">Order status</span>
          <span className={`status-pill ${order.orderStatus.toLowerCase()}`}>
            {order.orderStatus}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-[#77685f]">Payment status</span>
          <span className={`status-pill ${order.paymentStatus.toLowerCase().replace('_', '-')}`}>
            {order.paymentStatus}
          </span>
        </div>

        {/* Pay at Counter Note if unpaid */}
        {!isPaid && (
          <div className="mt-3 rounded-xl bg-[#fdf6ec] p-3 text-xs text-[#9c6a1b]">
            <Info size={14} className="mb-0.5 inline mr-1" />
            You can pay for this order at the counter.
          </div>
        )}

        <div className="mt-4 flex justify-between border-t border-[#eadfd5] pt-3">
          <span className="text-sm font-semibold text-[#77685f]">
            {isPaid ? 'Amount Paid' : 'Amount Due'}
          </span>
          <strong className="text-base text-[#4a2d20]">{money(order.total)}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto flex w-full flex-col gap-3 pt-8">
        <button
          type="button"
          className="primary-button w-full shadow-md"
          onClick={onTrack}
        >
          Track Order <ArrowRight size={18} />
        </button>
        <button
          type="button"
          className="rounded-2xl border border-[#d8c5b8] bg-white py-3.5 text-xs font-bold text-[#4a2d20]"
          onClick={onOrders}
        >
          View All Orders
        </button>
        <button
          type="button"
          className="py-2 text-xs font-bold text-[#9a6245] hover:underline"
          onClick={onMore}
        >
          + Add More Items
        </button>
      </div>
    </div>
  )
}

// ==========================================
// 7. TRACKING VIEW (Requirement 13 & 15)
// ==========================================
function TrackingView({
  table,
  order,
  onMore,
  onViewOrders,
  onAdvanceStatus,
}: {
  table: string
  order: CustomerOrder
  onMore: () => void
  onViewOrders: () => void
  onAdvanceStatus: () => void
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#eadfd5]/80 bg-[#f8f3ed]/95 px-5 py-4 backdrop-blur-md">
        <div>
          <p className="eyebrow">TABLE {table}</p>
          <h1 className="font-serif text-2xl font-bold text-[#2c211b]">Order {order.id}</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`status-pill ${order.orderStatus.toLowerCase()}`}>
            {order.orderStatus}
          </span>
          <span className={`status-pill ${order.paymentStatus.toLowerCase().replace('_', '-')}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <main className="flex flex-1 flex-col gap-5 px-5 py-5 pb-32">
        {/* Status Banner */}
        <div className="rounded-3xl bg-[#38251e] p-6 text-[#fffaf4] shadow-md">
          <div className="flex items-center gap-3">
            <Clock3 className="text-[#df9b70]" size={28} />
            <div>
              <p className="text-xs uppercase tracking-wider text-[#d9c2b2]">
                {order.orderStatus === 'COMPLETED'
                  ? 'Order Completed'
                  : order.orderStatus === 'SERVED'
                  ? 'Served to Table'
                  : order.orderStatus === 'READY'
                  ? 'Ready for serving'
                  : 'Kitchen is working on your food'}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold">
                {order.orderStatus === 'COMPLETED'
                  ? 'Enjoy your day!'
                  : order.orderStatus === 'SERVED'
                  ? 'Bon appétit!'
                  : order.orderStatus === 'READY'
                  ? 'Serving now'
                  : 'Ready in ~10–15 min'}
              </p>
            </div>
          </div>
        </div>

        {/* Reusable Order Status Timeline */}
        <div className="rounded-3xl border border-[#eadfd5] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="section-label">ORDER STATUS TIMELINE</p>
            <span className="text-[11px] font-bold text-[#b17a5b]">Live</span>
          </div>

          <OrderStatusTimeline status={order.orderStatus} />

          {/* Status advance simulator for testing all 6 states */}
          <div className="mt-4 border-t border-[#f0e6de] pt-3 text-center">
            <button
              type="button"
              onClick={onAdvanceStatus}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#f8f1ea] px-3 py-1.5 text-xs font-semibold text-[#8c563e] hover:bg-[#ebdccc]"
            >
              <RefreshCw size={12} /> Advance status (Demo preview)
            </button>
          </div>
        </div>

        {/* Items in this Order */}
        <div className="rounded-3xl border border-[#eadfd5] bg-white p-5 shadow-sm">
          <p className="section-label mb-3">YOUR ORDER</p>
          <div className="flex flex-col divide-y divide-[#f5ede5]">
            {order.items.map((line, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <div>
                  <span className="font-medium text-[#38251e]">
                    {line.item.name} × {line.quantity}
                  </span>
                  {line.addOns.length > 0 && (
                    <p className="text-[11px] text-[#8e7a6d]">+{line.addOns.join(', ')}</p>
                  )}
                  {line.note && (
                    <p className="text-[11px] italic text-[#a38a7c]">Note: {line.note}</p>
                  )}
                </div>
                <span className="font-semibold text-[#4a2d20]">{money(line.lineTotal)}</span>
              </div>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="mt-3 rounded-xl bg-[#f8f2eb] p-3 text-xs text-[#705b4f]">
              <strong>Special instructions:</strong> {order.specialInstructions}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-[#eadfd5] pt-3 text-sm">
            <span className="text-[#77685f]">
              Payment: <strong>{order.paymentStatus}</strong> · Table {table}
            </span>
            <strong className="text-base text-[#38251e]">{money(order.total)}</strong>
          </div>
        </div>
      </main>

      <FooterBar>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-2xl border border-[#d8c5b8] bg-white px-4 py-3.5 text-xs font-bold text-[#4a2d20]"
            onClick={onViewOrders}
          >
            All Orders
          </button>
          <button
            type="button"
            className="primary-button flex-1 shadow-md"
            onClick={onMore}
          >
            <Plus size={17} /> Add More Items
          </button>
        </div>
      </FooterBar>
    </div>
  )
}

// ==========================================
// REUSABLE ORDER STATUS TIMELINE (Requirement 13)
// ==========================================
function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = TIMELINE_STEPS.findIndex((s) => s.status === status)

  return (
    <div className="flex flex-col">
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone = currentIndex > idx || status === 'COMPLETED'
        const isCurrent = currentIndex === idx && status !== 'COMPLETED'
        const isPending = currentIndex < idx && status !== 'COMPLETED'

        return (
          <div className="timeline-row" key={step.status}>
            <span
              className={`timeline-dot ${
                isDone ? 'done' : isCurrent ? 'current' : 'pending'
              }`}
            >
              {isDone ? <Check size={13} /> : isCurrent ? <span /> : null}
            </span>
            <span
              className={`text-sm ${
                isCurrent
                  ? 'font-bold text-[#2c211b]'
                  : isDone
                  ? 'font-medium text-[#4a3930]'
                  : 'text-[#a29186]'
              }`}
            >
              {step.label}
            </span>
            {isCurrent && (
              <span className="ml-auto text-[10px] font-extrabold uppercase tracking-wide text-[#b17a5b]">
                In progress
              </span>
            )}
            {isDone && (
              <span className="ml-auto text-xs text-[#64805d]">✓</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ==========================================
// 8. CUSTOMER ORDERS VIEW (Requirement 11, 12, 16, 17)
// ==========================================
function OrdersView({
  table,
  sessionId,
  orders,
  sessionTotal,
  sessionPaid,
  sessionBalance,
  billRequested,
  onRequestBill,
  onBack,
  onMore,
  onTrackOrder,
  onLoadDemo,
  onClearOrders,
}: {
  table: string
  sessionId: string
  orders: CustomerOrder[]
  sessionTotal: number
  sessionPaid: number
  sessionBalance: number
  billRequested: boolean
  onRequestBill: () => void
  onBack: () => void
  onMore: () => void
  onTrackOrder: (id: string) => void
  onLoadDemo: () => void
  onClearOrders: () => void
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#eadfd5]/80 bg-[#f8f3ed]/95 px-5 py-4 backdrop-blur-md">
        <button
          type="button"
          className="icon-button"
          onClick={onBack}
          aria-label="Back to menu"
        >
          <ArrowLeft size={19} />
        </button>
        <div>
          <p className="eyebrow">TABLE {table}</p>
          <h1 className="font-serif text-2xl font-bold text-[#2c211b]">Your Orders</h1>
        </div>
        <span className="table-badge ml-auto">{sessionId}</span>
      </div>

      {orders.length === 0 ? (
        /* Empty Orders State (Requirement 18) */
        <div className="flex flex-1 flex-col items-center justify-center px-8 pb-20 text-center">
          <div className="mb-6 grid size-20 place-items-center rounded-full bg-[#ead9ca] text-[#8f5c40]">
            <Receipt size={32} />
          </div>
          <h2 className="font-serif text-2xl text-[#2c211b]">No orders yet</h2>
          <p className="mt-2 text-sm text-[#77685f]">
            Start by choosing something from the menu.
          </p>
          <button type="button" className="primary-button mt-7" onClick={onMore}>
            View Menu
          </button>
          <button
            type="button"
            className="mt-4 text-xs font-bold text-[#9a6245]"
            onClick={onLoadDemo}
          >
            Load Example Session
          </button>
        </div>
      ) : (
        <>
          <main className="flex flex-1 flex-col gap-4 px-5 py-5 pb-36">
            <div className="flex items-center justify-between">
              <p className="section-label">CURRENT TABLE SESSION</p>
              <span className="text-xs font-semibold text-[#8a7263]">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
              </span>
            </div>

            {/* List of Orders in this Table Session */}
            {orders.map((o) => (
              <div key={o.id} className="order-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="eyebrow text-[#8f5c40]">ORDER {o.id}</p>
                      <span className="text-xs text-[#a39084]">· {o.time}</span>
                    </div>
                    <p className="mt-1.5 font-semibold text-[#38251e]">
                      {o.items.map((i) => `${i.item.name} × ${i.quantity}`).join(', ')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`status-pill ${o.orderStatus.toLowerCase()}`}>
                      {o.orderStatus}
                    </span>
                    <span className={`status-pill ${o.paymentStatus.toLowerCase().replace('_', '-')}`}>
                      {o.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#eadfd5] pt-3 text-sm">
                  <span className="text-[#77685f]">Total: <strong className="text-[#38251e]">{money(o.total)}</strong></span>
                  <button
                    type="button"
                    onClick={() => onTrackOrder(o.id)}
                    className="flex items-center gap-1 text-xs font-bold text-[#9a6245] hover:underline"
                  >
                    Track <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Session Summary (Requirement 12 & 17) */}
            <div className="rounded-2xl border border-[#eadfd5] bg-white p-5 shadow-sm">
              <p className="section-label mb-3">SESSION SUMMARY</p>
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between text-[#77685f]">
                  <span>Session Total</span>
                  <strong className="text-[#38251e]">{money(sessionTotal)}</strong>
                </div>
                <div className="flex justify-between text-[#77685f]">
                  <span>Paid</span>
                  <strong className="text-[#3b7a54]">{money(sessionPaid)}</strong>
                </div>
                <div className="flex justify-between border-t border-[#eadfd5] pt-2.5 text-base">
                  <span className="font-bold text-[#38251e]">Balance Due</span>
                  <strong className="font-bold text-[#a84236]">{money(sessionBalance)}</strong>
                </div>
              </div>

              {/* Bill Request Status (Requirement 16) */}
              <div className="mt-5 border-t border-[#eadfd5] pt-4">
                {billRequested ? (
                  <div className="rounded-xl border border-[#cbe4c8] bg-[#edf5eb] p-3 text-center text-xs text-[#35612e]">
                    <CheckCircle2 size={16} className="mx-auto mb-1 text-[#438661]" />
                    <strong className="block font-bold">Bill Requested</strong>
                    <span>Your bill request has been sent to the staff. A server will bring your bill to Table {table}.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#c99475] bg-[#fffaf4] py-3 text-xs font-bold text-[#9a6245] hover:bg-[#fbf0e8]"
                    onClick={onRequestBill}
                  >
                    <FileText size={16} /> Request Bill
                  </button>
                )}
              </div>
            </div>

            {/* Demo Testing Helpers */}
            <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-[#a49184]">
              <button type="button" onClick={onLoadDemo} className="hover:underline">
                Demo: Load 3 Orders
              </button>
              <button type="button" onClick={onClearOrders} className="hover:underline">
                Reset Session
              </button>
            </div>
          </main>

          <FooterBar>
            <button
              type="button"
              className="primary-button w-full shadow-lg"
              onClick={onMore}
            >
              <Plus size={18} /> Add More Items
            </button>
          </FooterBar>
        </>
      )}
    </div>
  )
}

// ==========================================
// BOTTOM NAVIGATION
// ==========================================
function BottomNav({
  active,
  ordersCount,
  onHome,
  onMenu,
  onOrders,
}: {
  active: 'home' | 'menu' | 'orders'
  ordersCount: number
  onHome: () => void
  onMenu: () => void
  onOrders: () => void
}) {
  return (
    <nav className="bottom-nav">
      <button
        type="button"
        className={active === 'home' ? 'active' : ''}
        onClick={onHome}
        aria-label="Home"
      >
        <Home size={19} />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={active === 'menu' ? 'active' : ''}
        onClick={onMenu}
        aria-label="Menu"
      >
        <Coffee size={19} />
        <span>Menu</span>
      </button>

      <button
        type="button"
        className={active === 'orders' ? 'active' : ''}
        onClick={onOrders}
        aria-label="Orders"
      >
        <PackageCheck size={19} />
        <span>Orders</span>
        {ordersCount > 0 && <span className="nav-badge">{ordersCount}</span>}
      </button>
    </nav>
  )
}

// ==========================================
// FOOTER BAR
// ==========================================
function FooterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 mt-auto border-t border-[#eadfd5] bg-[#f8f3ed]/95 p-4 backdrop-blur-md">
      {children}
    </div>
  )
}

// ==========================================
// PRICE BREAKDOWN
// ==========================================
function PriceBreakdown({
  subtotal,
  tax,
  total,
}: {
  subtotal: number
  tax: number
  total: number
}) {
  return (
    <div className="flex flex-col gap-2.5 text-sm">
      <div className="flex justify-between text-[#77685f]">
        <span>Subtotal</span>
        <span>{money(subtotal)}</span>
      </div>
      <div className="flex justify-between text-[#77685f]">
        <span>Taxes & charges (5% GST)</span>
        <span>{money(tax)}</span>
      </div>
      <div className="flex justify-between border-t border-[#eadfd5] pt-2.5 text-base font-bold text-[#33251e]">
        <span>Total</span>
        <span>{money(total)}</span>
      </div>
    </div>
  )
}
