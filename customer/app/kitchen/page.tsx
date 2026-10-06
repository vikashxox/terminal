'use client'

import { useEffect, useState } from 'react'
import {
  Bell,
  Check,
  ChevronDown,
  Clock3,
  Coffee,
  Eye,
  Filter,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'

type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED'
type PaymentStatus = 'PAID' | 'UNPAID' | 'PENDING'
type KitchenStatus = 'Online' | 'Busy' | 'Paused' | 'Offline'
type OrderItem = { name: string; quantity: number }
type Order = { id: number; table: number; items: OrderItem[]; instruction?: string; orderedAt: number; status: OrderStatus; payment: PaymentStatus; timeline: { label: string; time?: string }[] }

const now = Date.now()
const seedOrders: Order[] = [
  { id: 1048, table: 12, items: [{ name: 'Chicken Burger', quantity: 2 }, { name: 'French Fries', quantity: 1 }, { name: 'Cold Coffee', quantity: 2 }], instruction: 'No onions', orderedAt: now - 4 * 60 * 1000 - 32 * 1000, status: 'NEW', payment: 'PENDING', timeline: [{ label: 'Order Received', time: '7:32 PM' }] },
  { id: 1049, table: 8, items: [{ name: 'Chicken Pizza', quantity: 1 }, { name: 'Cappuccino', quantity: 2 }], orderedAt: now - 2 * 60 * 1000 - 10 * 1000, status: 'NEW', payment: 'PAID', timeline: [{ label: 'Order Received', time: '7:34 PM' }] },
  { id: 1050, table: 5, items: [{ name: 'Veg Burger', quantity: 2 }, { name: 'French Fries', quantity: 1 }], orderedAt: now - 60 * 1000, status: 'NEW', payment: 'PENDING', timeline: [{ label: 'Order Received', time: '7:35 PM' }] },
  { id: 1045, table: 3, items: [{ name: 'Cold Coffee', quantity: 2 }, { name: 'Chocolate Cake', quantity: 1 }], orderedAt: now - 12 * 60 * 1000, status: 'PREPARING', payment: 'PAID', timeline: [{ label: 'Order Received', time: '7:22 PM' }, { label: 'Accepted', time: '7:23 PM' }, { label: 'Preparing', time: '7:25 PM' }] },
  { id: 1046, table: 15, items: [{ name: 'Chicken Pizza', quantity: 1 }, { name: 'Veg Burger', quantity: 1 }], orderedAt: now - 9 * 60 * 1000, status: 'PREPARING', payment: 'PENDING', timeline: [{ label: 'Order Received', time: '7:25 PM' }, { label: 'Accepted', time: '7:26 PM' }, { label: 'Preparing', time: '7:27 PM' }] },
  { id: 1042, table: 9, items: [{ name: 'Cappuccino', quantity: 2 }, { name: 'French Fries', quantity: 1 }], orderedAt: now - 18 * 60 * 1000, status: 'READY', payment: 'PAID', timeline: [{ label: 'Order Received', time: '7:16 PM' }, { label: 'Accepted', time: '7:17 PM' }, { label: 'Preparing', time: '7:19 PM' }, { label: 'Ready', time: '7:28 PM' }] },
]
const statuses: Array<'ALL' | OrderStatus> = ['ALL', 'NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED']
const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = { NEW: 'ACCEPTED', ACCEPTED: 'PREPARING', PREPARING: 'READY', READY: 'SERVED', SERVED: 'COMPLETED' }
const actionLabel: Partial<Record<OrderStatus, string>> = { NEW: 'Accept Order', ACCEPTED: 'Start Preparing', PREPARING: 'Mark Ready', READY: 'Mark Served', SERVED: 'Complete' }

export default function KitchenPage() {
  const [orders, setOrders] = useState(seedOrders)
  const [tab, setTab] = useState<typeof statuses[number]>('ALL')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [kitchenStatus, setKitchenStatus] = useState<KitchenStatus>('Online')
  const [sound, setSound] = useState(true)
  const [clock, setClock] = useState(new Date())
  const [connected, setConnected] = useState(true)

  useEffect(() => { const timer = window.setInterval(() => setClock(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  const visibleOrders = orders.filter((order) => (tab === 'ALL' || order.status === tab) && `${order.id} ${order.table}`.includes(query))
  const count = (status: OrderStatus) => orders.filter((order) => order.status === status).length

  function advance(order: Order) {
    const status = nextStatus[order.status]
    if (!status) return
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status, timeline: [...item.timeline, { label: status === 'ACCEPTED' ? 'Accepted' : status[0] + status.slice(1).toLowerCase(), time: clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }] } : item))
    setSelected(null)
  }

  return <div className="kitchen-shell">
    <KitchenSidebar status={kitchenStatus} />
    <main className="kitchen-main">
      <header className="kitchen-header">
        <div className="kitchen-title"><button className="kitchen-menu" aria-label="Open navigation"><Menu /></button><div><p className="kitchen-kicker">TERMINAL <span>2</span> · COIMBATORE</p><h1>Kitchen Monitor</h1></div></div>
        <div className="kitchen-header-actions"><div className="kitchen-clock"><Clock3 /> <strong>{clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong></div><div className="kitchen-online"><i className={connected ? 'online-dot' : 'offline-dot'} /> {connected ? 'Kitchen Online' : 'Connection interrupted'}</div><button className="kitchen-icon" onClick={() => setSound(!sound)} aria-label={sound ? 'Mute notifications' : 'Unmute notifications'}>{sound ? <Volume2 /> : <VolumeX />}</button><button className="staff-avatar" aria-label="Kitchen staff">KS</button></div>
      </header>
      <div className="kitchen-toolbar"><div className="kitchen-tabs">{statuses.map((status) => <button key={status} className={tab === status ? 'active' : ''} onClick={() => setTab(status)}>{status}<span>{status === 'ALL' ? orders.filter((o) => o.status !== 'COMPLETED').length : count(status)}</span></button>)}</div><div className="kitchen-filters"><div className="kitchen-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order or table" aria-label="Search order or table" /></div><button className="kitchen-filter"><Filter /> Filters</button><button className="kitchen-filter" onClick={() => setConnected(true)}><RefreshCw /> Sync</button></div></div>
      {!connected && <div className="connection-warning"><span><Bell /> <strong>Connection interrupted</strong><small>Orders may not update until the connection is restored.</small></span><button onClick={() => setConnected(true)}>Retry Connection</button></div>}
      <section className="kitchen-metrics"><KitchenMetric label="New orders" value={count('NEW')} tone="new" /><KitchenMetric label="Preparing" value={count('PREPARING')} tone="preparing" /><KitchenMetric label="Ready to serve" value={count('READY')} tone="ready" /><KitchenMetric label="Average preparation" value="12 min" tone="neutral" /></section>
      {kitchenStatus === 'Paused' && <div className="pause-banner"><Pause /> <span><strong>Kitchen Paused</strong><small>New orders are temporarily paused.</small></span></div>}
      <div className="board-heading"><div><p className="kitchen-kicker">LIVE ORDER QUEUE</p><h2>{tab === 'ALL' ? 'All active orders' : `${tab[0] + tab.slice(1).toLowerCase()} orders`}</h2></div><span>{visibleOrders.length} orders</span></div>
      {visibleOrders.length ? <div className="order-board">{visibleOrders.map((order) => <OrderCard key={order.id} order={order} onAdvance={() => advance(order)} onDetails={() => setSelected(order)} />)}</div> : <EmptyState status={tab} />}
    </main>
    {selected && <OrderDetails order={selected} onClose={() => setSelected(null)} onAdvance={() => advance(selected)} />}
  </div>
}

function KitchenSidebar({ status }: { status: KitchenStatus }) { return <aside className="kitchen-sidebar"><div className="kitchen-logo"><Coffee /><span>TERMINAL <b>2</b><small>Kitchen operations</small></span></div><nav><p>WORKSPACE</p><a className="selected"><LayoutDashboard /> Kitchen <b>Live</b></a><a><Bell /> Orders <b>6</b></a><a><Play /> Preparing <b>2</b></a><a><Check /> Ready <b>1</b></a><a><Clock3 /> Completed</a><p>MANAGE</p><a><Settings /> Settings</a></nav><div className="sidebar-staff"><div className="staff-avatar">KS</div><span><strong>Kitchen Staff</strong><small><i className={status === 'Offline' ? 'offline-dot' : 'online-dot'} /> {status}</small></span><MoreHorizontal /></div></aside> }
function KitchenMetric({ label, value, tone }: { label: string; value: number | string; tone: string }) { return <div className="kitchen-metric"><i className={`metric-dot ${tone}`} /><span><small>{label}</small><strong>{value}</strong></span></div> }
function OrderCard({ order, onAdvance, onDetails }: { order: Order; onAdvance: () => void; onDetails: () => void }) { return <article className={`kitchen-order ${order.status.toLowerCase()}`}><div className="order-card-top"><div><span className="order-number">#{order.id}</span><span className="table-number">TABLE {order.table}</span></div><StatusBadge status={order.status} /></div><div className="order-items">{order.items.map((item) => <div key={item.name}><b>{item.quantity} ×</b><span>{item.name}</span></div>)}</div>{order.instruction && <div className="special-note"><small>SPECIAL INSTRUCTION</small><strong>{order.instruction}</strong></div>}<div className="order-card-foot"><span className="waiting"><Clock3 /> <Timer start={order.orderedAt} /></span><span className={`payment ${order.payment.toLowerCase()}`}>{order.payment === 'PENDING' ? 'PAY AT COUNTER' : order.payment}</span></div><div className="order-actions">{actionLabel[order.status] && <button className="order-primary" onClick={onAdvance}>{actionLabel[order.status]}</button>}<button className="order-secondary" onClick={onDetails}><Eye /> View details</button></div></article> }
function StatusBadge({ status }: { status: OrderStatus }) { return <span className={`status-badge ${status.toLowerCase()}`}><i /> {status}</span> }
function Timer({ start }: { start: number }) { const [time, setTime] = useState(Date.now()); useEffect(() => { const timer = window.setInterval(() => setTime(Date.now()), 1000); return () => window.clearInterval(timer) }, []); const seconds = Math.max(0, Math.floor((time - start) / 1000)); return <span className={seconds > 1200 ? 'timer attention' : seconds > 600 ? 'timer warning' : 'timer'}>{String(Math.floor(seconds / 3600)).padStart(2, '0')}:{String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span> }
function EmptyState({ status }: { status: string }) { return <div className="kitchen-empty"><div><Coffee /><h3>{status === 'PREPARING' ? 'No orders are being prepared' : status === 'READY' ? 'No orders are ready to serve' : 'No new orders'}</h3><p>New customer orders will appear here.</p></div></div> }
function OrderDetails({ order, onClose, onAdvance }: { order: Order; onClose: () => void; onAdvance: () => void }) { return <div className="details-backdrop" onClick={onClose}><aside className="order-details" onClick={(event) => event.stopPropagation()}><div className="details-header"><div><p className="kitchen-kicker">ORDER DETAILS</p><h2>#{order.id}</h2></div><button className="kitchen-icon" onClick={onClose} aria-label="Close details"><X /></button></div><div className="details-table"><span>TABLE</span><strong>{order.table}</strong><span>PAYMENT</span><strong className="paid-text">{order.payment === 'PENDING' ? 'PAY AT COUNTER' : order.payment}</strong></div><StatusBadge status={order.status} /><h3>Order items</h3><div className="details-items">{order.items.map((item) => <div key={item.name}><span>{item.name}</span><b>× {item.quantity}</b></div>)}</div>{order.instruction && <div className="details-instruction"><small>Special instructions</small><p>{order.instruction}</p></div>}<h3>Timeline</h3><div className="details-timeline">{order.timeline.map((item, index) => <div key={`${item.label}-${index}`}><i className="online-dot" /><span>{item.label}<small>{item.time || 'In progress'}</small></span></div>)}</div>{actionLabel[order.status] && <button className="order-primary full" onClick={onAdvance}>{actionLabel[order.status]} <ChevronDown /></button>}</aside></div> }

export type { KitchenStatus, Order, OrderItem, OrderStatus, PaymentStatus }
