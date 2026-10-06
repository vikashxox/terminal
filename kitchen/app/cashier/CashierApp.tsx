"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Bell, Calculator, Check, ChevronRight, CircleDollarSign, CreditCard, FileText, LayoutDashboard, LogOut, Menu, Printer, Receipt, Search, Settings, Table2, UserRound, WalletCards, X } from "lucide-react"

type PaymentMethod = "CASH" | "UPI" | "CARD"
type PaymentStatus = "PAID" | "UNPAID" | "PARTIALLY PAID" | "PENDING" | "FAILED"
type TableStatus = "AVAILABLE" | "OCCUPIED" | "PAYMENT PENDING" | "PAID" | "CLOSING"

type Order = { id: string; table: string; time: string; items: string[]; total: number; orderStatus: string; paymentStatus: PaymentStatus; paid: number }
type TableSession = { table: string; session: string; started: string; orders: Order[]; status: TableStatus }

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`

const seedOrders: Order[] = [
  { id: "#1048", table: "T12", time: "7:20 PM", items: ["Chicken Burger × 2", "French Fries × 1"], total: 420, orderStatus: "SERVED", paymentStatus: "PAID", paid: 420 },
  { id: "#1053", table: "T12", time: "7:38 PM", items: ["Cold Coffee × 2", "Chocolate Cake × 1"], total: 315, orderStatus: "SERVED", paymentStatus: "UNPAID", paid: 0 },
  { id: "#1058", table: "T12", time: "7:48 PM", items: ["Paneer Wrap × 2", "Lime Soda × 1"], total: 350, orderStatus: "READY", paymentStatus: "UNPAID", paid: 0 },
  { id: "#1042", table: "T02", time: "7:02 PM", items: ["Margherita Pizza × 1"], total: 420, orderStatus: "SERVED", paymentStatus: "UNPAID", paid: 0 },
  { id: "#1038", table: "T03", time: "6:44 PM", items: ["Pasta Alfredo × 2"], total: 850, orderStatus: "COMPLETED", paymentStatus: "PAID", paid: 850 },
]

const tables: TableSession[] = [
  { table: "T01", session: "—", started: "—", orders: [], status: "AVAILABLE" },
  { table: "T02", session: "#7818", started: "6:48 PM", orders: seedOrders.filter((order) => order.table === "T02"), status: "PAYMENT PENDING" },
  { table: "T03", session: "#7819", started: "6:31 PM", orders: seedOrders.filter((order) => order.table === "T03"), status: "PAID" },
  { table: "T04", session: "—", started: "—", orders: [], status: "AVAILABLE" },
  { table: "T05", session: "#7820", started: "7:02 PM", orders: [{ id: "#1039", table: "T05", time: "7:10 PM", items: ["Chicken Biryani × 1"], total: 320, orderStatus: "SERVED", paymentStatus: "UNPAID", paid: 0 }], status: "OCCUPIED" },
  { table: "T08", session: "#7822", started: "7:12 PM", orders: [{ id: "#1045", table: "T08", time: "7:20 PM", items: ["Club Sandwich × 2"], total: 540, orderStatus: "SERVED", paymentStatus: "PARTIALLY PAID", paid: 270 }], status: "OCCUPIED" },
  { table: "T09", session: "—", started: "—", orders: [], status: "AVAILABLE" },
  { table: "T12", session: "#7821", started: "7:15 PM", orders: seedOrders.filter((order) => order.table === "T12"), status: "OCCUPIED" },
]

const nav = [
  ["Dashboard", "/cashier", LayoutDashboard], ["Active Tables", "/cashier/tables", Table2], ["Orders", "/cashier/orders", Receipt], ["Bills", "/cashier/bills", FileText], ["Payments", "/cashier/payments", WalletCards], ["Settings", "/cashier/settings", Settings],
] as const

export function CashierApp({ view = "dashboard" }: { view?: string }) {
  const [selectedTable, setSelectedTable] = useState<TableSession | null>(view === "tables" ? tables[7] : null)
  const [orders, setOrders] = useState(seedOrders)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI")
  const [received, setReceived] = useState("500")
  const [paidOverride, setPaidOverride] = useState<number | null>(null)
  const [notice, setNotice] = useState("")

  const activeSession = useMemo(() => selectedTable ? { ...selectedTable, orders: orders.filter((order) => order.table === selectedTable.table) } : null, [selectedTable, orders])
  const sessionSubtotal = activeSession?.orders.reduce((sum, order) => sum + order.total, 0) ?? 0
  const sessionTax = Math.round(sessionSubtotal * 0.05)
  const total = sessionSubtotal + sessionTax
  const paid = paidOverride ?? (activeSession?.orders.reduce((sum, order) => sum + order.paid, 0) ?? 0)
  const balance = Math.max(total - paid, 0)

  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2800) }
  const openTable = (table: TableSession) => { if (table.orders.length) setSelectedTable(table); else notify(`${table.table} is available`) }
  const completePayment = () => {
    const amount = paymentMethod === "CASH" ? Math.min(Number(received) || 0, balance) : balance
    if (amount < balance && paymentMethod !== "CASH") return
    setPaidOverride(paid + amount)
    setOrders((current) => current.map((order) => order.table === activeSession?.table && order.paymentStatus !== "PAID" ? { ...order, paymentStatus: "PAID", paid: order.total } : order))
    setPaymentOpen(false)
    notify("Payment completed successfully")
  }

  return <div className="cashier-shell">
    <aside className="cashier-sidebar">
      <div className="cashier-brand"><span className="cashier-brand-mark"><Calculator /></span><span><strong>TERMINAL <b>2</b></strong><small>Cashier</small></span></div>
      <nav className="cashier-nav"><p>WORKSPACE</p>{nav.map(([label, href, Icon]) => <Link key={label} href={href} className={(view === "dashboard" && label === "Dashboard") || view === label.toLowerCase().split(" ")[1] ? "active" : ""}><Icon />{label}{label === "Payments" && <em>7</em>}</Link>)}</nav>
      <div className="cashier-staff"><span className="cashier-avatar">VK</span><span><strong>Vikash Kumar</strong><small><i /> Online</small></span><LogOut /></div>
    </aside>
    <main className="cashier-main">
      <header className="cashier-header"><div><p className="cashier-kicker">TERMINAL 2 / CASHIER</p><h1>{view === "dashboard" ? "Cashier Dashboard" : view === "tables" ? "Active Tables" : view[0]?.toUpperCase() + view.slice(1)}</h1><p>Manage tables, orders and payments</p></div><div className="cashier-header-actions"><span className="cashier-clock">06 OCT 2026 <b>07:55 PM</b></span><button className="cashier-icon" aria-label="Notifications"><Bell /><i /></button><span className="cashier-profile">VK</span></div></header>
      {view === "dashboard" && <Dashboard onTable={openTable} />}
      {view === "tables" && <Tables onTable={openTable} />}
      {view === "orders" && <Orders orders={orders} />}
      {view === "bills" && <Bills orders={orders} />}
      {view === "payments" && <Payments />}
      {view === "settings" && <div className="cashier-empty"><Settings /><h2>Settings</h2><p>Cashier preferences will appear here.</p></div>}
    </main>
    {activeSession && <SessionPanel session={activeSession} subtotal={sessionSubtotal} tax={sessionTax} total={total} paid={paid} balance={balance} onClose={() => setSelectedTable(null)} onPay={() => setPaymentOpen(true)} onNotice={notify} />}
    {paymentOpen && <PaymentPanel method={paymentMethod} setMethod={setPaymentMethod} received={received} setReceived={setReceived} due={balance} onClose={() => setPaymentOpen(false)} onComplete={completePayment} />}
    {notice && <div className="cashier-toast"><Check />{notice}</div>}
  </div>
}

function Dashboard({ onTable }: { onTable: (table: TableSession) => void }) { return <><section className="cashier-metrics">{[["TODAY'S SALES", "₹42,850", "+12.4% from yesterday"], ["ACTIVE TABLES", "18", "4 ready for billing"], ["PENDING PAYMENTS", "7", "₹3,480 outstanding"], ["TODAY'S ORDERS", "148", "22 orders this hour"]].map(([label, value, note]) => <div className="cashier-metric" key={label}><span className="metric-icon"><CircleDollarSign /></span><small>{label}</small><strong>{value}</strong><em>{note}</em></div>)}</section><div className="cashier-grid-two"><section className="cashier-panel"><div className="panel-heading"><div><p className="section-label">ACTION NEEDED</p><h2>Pending Payments</h2></div><Link href="/cashier/payments">View all <ChevronRight /></Link></div><div className="pending-row"><span className="table-avatar">T12</span><span><strong>Table 12 · Session #7821</strong><small>3 orders · Last order 7:48 PM</small></span><b>₹665</b><button onClick={() => onTable(tables[7])}>COLLECT</button></div><div className="pending-row"><span className="table-avatar">T08</span><span><strong>Table 08 · Session #7822</strong><small>Partially paid · 1 order</small></span><b>₹270</b><button onClick={() => onTable(tables[5])}>COLLECT</button></div></section><section className="cashier-panel sales-panel"><div className="panel-heading"><div><p className="section-label">TODAY</p><h2>Payment Split</h2></div><span className="sales-total">₹42,850</span></div><div className="sales-bar"><i /><i /><i /></div><div className="split-legend"><span><i className="cash" />Counter payments <b>₹12,450</b></span><span><i className="online" />Online payments <b>₹30,400</b></span></div></section></div><section className="cashier-panel recent-panel"><div className="panel-heading"><div><p className="section-label">LIVE ACTIVITY</p><h2>Recent Orders</h2></div><Link href="/cashier/orders">View orders <ChevronRight /></Link></div><OrdersTable orders={seedOrders.slice(0, 4)} /></section></> }

function Tables({ onTable }: { onTable: (table: TableSession) => void }) { return <section className="tables-view"><div className="view-toolbar"><div><p className="section-label">DINING FLOOR</p><h2>Table overview</h2></div><div className="table-legend"><span><i className="available" />Available</span><span><i className="occupied" />Occupied</span><span><i className="pending" />Payment pending</span></div></div><div className="table-grid">{tables.map((table) => { const subtotal = table.orders.reduce((s, o) => s + o.total, 0); const paid = table.orders.reduce((s, o) => s + o.paid, 0); return <button className={`table-tile ${table.status.toLowerCase().replaceAll(" ", "-")}`} key={table.table} onClick={() => onTable(table)}><div className="table-tile-top"><span>{table.table}</span><b>{table.status}</b></div>{table.orders.length ? <><strong>{money(subtotal)}</strong><small>{table.session} · {table.orders.length} {table.orders.length === 1 ? "order" : "orders"}</small><p>{paid ? `${money(paid)} paid · ` : ""}{money(Math.max(subtotal - paid, 0))} remaining</p><em>VIEW SESSION <ChevronRight /></em></> : <div className="available-copy"><Check /><span>Ready for guests</span></div>}</button> })}</div></section> }

function Orders({ orders }: { orders: Order[] }) { return <section className="cashier-panel full-panel"><div className="view-toolbar"><div><p className="section-label">ORDER REGISTER</p><h2>All orders</h2></div><div className="cashier-search"><Search /><input placeholder="Search order #" /></div></div><OrdersTable orders={orders} /></section> }
function OrdersTable({ orders }: { orders: Order[] }) { return <div className="cashier-table-wrap"><table className="cashier-table"><thead><tr><th>ORDER</th><th>TABLE</th><th>TIME</th><th>ITEMS</th><th>TOTAL</th><th>ORDER STATUS</th><th>PAYMENT</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.table}</td><td>{order.time}</td><td>{order.items.length} items</td><td><strong>{money(order.total)}</strong></td><td><span className="status-badge served">{order.orderStatus}</span></td><td><span className={`status-badge ${order.paymentStatus.toLowerCase().replaceAll(" ", "-")}`}>{order.paymentStatus}</span></td></tr>)}</tbody></table></div> }
function Bills({ orders }: { orders: Order[] }) { return <section className="cashier-panel full-panel"><div className="view-toolbar"><div><p className="section-label">BILLING REGISTER</p><h2>Invoices</h2></div><button className="brown-button"><FileText /> Generate bill</button></div><div className="cashier-table-wrap"><table className="cashier-table"><thead><tr><th>BILL NUMBER</th><th>TABLE</th><th>SESSION</th><th>TOTAL</th><th>PAID</th><th>BALANCE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody><tr><td><strong>INV-2026-001048</strong></td><td>T12</td><td>#7821</td><td>{money(1140)}</td><td>{money(420)}</td><td><strong>{money(720)}</strong></td><td><span className="status-badge partially-paid">PARTIALLY PAID</span></td><td><button className="row-action"><Printer /></button><button className="row-action"><FileText /></button></td></tr>{orders.slice(3).map((order) => <tr key={order.id}><td><strong>INV-2026-001042</strong></td><td>{order.table}</td><td>#7818</td><td>{money(order.total)}</td><td>{money(order.paid)}</td><td>{money(order.total - order.paid)}</td><td><span className="status-badge unpaid">UNPAID</span></td><td><button className="row-action"><Printer /></button></td></tr>)}</tbody></table></div></section> }
function Payments() { return <section className="cashier-panel full-panel"><div className="view-toolbar"><div><p className="section-label">PAYMENT HISTORY</p><h2>Payments</h2></div><div className="filter-pills"><button className="active">Today</button><button>This week</button><button>This month</button></div></div><div className="cashier-table-wrap"><table className="cashier-table"><thead><tr><th>PAYMENT ID</th><th>BILL</th><th>TABLE</th><th>AMOUNT</th><th>METHOD</th><th>STATUS</th><th>TIME</th><th>CASHIER</th></tr></thead><tbody><tr><td><strong>PAY-00128</strong></td><td>INV-2026-001048</td><td>T12</td><td><strong>₹483</strong></td><td><span className="method"><CreditCard /> UPI</span></td><td><span className="status-badge paid">SUCCESS</span></td><td>7:56 PM</td><td>Vikash</td></tr><tr><td><strong>PAY-00127</strong></td><td>INV-2026-001044</td><td>T08</td><td><strong>₹270</strong></td><td><span className="method"><CircleDollarSign /> Cash</span></td><td><span className="status-badge paid">SUCCESS</span></td><td>7:49 PM</td><td>Vikash</td></tr></tbody></table></div></section> }

function SessionPanel({ session, subtotal, tax, total, paid, balance, onClose, onPay, onNotice }: { session: TableSession; subtotal: number; tax: number; total: number; paid: number; balance: number; onClose: () => void; onPay: () => void; onNotice: (s: string) => void }) { return <div className="session-backdrop"><section className="session-panel"><header><div><p className="section-label">TABLE SESSION</p><h2>{session.table} <span>{session.session}</span></h2><p>Started {session.started} · {session.orders.length} orders</p></div><button className="close-button" onClick={onClose} aria-label="Close session"><X /></button></header><div className="session-orders">{session.orders.map((order) => <article key={order.id}><div><strong>{order.id}</strong><small>{order.time} · {order.orderStatus}</small>{order.items.map((item) => <span key={item}>{item}</span>)}</div><div><b>{money(order.total)}</b><span className={`status-badge ${order.paymentStatus.toLowerCase().replaceAll(" ", "-")}`}>{order.paymentStatus}</span></div></article>)}</div><div className="balance-card"><span><small>SUBTOTAL</small><b>{money(subtotal)}</b></span><span><small>TAXES 5%</small><b>{money(tax)}</b></span><span><small>GRAND TOTAL</small><b>{money(total)}</b></span><span className="paid-line"><small>PAID</small><b>{money(paid)}</b></span><span className="due-line"><small>REMAINING</small><b>{money(balance)}</b></span></div><div className="session-actions"><button className="outline-button" onClick={() => onNotice("Invoice preview ready to print") }><Printer /> Print bill</button>{balance > 0 ? <button className="brown-button" onClick={onPay}><WalletCards /> Collect {money(balance)}</button> : <button className="brown-button" onClick={() => onNotice("Table is fully paid and ready to close")}>Close table</button>}</div>{balance > 0 && <p className="payment-warning">Payment required · {money(balance)} remains unpaid.</p>}</section></div> }
function PaymentPanel({ method, setMethod, received, setReceived, due, onClose, onComplete }: { method: PaymentMethod; setMethod: (m: PaymentMethod) => void; received: string; setReceived: (s: string) => void; due: number; onClose: () => void; onComplete: () => void }) { const change = Math.max((Number(received) || 0) - due, 0); return <div className="modal-backdrop"><section className="payment-panel"><header><div><p className="section-label">COUNTER PAYMENT</p><h2>Collect payment</h2><p>INV-2026-001048 · Table 12</p></div><button className="close-button" onClick={onClose}><X /></button></header><div className="payment-total"><span>Balance due</span><strong>{money(due)}</strong></div><div className="payment-methods">{(["CASH", "UPI", "CARD"] as PaymentMethod[]).map((item) => <button className={method === item ? "selected" : ""} key={item} onClick={() => setMethod(item)}>{item === "CASH" ? <CircleDollarSign /> : item === "UPI" ? <CreditCard /> : <WalletCards />}<b>{item}</b><small>{item === "CASH" ? "Collect notes" : item === "UPI" ? "Scan or transfer" : "Swipe or tap"}</small></button>)}</div>{method === "CASH" ? <div className="cash-entry"><label>Amount received<input value={received} onChange={(e) => setReceived(e.target.value)} inputMode="numeric" /></label><div><span>Amount due <b>{money(due)}</b></span><span>Received <b>{money(Number(received) || 0)}</b></span><span>Change <b>{money(change)}</b></span></div></div> : <div className="waiting-payment"><span><i /> Waiting for payment</span><p>Confirm once the {method.toLowerCase()} payment has been received.</p></div>}<button className="brown-button complete-button" onClick={onComplete}><Check /> {method === "CASH" ? "Complete payment" : "Mark payment received"}</button></section></div> }
