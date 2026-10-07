'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Coffee,
  Eye,
  Filter,
  Flame,
  Hourglass,
  Layers,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Store,
  Table2,
  Timer as TimerIcon,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'

// --- TYPES ---
export type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'REJECTED'
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PENDING' | 'PARTIALLY_PAID' | 'FAILED'
export type PriorityLevel = 'NORMAL' | 'PRIORITY' | 'DELAYED'
export type ItemStatus = 'PENDING' | 'PREPARING' | 'READY'
export type KitchenStatus = 'Online' | 'Busy' | 'Paused' | 'Offline'

export type KitchenOrderItem = {
  id: string
  name: string
  quantity: number
  addOns?: string[]
  status: ItemStatus
}

export type KitchenOrder = {
  id: number
  table: string
  session: string
  items: KitchenOrderItem[]
  instruction?: string
  orderedAt: number
  timeString: string
  status: OrderStatus
  payment: PaymentStatus
  total: number
  priority: PriorityLevel
  delayReason?: string
  rejectionReason?: string
  completedAt?: number
  timeline: { label: string; time?: string }[]
}

const now = Date.now()

// Realistic initial orders matching Terminal 2 specifications
const seedOrders: KitchenOrder[] = [
  {
    id: 1048,
    table: 'T12',
    session: '#7825',
    items: [
      { id: '1', name: 'Chicken Burger', quantity: 1, addOns: ['Extra Cheese'], status: 'PREPARING' },
      { id: '2', name: 'French Fries', quantity: 1, addOns: ['Herb Salt'], status: 'READY' },
      { id: '3', name: 'Cold Coffee', quantity: 1, status: 'READY' },
    ],
    instruction: 'No onions',
    orderedAt: now - 14 * 60 * 1000 - 15 * 1000,
    timeString: '7:32 PM',
    status: 'PREPARING',
    payment: 'PAID',
    total: 350,
    priority: 'NORMAL',
    timeline: [
      { label: 'Order Received', time: '7:32 PM' },
      { label: 'Accepted', time: '7:33 PM' },
      { label: 'Preparing', time: '7:35 PM' },
    ],
  },
  {
    id: 1049,
    table: 'T05',
    session: '#7820',
    items: [
      { id: '1', name: 'Veg Burger', quantity: 2, addOns: ['Extra Patty'], status: 'PENDING' },
      { id: '2', name: 'French Fries', quantity: 1, status: 'PENDING' },
    ],
    instruction: 'Extra spicy',
    orderedAt: now - 3 * 60 * 1000 - 45 * 1000,
    timeString: '7:43 PM',
    status: 'NEW',
    payment: 'UNPAID',
    total: 400,
    priority: 'NORMAL',
    timeline: [{ label: 'Order Received', time: '7:43 PM' }],
  },
  {
    id: 1050,
    table: 'T08',
    session: '#7822',
    items: [
      { id: '1', name: 'Chicken Pizza', quantity: 1, addOns: ['Extra Mozzarella'], status: 'READY' },
      { id: '2', name: 'Cold Coffee', quantity: 2, status: 'READY' },
    ],
    orderedAt: now - 19 * 60 * 1000,
    timeString: '7:27 PM',
    status: 'READY',
    payment: 'PAID',
    total: 520,
    priority: 'PRIORITY',
    timeline: [
      { label: 'Order Received', time: '7:27 PM' },
      { label: 'Accepted', time: '7:28 PM' },
      { label: 'Preparing', time: '7:30 PM' },
      { label: 'Ready', time: '7:42 PM' },
    ],
  },
  {
    id: 1047,
    table: 'T02',
    session: '#7818',
    items: [
      { id: '1', name: 'Latte', quantity: 2, addOns: ['Caramel Drizzle'], status: 'PENDING' },
      { id: '2', name: 'Chocolate Cake', quantity: 1, status: 'PENDING' },
    ],
    orderedAt: now - 8 * 60 * 1000,
    timeString: '7:38 PM',
    status: 'ACCEPTED',
    payment: 'PAID',
    total: 420,
    priority: 'NORMAL',
    timeline: [
      { label: 'Order Received', time: '7:38 PM' },
      { label: 'Accepted', time: '7:40 PM' },
    ],
  },
  {
    id: 1046,
    table: 'T04',
    session: '#7819',
    items: [
      { id: '1', name: 'Chicken Burger', quantity: 2, status: 'READY' },
      { id: '2', name: 'French Fries', quantity: 2, status: 'READY' },
    ],
    orderedAt: now - 26 * 60 * 1000,
    timeString: '7:20 PM',
    status: 'SERVED',
    payment: 'PAID',
    total: 560,
    priority: 'NORMAL',
    timeline: [
      { label: 'Order Received', time: '7:20 PM' },
      { label: 'Accepted', time: '7:21 PM' },
      { label: 'Preparing', time: '7:24 PM' },
      { label: 'Ready', time: '7:38 PM' },
      { label: 'Served', time: '7:44 PM' },
    ],
  },
  {
    id: 1045,
    table: 'T04',
    session: '#7819',
    items: [
      { id: '1', name: 'Pasta Alfredo', quantity: 2, status: 'READY' },
      { id: '2', name: 'Garlic Bread', quantity: 1, status: 'READY' },
    ],
    orderedAt: now - 65 * 60 * 1000,
    timeString: '6:45 PM',
    status: 'COMPLETED',
    payment: 'PAID',
    total: 540,
    priority: 'NORMAL',
    completedAt: now - 35 * 60 * 1000,
    timeline: [
      { label: 'Order Received', time: '6:45 PM' },
      { label: 'Accepted', time: '6:46 PM' },
      { label: 'Preparing', time: '6:48 PM' },
      { label: 'Ready', time: '7:05 PM' },
      { label: 'Served', time: '7:10 PM' },
      { label: 'Completed', time: '7:15 PM' },
    ],
  },
  {
    id: 1044,
    table: 'T08',
    session: '#7822',
    items: [
      { id: '1', name: 'Club Sandwich', quantity: 2, status: 'READY' },
    ],
    orderedAt: now - 85 * 60 * 1000,
    timeString: '6:25 PM',
    status: 'COMPLETED',
    payment: 'PAID',
    total: 320,
    priority: 'NORMAL',
    completedAt: now - 55 * 60 * 1000,
    timeline: [
      { label: 'Order Received', time: '6:25 PM' },
      { label: 'Accepted', time: '6:26 PM' },
      { label: 'Preparing', time: '6:30 PM' },
      { label: 'Ready', time: '6:45 PM' },
      { label: 'Served', time: '6:50 PM' },
      { label: 'Completed', time: '6:55 PM' },
    ],
  },
]

type FilterTab = 'ALL' | 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'DELAYED' | 'PRIORITY' | 'COMPLETED'

const FILTER_TABS: FilterTab[] = ['ALL', 'NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'DELAYED', 'PRIORITY', 'COMPLETED']

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>(seedOrders)
  const [tab, setTab] = useState<FilterTab>('ALL')
  const [query, setQuery] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null)
  const [sound, setSound] = useState<boolean>(true)
  const [clock, setClock] = useState<Date>(new Date())
  const [connected, setConnected] = useState<boolean>(true)
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null)

  // Rejection modal state
  const [rejectModalOrder, setRejectModalOrder] = useState<KitchenOrder | null>(null)
  const [rejectReason, setRejectReason] = useState<string>('Item unavailable')
  const [otherRejectText, setOtherRejectText] = useState<string>('')

  // Delay reason modal state
  const [delayModalOrder, setDelayModalOrder] = useState<KitchenOrder | null>(null)
  const [delayReason, setDelayReason] = useState<string>('Kitchen busy')
  const [otherDelayText, setOtherDelayText] = useState<string>('')

  // Completed history date filter
  const [historyDateFilter, setHistoryDateFilter] = useState<'today' | 'yesterday' | 'all'>('today')

  // Live clock
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Auto-dismiss new order banner after 7 seconds
  useEffect(() => {
    if (!newOrderAlert) return
    const t = window.setTimeout(() => setNewOrderAlert(null), 7000)
    return () => window.clearInterval(t)
  }, [newOrderAlert])

  // Active (non-completed / non-rejected) orders
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'REJECTED')
  }, [orders])

  // Completed orders
  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'COMPLETED')
  }, [orders])

  // Filtered orders for current view
  const visibleOrders = useMemo(() => {
    let list: KitchenOrder[] = []

    if (tab === 'COMPLETED') {
      list = completedOrders
    } else if (tab === 'ALL') {
      list = activeOrders
    } else if (tab === 'DELAYED') {
      list = activeOrders.filter((o) => o.priority === 'DELAYED')
    } else if (tab === 'PRIORITY') {
      list = activeOrders.filter((o) => o.priority === 'PRIORITY')
    } else {
      list = activeOrders.filter((o) => o.status === tab)
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim()
      list = list.filter((o) => `${o.id} ${o.table} ${o.session}`.toLowerCase().includes(q))
    }

    return list
  }, [tab, activeOrders, completedOrders, query])

  // Metric counts
  const count = (status: OrderStatus) => orders.filter((o) => o.status === status).length
  const delayedCount = activeOrders.filter((o) => o.priority === 'DELAYED').length
  const completedCount = completedOrders.length

  // Advance primary order workflow (Requirements 2, 4, 5, 6, 7, 8)
  function handleAdvance(order: KitchenOrder) {
    const timeNow = clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    let next: OrderStatus | null = null
    let stepLabel = ''

    if (order.status === 'NEW') {
      next = 'ACCEPTED'
      stepLabel = 'Accepted'
    } else if (order.status === 'ACCEPTED') {
      next = 'PREPARING'
      stepLabel = 'Preparing'
    } else if (order.status === 'PREPARING') {
      next = 'READY'
      stepLabel = 'Ready'
    } else if (order.status === 'READY') {
      next = 'SERVED'
      stepLabel = 'Served'
    } else if (order.status === 'SERVED') {
      next = 'COMPLETED'
      stepLabel = 'Completed'
    }

    if (!next) return

    setOrders((current) =>
      current.map((item) => {
        if (item.id !== order.id) return item
        return {
          ...item,
          status: next!,
          completedAt: next === 'COMPLETED' ? Date.now() : item.completedAt,
          timeline: [...item.timeline, { label: stepLabel, time: timeNow }],
        }
      })
    )

    if (selectedOrder?.id === order.id) {
      if (next === 'COMPLETED') {
        setSelectedOrder(null)
      } else {
        setSelectedOrder((prev) => (prev ? { ...prev, status: next! } : null))
      }
    }
  }

  // Reject order action (Requirement 3)
  function handleConfirmReject() {
    if (!rejectModalOrder) return
    const finalReason = rejectReason === 'Other' ? otherRejectText || 'Other reason' : rejectReason
    const timeNow = clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    setOrders((current) =>
      current.map((item) => {
        if (item.id !== rejectModalOrder.id) return item
        return {
          ...item,
          status: 'REJECTED',
          rejectionReason: finalReason,
          timeline: [...item.timeline, { label: `Rejected: ${finalReason}`, time: timeNow }],
        }
      })
    )

    if (selectedOrder?.id === rejectModalOrder.id) {
      setSelectedOrder(null)
    }

    setRejectModalOrder(null)
    setRejectReason('Item unavailable')
    setOtherRejectText('')
  }

  // Item-level preparation status toggle (Requirement 9)
  function handleToggleItemStatus(orderId: number, itemId: string) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order
        const updatedItems = order.items.map((item) => {
          if (item.id !== itemId) return item
          const cycle: Record<ItemStatus, ItemStatus> = {
            PENDING: 'PREPARING',
            PREPARING: 'READY',
            READY: 'PENDING',
          }
          return { ...item, status: cycle[item.status] }
        })
        return { ...order, items: updatedItems }
      })
    )
  }

  // Priority toggle
  function handleSetPriority(orderId: number, priority: PriorityLevel, reason?: string) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order
        return { ...order, priority, delayReason: reason }
      })
    )
  }

  // Simulate new order alert for testing (Requirement 18)
  function handleSimulateNewOrder() {
    const nextId = Math.max(...orders.map((o) => o.id)) + 1
    const newOrd: KitchenOrder = {
      id: nextId,
      table: 'T12',
      session: '#7825',
      items: [
        { id: '1', name: 'Chicken Burger', quantity: 1, addOns: ['Extra Cheese'], status: 'PENDING' },
        { id: '2', name: 'Cold Coffee', quantity: 1, status: 'PENDING' },
      ],
      instruction: 'Serve together',
      orderedAt: Date.now(),
      timeString: clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      status: 'NEW',
      payment: 'PAID',
      total: 300,
      priority: 'NORMAL',
      timeline: [{ label: 'Order Received', time: clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }],
    }

    setOrders((prev) => [newOrd, ...prev])
    setNewOrderAlert(`NEW ORDER #${nextId} · TABLE T12 received just now`)
    if (sound) {
      // Audio cue simulation
    }
  }

  // Reset demo orders helper
  function handleResetDemoOrders() {
    setOrders(seedOrders)
    setTab('ALL')
    setSelectedOrder(null)
  }

  return (
    <div className="kitchen-shell">
      {/* DESKTOP SIDEBAR */}
      <KitchenSidebar
        status={connected ? 'Online' : 'Offline'}
        activeTab={tab}
        onSelectTab={(t) => setTab(t)}
        newCount={count('NEW')}
        preparingCount={count('PREPARING')}
        readyCount={count('READY')}
        completedCount={completedCount}
      />

      <main className="kitchen-main">
        {/* HEADER */}
        <header className="kitchen-header">
          <div className="kitchen-title">
            <button className="kitchen-menu" aria-label="Open navigation">
              <Menu />
            </button>
            <div>
              <p className="kitchen-kicker">TERMINAL <span>2</span> · COIMBATORE</p>
              <h1>Kitchen Display System</h1>
            </div>
          </div>

          <div className="kitchen-header-actions">
            {/* Clock */}
            <div className="kitchen-clock">
              <Clock3 /> <strong>{clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</strong>
            </div>

            {/* Connection Toggle / Indicator (Requirement 17) */}
            <button
              type="button"
              onClick={() => setConnected(!connected)}
              className="kitchen-online"
              title="Click to toggle connection simulation"
              style={{ cursor: 'pointer', background: 'transparent', border: 0 }}
            >
              <i className={connected ? 'online-dot' : 'offline-dot'} />
              <span>{connected ? '● Connected' : '⚠ Connection Lost'}</span>
            </button>

            {/* Sound Toggle (Requirement 19) */}
            <button
              className="kitchen-icon"
              onClick={() => setSound(!sound)}
              aria-label={sound ? 'Mute notifications' : 'Unmute notifications'}
              title={sound ? 'Sound ON' : 'Sound OFF'}
            >
              {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Simulate Order Trigger */}
            <button
              className="kitchen-filter"
              onClick={handleSimulateNewOrder}
              title="Simulate incoming order from customer table"
            >
              <Plus size={14} /> New Order
            </button>

            <button className="staff-avatar" aria-label="Kitchen staff">
              KS
            </button>
          </div>
        </header>

        {/* NON-BLOCKING CONNECTION LOSS BANNER (Requirement 17) */}
        {!connected && (
          <div className="connection-warning">
            <span>
              <AlertTriangle size={18} />
              <strong>Kitchen connection unavailable</strong>
              <small>Orders may not update in real time until the network connection is restored.</small>
            </span>
            <button onClick={() => setConnected(true)}>Retry Connection</button>
          </div>
        )}

        {/* NEW ORDER ARRIVAL ALERT (Requirement 18) */}
        {newOrderAlert && (
          <div className="new-order-banner">
            <div className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-[#df9b70] text-xs font-black text-[#38251e]">
                <Bell size={14} />
              </span>
              <span>{newOrderAlert}</span>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-xs font-bold text-[#df9b70] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* METRICS BAR (Requirement 15) */}
        <section className="kitchen-metrics">
          <KitchenMetric label="New Orders" value={count('NEW')} tone="new" />
          <KitchenMetric label="Preparing" value={count('PREPARING')} tone="preparing" />
          <KitchenMetric label="Ready to Serve" value={count('READY')} tone="ready" />
          <KitchenMetric label="Completed Today" value={completedCount} tone="neutral" />
          <KitchenMetric label="Avg Prep Time" value="14 min" tone="neutral" />
          <KitchenMetric label="Delayed Orders" value={delayedCount} tone={delayedCount > 0 ? 'delayed' : 'neutral'} />
        </section>

        {/* TOOLBAR: TABS & SEARCH (Requirement 12) */}
        <div className="kitchen-toolbar">
          <div className="kitchen-tabs">
            {FILTER_TABS.map((status) => {
              let badgeCount = 0
              if (status === 'ALL') badgeCount = activeOrders.length
              else if (status === 'COMPLETED') badgeCount = completedCount
              else if (status === 'DELAYED') badgeCount = delayedCount
              else if (status === 'PRIORITY') badgeCount = activeOrders.filter((o) => o.priority === 'PRIORITY').length
              else badgeCount = count(status as OrderStatus)

              return (
                <button
                  key={status}
                  className={tab === status ? 'active' : ''}
                  onClick={() => setTab(status)}
                >
                  {status === 'ALL' ? 'ALL ACTIVE' : status}
                  <span>{badgeCount}</span>
                </button>
              )
            })}
          </div>

          <div className="kitchen-filters">
            <div className="kitchen-search">
              <Search />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search order # or table"
                aria-label="Search order or table"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-[10px] font-bold text-[#a18d80]"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              className="kitchen-filter"
              onClick={handleResetDemoOrders}
              title="Reset order queue to seed state"
            >
              <RefreshCw size={13} /> Reset Queue
            </button>
          </div>
        </div>

        {/* SECTION HEADING */}
        <div className="board-heading">
          <div>
            <p className="kitchen-kicker">
              {tab === 'COMPLETED' ? 'ARCHIVED TICKETS' : 'LIVE ORDER QUEUE'}
            </p>
            <h2>
              {tab === 'COMPLETED'
                ? 'Completed Orders Register'
                : tab === 'ALL'
                ? 'All Active Kitchen Tickets'
                : `${tab} Tickets`}
            </h2>
          </div>
          <span>{visibleOrders.length} {visibleOrders.length === 1 ? 'ticket' : 'tickets'}</span>
        </div>

        {/* COMPLETED ORDERS VIEW (Requirement 8) */}
        {tab === 'COMPLETED' ? (
          <CompletedHistoryView
            orders={visibleOrders}
            dateFilter={historyDateFilter}
            onDateFilterChange={setHistoryDateFilter}
            onSelectOrder={(o) => setSelectedOrder(o)}
          />
        ) : visibleOrders.length > 0 ? (
          /* ACTIVE ORDER CARDS GRID (Requirement 1, 2, 4, 5, 6, 7) */
          <div className="order-board">
            {visibleOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                onAdvance={() => handleAdvance(order)}
                onReject={() => setRejectModalOrder(order)}
                onDetails={() => setSelectedOrder(order)}
                onToggleItemStatus={(itemId) => handleToggleItemStatus(order.id, itemId)}
                onSetPriority={(p, r) => handleSetPriority(order.id, p, r)}
                onPromptDelay={() => setDelayModalOrder(order)}
              />
            ))}
          </div>
        ) : (
          /* EMPTY STATE (Requirement 20) */
          <KitchenEmptyState tab={tab} onReset={handleResetDemoOrders} />
        )}
      </main>

      {/* ORDER DETAILS DRAWER (Requirement 13) */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAdvance={() => handleAdvance(selectedOrder)}
          onReject={() => setRejectModalOrder(selectedOrder)}
          onToggleItemStatus={(itemId) => handleToggleItemStatus(selectedOrder.id, itemId)}
        />
      )}

      {/* REJECT ORDER MODAL (Requirement 3) */}
      {rejectModalOrder && (
        <RejectOrderModal
          order={rejectModalOrder}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          otherText={otherRejectText}
          onOtherTextChange={setOtherRejectText}
          onCancel={() => setRejectModalOrder(null)}
          onConfirm={handleConfirmReject}
        />
      )}

      {/* DELAY ORDER REASON MODAL (Requirement 11) */}
      {delayModalOrder && (
        <DelayOrderModal
          order={delayModalOrder}
          reason={delayReason}
          onReasonChange={setDelayReason}
          otherText={otherDelayText}
          onOtherTextChange={setOtherDelayText}
          onCancel={() => setDelayModalOrder(null)}
          onConfirm={() => {
            const finalReason = delayReason === 'Other' ? otherDelayText || 'Preparation delay' : delayReason
            handleSetPriority(delayModalOrder.id, 'DELAYED', finalReason)
            setDelayModalOrder(null)
          }}
        />
      )}
    </div>
  )
}

// ==========================================
// KITCHEN ORDER CARD (Requirement 1, 2, 4, 5, 6, 7, 9, 10, 11, 14, 16, 22)
// ==========================================
function KitchenOrderCard({
  order,
  onAdvance,
  onReject,
  onDetails,
  onToggleItemStatus,
  onSetPriority,
  onPromptDelay,
}: {
  order: KitchenOrder
  onAdvance: () => void
  onReject: () => void
  onDetails: () => void
  onToggleItemStatus: (itemId: string) => void
  onSetPriority: (p: PriorityLevel, r?: string) => void
  onPromptDelay: () => void
}) {
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false)

  // Determine button label for order status
  let actionText = ''
  if (order.status === 'NEW') actionText = 'Accept'
  else if (order.status === 'ACCEPTED') actionText = 'Start Preparing'
  else if (order.status === 'PREPARING') actionText = 'Mark Ready'
  else if (order.status === 'READY') actionText = 'Mark Served'
  else if (order.status === 'SERVED') actionText = 'Complete'

  return (
    <article className={`kitchen-order ${order.status.toLowerCase()}`}>
      {/* Top Header: Order Number, Table & Session, Status Badge */}
      <div className="order-card-top">
        <div>
          <div className="flex items-center gap-2">
            <span className="order-number">#{order.id}</span>
            <span className="table-number">{order.table}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[#8e7a6d]">
            <span>{order.session}</span>
            <span>·</span>
            <span>{order.timeString}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={order.status} />
          {order.priority !== 'NORMAL' && (
            <span className={`priority-badge ${order.priority.toLowerCase()}`}>
              {order.priority === 'PRIORITY' ? '⚡ PRIORITY' : '⏳ DELAYED'}
            </span>
          )}
        </div>
      </div>

      {/* Items List with Item-Level Status (Requirement 9) */}
      <div className="order-items">
        {order.items.map((item) => (
          <div key={item.id} className="group">
            <div className="flex items-start gap-2">
              <b>{item.quantity} ×</b>
              <div>
                <span className="font-semibold text-[#33251e]">{item.name}</span>
                {item.addOns && item.addOns.length > 0 && (
                  <p className="text-[11px] text-[#907b6e]">+{item.addOns.join(', ')}</p>
                )}
              </div>
            </div>

            {/* Clickable Item Status Pill */}
            <button
              type="button"
              onClick={() => onToggleItemStatus(item.id)}
              className={`item-prep-badge ${item.status.toLowerCase()}`}
              title="Click to toggle item preparation status"
            >
              {item.status === 'READY' && <Check size={10} />}
              {item.status}
            </button>
          </div>
        ))}
      </div>

      {/* Visually Prominent Special Instructions (Requirement 10) */}
      {order.instruction && (
        <div className="special-note" style={{ borderLeft: '3px solid #df9b70' }}>
          <small className="flex items-center gap-1 font-extrabold text-[#ab7c39]">
            <AlertTriangle size={12} /> ⚠ CUSTOMER NOTE
          </small>
          <strong className="text-xs text-[#2c211b]">{order.instruction}</strong>
        </div>
      )}

      {/* Delay Reason if delayed */}
      {order.priority === 'DELAYED' && order.delayReason && (
        <div className="mb-3 rounded-md bg-[#fff7ea] p-2 text-[11px] text-[#ab721c]">
          <strong>Delay Note:</strong> {order.delayReason}
        </div>
      )}

      {/* Card Footer: Timer & Payment Status Display (Requirement 14 & 16) */}
      <div className="order-card-foot">
        <span className="waiting">
          <Clock3 size={13} />
          <LiveTimer start={order.orderedAt} />
        </span>
        <span className={`payment ${order.payment.toLowerCase().replace('_', '-')}`}>
          {order.payment === 'PAID' ? 'PAID' : order.payment === 'UNPAID' ? 'UNPAID' : 'PAY AT COUNTER'}
        </span>
      </div>

      {/* Actions (Requirement 2, 4, 5, 6, 7) */}
      <div className="order-actions">
        {order.status === 'NEW' ? (
          <>
            <button className="order-primary" onClick={onAdvance}>
              Accept
            </button>
            <button className="order-danger" onClick={onReject}>
              Reject
            </button>
          </>
        ) : actionText ? (
          <button className="order-primary" onClick={onAdvance}>
            {actionText}
          </button>
        ) : null}

        <button className="order-secondary" onClick={onDetails} title="View details">
          <Eye size={14} />
        </button>

        {/* Priority Menu Toggle */}
        <div className="relative">
          <button
            className="order-secondary"
            onClick={() => setPriorityMenuOpen(!priorityMenuOpen)}
            title="Set priority or delay"
          >
            <MoreHorizontal size={14} />
          </button>

          {priorityMenuOpen && (
            <div
              className="absolute bottom-full right-0 z-30 mb-1 flex w-36 flex-col rounded-lg border border-[#eadfd5] bg-white p-1 text-xs shadow-lg"
              onMouseLeave={() => setPriorityMenuOpen(false)}
            >
              <button
                className="rounded p-1.5 text-left font-semibold text-[#c62828] hover:bg-[#fdeeed]"
                onClick={() => {
                  onSetPriority('PRIORITY')
                  setPriorityMenuOpen(false)
                }}
              >
                ⚡ Mark Priority
              </button>
              <button
                className="rounded p-1.5 text-left font-semibold text-[#e65100] hover:bg-[#fff3e0]"
                onClick={() => {
                  setPriorityMenuOpen(false)
                  onPromptDelay()
                }}
              >
                ⏳ Mark Delayed
              </button>
              <button
                className="rounded p-1.5 text-left text-[#5c4a40] hover:bg-[#f5ede4]"
                onClick={() => {
                  onSetPriority('NORMAL')
                  setPriorityMenuOpen(false)
                }}
              >
                Standard Normal
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// ==========================================
// REJECT ORDER MODAL (Requirement 3)
// ==========================================
function RejectOrderModal({
  order,
  reason,
  onReasonChange,
  otherText,
  onOtherTextChange,
  onCancel,
  onConfirm,
}: {
  order: KitchenOrder
  reason: string
  onReasonChange: (r: string) => void
  otherText: string
  onOtherTextChange: (t: string) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const reasons = ['Item unavailable', 'Kitchen busy', 'Customer cancellation', 'Other']

  return (
    <div className="kitchen-modal-backdrop" onClick={onCancel}>
      <div className="kitchen-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#f0e6de] pb-3">
          <div>
            <p className="kitchen-kicker">CONFIRM REJECTION</p>
            <h3 className="font-serif text-xl font-bold text-[#2c211b]">
              Reject Order #{order.id}?
            </h3>
          </div>
          <button className="kitchen-icon" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 text-xs text-[#796b63]">
          Table {order.table} · Session {order.session}. Please select a rejection reason:
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {reasons.map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-xs font-semibold ${
                reason === r
                  ? 'border-[#c74334] bg-[#fdf2f0] text-[#9b2b1e]'
                  : 'border-[#eadfd5] bg-white text-[#4a3930]'
              }`}
            >
              <input
                type="radio"
                name="rejectReason"
                checked={reason === r}
                onChange={() => onReasonChange(r)}
                className="accent-[#c74334]"
              />
              <span>{r}</span>
            </label>
          ))}
        </div>

        {reason === 'Other' && (
          <div className="mt-3">
            <input
              type="text"
              value={otherText}
              onChange={(e) => onOtherTextChange(e.target.value)}
              placeholder="Enter custom rejection reason..."
              className="w-full rounded-lg border border-[#eadfd5] p-2 text-xs outline-none focus:border-[#c74334]"
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="order-secondary flex-1 justify-center py-2.5"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="order-danger solid flex-1 justify-center py-2.5"
            onClick={onConfirm}
          >
            Reject Order
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// DELAY ORDER MODAL (Requirement 11)
// ==========================================
function DelayOrderModal({
  order,
  reason,
  onReasonChange,
  otherText,
  onOtherTextChange,
  onCancel,
  onConfirm,
}: {
  order: KitchenOrder
  reason: string
  onReasonChange: (r: string) => void
  otherText: string
  onOtherTextChange: (t: string) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const reasons = ['Kitchen busy', 'Item preparation delay', 'Other']

  return (
    <div className="kitchen-modal-backdrop" onClick={onCancel}>
      <div className="kitchen-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#f0e6de] pb-3">
          <div>
            <p className="kitchen-kicker">ORDER DELAY NOTICE</p>
            <h3 className="font-serif text-xl font-bold text-[#2c211b]">
              Mark #{order.id} as Delayed
            </h3>
          </div>
          <button className="kitchen-icon" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 text-xs text-[#796b63]">
          Table {order.table}. Select reason for kitchen delay:
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {reasons.map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-xs font-semibold ${
                reason === r
                  ? 'border-[#e65100] bg-[#fff3e0] text-[#a83d00]'
                  : 'border-[#eadfd5] bg-white text-[#4a3930]'
              }`}
            >
              <input
                type="radio"
                name="delayReason"
                checked={reason === r}
                onChange={() => onReasonChange(r)}
                className="accent-[#e65100]"
              />
              <span>{r}</span>
            </label>
          ))}
        </div>

        {reason === 'Other' && (
          <div className="mt-3">
            <input
              type="text"
              value={otherText}
              onChange={(e) => onOtherTextChange(e.target.value)}
              placeholder="Describe delay reason..."
              className="w-full rounded-lg border border-[#eadfd5] p-2 text-xs outline-none focus:border-[#e65100]"
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="order-secondary flex-1 justify-center py-2.5"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="order-primary flex-1 justify-center py-2.5"
            onClick={onConfirm}
          >
            Apply Delay
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// COMPLETED HISTORY VIEW (Requirement 8)
// ==========================================
function CompletedHistoryView({
  orders,
  dateFilter,
  onDateFilterChange,
  onSelectOrder,
}: {
  orders: KitchenOrder[]
  dateFilter: 'today' | 'yesterday' | 'all'
  onDateFilterChange: (f: 'today' | 'yesterday' | 'all') => void
  onSelectOrder: (o: KitchenOrder) => void
}) {
  return (
    <div className="rounded-xl border border-[#eadfd5] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#2c211b]">Completed Order Register</h3>
          <p className="text-xs text-[#796b63]">
            Past orders completed by the kitchen. Archived away from the active display board.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex gap-2">
          {(['today', 'yesterday', 'all'] as const).map((d) => (
            <button
              key={d}
              onClick={() => onDateFilterChange(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                dateFilter === d
                  ? 'bg-[#4a2d20] text-white'
                  : 'bg-[#f8f3ed] text-[#796b63] hover:bg-[#ede2d6]'
              }`}
            >
              {d === 'all' ? 'All Dates' : d}
            </button>
          ))}
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0e6de] text-[10px] uppercase tracking-wider text-[#9f887b]">
                <th className="pb-3">Order</th>
                <th className="pb-3">Table</th>
                <th className="pb-3">Session</th>
                <th className="pb-3">Ordered At</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7efe8]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#fcf8f4]">
                  <td className="py-3 font-extrabold text-[#38251e]">#{o.id}</td>
                  <td className="py-3 font-semibold text-[#5c4a40]">{o.table}</td>
                  <td className="py-3 text-[#8c786c]">{o.session}</td>
                  <td className="py-3 text-[#796b63]">{o.timeString}</td>
                  <td className="py-3 text-[#38251e]">
                    {o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                  </td>
                  <td className="py-3 font-bold text-[#4a2d20]">₹{o.total}</td>
                  <td className="py-3">
                    <span className="rounded bg-[#e3f3e8] px-2 py-0.5 text-[10px] font-bold text-[#2e7d4d]">
                      {o.payment}
                    </span>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      className="rounded border border-[#eadfd5] bg-white px-2.5 py-1 text-xs font-semibold text-[#8c563e] hover:bg-[#fbf4ee]"
                      onClick={() => onSelectOrder(o)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-[#796b63]">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-[#b09e91]" />
          No completed orders match the current filter.
        </div>
      )}
    </div>
  )
}

// ==========================================
// ORDER DETAILS DRAWER (Requirement 13)
// ==========================================
function OrderDetailsDrawer({
  order,
  onClose,
  onAdvance,
  onReject,
  onToggleItemStatus,
}: {
  order: KitchenOrder
  onClose: () => void
  onAdvance: () => void
  onReject: () => void
  onToggleItemStatus: (itemId: string) => void
}) {
  let actionText = ''
  if (order.status === 'NEW') actionText = 'Accept Order'
  else if (order.status === 'ACCEPTED') actionText = 'Start Preparing'
  else if (order.status === 'PREPARING') actionText = 'Mark Ready'
  else if (order.status === 'READY') actionText = 'Mark Served'
  else if (order.status === 'SERVED') actionText = 'Complete Order'

  return (
    <div className="details-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <aside className="order-details" onClick={(event) => event.stopPropagation()}>
        {/* Header */}
        <div className="details-header">
          <div>
            <p className="kitchen-kicker">KITCHEN TICKET</p>
            <h2>#{order.id}</h2>
          </div>
          <button className="kitchen-icon" onClick={onClose} aria-label="Close details">
            <X size={18} />
          </button>
        </div>

        {/* Table, Session & Payment Details */}
        <div className="details-table">
          <span>TABLE</span>
          <strong>{order.table}</strong>
          <span>SESSION</span>
          <strong>{order.session}</strong>
          <span>ORDER TIME</span>
          <strong>{order.timeString}</strong>
          <span>PAYMENT</span>
          <strong className="paid-text">{order.payment}</strong>
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge status={order.status} />
          {order.priority !== 'NORMAL' && (
            <span className={`priority-badge ${order.priority.toLowerCase()}`}>
              {order.priority}
            </span>
          )}
        </div>

        {/* Items List */}
        <h3>Order Items</h3>
        <div className="details-items">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1">
              <div>
                <span className="font-semibold text-[#38251e]">{item.name}</span>
                {item.addOns && item.addOns.length > 0 && (
                  <p className="text-[11px] text-[#907b6e]">+{item.addOns.join(', ')}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <b>× {item.quantity}</b>
                <button
                  type="button"
                  onClick={() => onToggleItemStatus(item.id)}
                  className={`item-prep-badge ${item.status.toLowerCase()}`}
                  title="Click to toggle item preparation status"
                >
                  {item.status}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Special Instructions (Requirement 10) */}
        {order.instruction && (
          <div className="details-instruction">
            <small className="flex items-center gap-1 font-bold text-[#ab7c39]">
              <AlertTriangle size={12} /> SPECIAL INSTRUCTIONS
            </small>
            <p className="font-semibold text-[#38251e]">{order.instruction}</p>
          </div>
        )}

        {/* Timeline (Requirement 13) */}
        <h3>Order Timeline</h3>
        <div className="details-timeline">
          {order.timeline.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <i className="online-dot" />
              <span>
                {item.label}
                <small>{item.time || 'In progress'}</small>
              </span>
            </div>
          ))}
        </div>

        {/* Drawer Primary Action */}
        <div className="mt-8 flex flex-col gap-2">
          {order.status === 'NEW' ? (
            <div className="flex gap-2">
              <button className="order-primary full" onClick={onAdvance}>
                Accept Order
              </button>
              <button
                className="order-danger solid mt-[26px] px-4"
                onClick={onReject}
              >
                Reject
              </button>
            </div>
          ) : actionText ? (
            <button className="order-primary full" onClick={onAdvance}>
              {actionText} <ChevronDown size={14} />
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

// ==========================================
// SIDEBAR (Requirement 8, Desktop layout)
// ==========================================
function KitchenSidebar({
  status,
  activeTab,
  onSelectTab,
  newCount,
  preparingCount,
  readyCount,
  completedCount,
}: {
  status: string
  activeTab: FilterTab
  onSelectTab: (t: FilterTab) => void
  newCount: number
  preparingCount: number
  readyCount: number
  completedCount: number
}) {
  return (
    <aside className="kitchen-sidebar">
      <div className="kitchen-logo">
        <Coffee />
        <span>
          TERMINAL <b>2</b>
          <small>Kitchen operations</small>
        </span>
      </div>

      <nav>
        <p>WORKSPACE</p>
        <button
          onClick={() => onSelectTab('ALL')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold ${
            activeTab === 'ALL' ? 'bg-[#684330] text-white shadow-inner' : 'text-[#c8b9ae] hover:bg-[#443026]'
          }`}
        >
          <LayoutDashboard size={16} /> Kitchen Board
          <b className="ml-auto text-[10px] text-[#f1c7aa]">Live</b>
        </button>

        <button
          onClick={() => onSelectTab('NEW')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold ${
            activeTab === 'NEW' ? 'bg-[#684330] text-white' : 'text-[#c8b9ae] hover:bg-[#443026]'
          }`}
        >
          <Bell size={16} /> New Tickets
          <b className="ml-auto text-[10px] text-[#bca99d]">{newCount}</b>
        </button>

        <button
          onClick={() => onSelectTab('PREPARING')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold ${
            activeTab === 'PREPARING' ? 'bg-[#684330] text-white' : 'text-[#c8b9ae] hover:bg-[#443026]'
          }`}
        >
          <Play size={16} /> Preparing
          <b className="ml-auto text-[10px] text-[#bca99d]">{preparingCount}</b>
        </button>

        <button
          onClick={() => onSelectTab('READY')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold ${
            activeTab === 'READY' ? 'bg-[#684330] text-white' : 'text-[#c8b9ae] hover:bg-[#443026]'
          }`}
        >
          <Check size={16} /> Ready
          <b className="ml-auto text-[10px] text-[#bca99d]">{readyCount}</b>
        </button>

        <button
          onClick={() => onSelectTab('COMPLETED')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold ${
            activeTab === 'COMPLETED' ? 'bg-[#684330] text-white' : 'text-[#c8b9ae] hover:bg-[#443026]'
          }`}
        >
          <Clock3 size={16} /> Completed
          <b className="ml-auto text-[10px] text-[#bca99d]">{completedCount}</b>
        </button>
      </nav>

      <div className="sidebar-staff">
        <div className="staff-avatar">KS</div>
        <span>
          <strong>Kitchen Staff</strong>
          <small>
            <i className={status === 'Offline' ? 'offline-dot' : 'online-dot'} /> {status}
          </small>
        </span>
        <MoreHorizontal size={14} className="text-[#a89587]" />
      </div>
    </aside>
  )
}

// ==========================================
// METRIC TILE
// ==========================================
function KitchenMetric({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone: string
}) {
  return (
    <div className="kitchen-metric">
      <i className={`metric-dot ${tone}`} />
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  )
}

// ==========================================
// STATUS BADGE
// ==========================================
function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`status-badge ${status.toLowerCase()}`}>
      <i /> {status}
    </span>
  )
}

// ==========================================
// LIVE ELAPSED TIMER (Requirement 16)
// ==========================================
function LiveTimer({ start }: { start: number }) {
  const [time, setTime] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setTime(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const seconds = Math.max(0, Math.floor((time - start) / 1000))
  const minutes = Math.floor(seconds / 60)
  const remainingSecs = seconds % 60

  const formatted = `${String(minutes).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`

  return (
    <span className={seconds > 1200 ? 'timer attention' : seconds > 600 ? 'timer warning' : 'timer'}>
      {formatted}
    </span>
  )
}

// ==========================================
// EMPTY STATE (Requirement 20)
// ==========================================
function KitchenEmptyState({
  tab,
  onReset,
}: {
  tab: FilterTab
  onReset: () => void
}) {
  return (
    <div className="kitchen-empty">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#f8efe7] text-[#a67055]">
          <Coffee size={30} />
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#2c211b]">
          {tab === 'PREPARING'
            ? 'No orders are being prepared'
            : tab === 'READY'
            ? 'No orders waiting to be served'
            : tab === 'NEW'
            ? 'No new orders in the queue'
            : 'Kitchen Clear'}
        </h3>
        <p className="mt-1 text-xs text-[#796b63]">
          {tab === 'ALL'
            ? 'All customer orders have been prepared and completed.'
            : 'New customer orders from tables will appear here in real time.'}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-[#c99475] bg-white px-4 py-2 text-xs font-bold text-[#9a6245] hover:bg-[#fcf3ec]"
        >
          <RefreshCw size={13} /> Load Sample Orders
        </button>
      </div>
    </div>
  )
}
