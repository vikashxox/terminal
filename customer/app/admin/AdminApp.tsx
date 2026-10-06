"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertCircle, BarChart3, Bell, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleDollarSign, ClipboardList, Clock, Copy, CreditCard, Download, Edit2,
  FileText, Filter, Grid2X2, Info, LayoutDashboard, LogOut, MoreHorizontal,
  Pencil, Plus, Printer, QrCode, Receipt, RotateCcw, Search, Settings, Shield,
  ShieldCheck, Sliders, Store, Table2, Tags, Trash2, Users, UtensilsCrossed,
  WalletCards, X, XCircle, ChevronUp, Move, Eye, EyeOff, Star
} from "lucide-react"

// ============================================================
// TYPES
// ============================================================
export type View = "dashboard"|"orders"|"menu"|"categories"|"tables"|"qr"|"bills"|"payments"|"reports"|"staff"|"settings"
type OrderStatus = "NEW"|"ACCEPTED"|"PREPARING"|"READY"|"SERVED"|"COMPLETED"
type PaymentStatus = "PAID"|"UNPAID"|"PARTIALLY PAID"|"PENDING"|"FAILED"|"REFUNDED"
type TableStatus = "AVAILABLE"|"OCCUPIED"|"PAYMENT PENDING"|"PAID"|"CLOSING"|"CLOSED"
type FoodType = "Veg"|"Non-Veg"
type StaffRole = "Admin"|"Cashier"|"Kitchen Staff"
type StaffStatus = "Active"|"Inactive"

interface MenuItem {
  id: number; name: string; description: string; category: string; price: number
  tax: number; available: boolean; featured: boolean; orders: number; type: FoodType
  addons: { name: string; price: number }[]
}
interface Category { id: number; name: string; displayOrder: number; active: boolean; itemCount: number }
interface AdminTable { id: string; label: string; capacity: number; status: TableStatus; session: string; orders: number; total: number; paid: number; qrActive: boolean }
interface AdminOrder {
  id: string; table: string; session: string; time: string; date: string
  items: { name: string; qty: number; price: number; customization?: string }[]
  specialInstructions?: string; subtotal: number; tax: number; total: number
  orderStatus: OrderStatus; paymentStatus: PaymentStatus; paid: number; cashier: string
}
interface AdminBill { id: string; table: string; session: string; date: string; time: string; subtotal: number; tax: number; total: number; paid: number; balance: number; status: PaymentStatus }
interface AdminPayment { id: string; billId: string; table: string; session: string; amount: number; method: string; status: string; date: string; time: string; cashier: string; reference: string; refundReason?: string }
interface StaffMember { id: number; name: string; email: string; phone: string; role: StaffRole; status: StaffStatus; lastActive: string; permissions: string[] }

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`

// ============================================================
// MOCK DATA
// ============================================================
const ALL_PERMISSIONS = ["View Orders","Manage Menu","Manage Categories","Manage Tables","Manage Bills","Manage Payments","View Reports","Manage Staff","Manage Settings"]

const initMenu: MenuItem[] = [
  { id:1, name:"Chicken Burger", description:"Juicy grilled chicken patty with lettuce, tomato and special sauce", category:"Burgers", price:180, tax:5, available:true, featured:true, orders:82, type:"Non-Veg", addons:[{name:"Extra Cheese",price:30},{name:"Extra Patty",price:60},{name:"Extra Sauce",price:20}] },
  { id:2, name:"Veg Burger", description:"Crispy plant-based patty with fresh vegetables and mayo", category:"Burgers", price:150, tax:5, available:true, featured:false, orders:31, type:"Veg", addons:[{name:"Extra Cheese",price:30},{name:"Extra Sauce",price:20}] },
  { id:3, name:"French Fries", description:"Golden crispy fries seasoned with sea salt and herbs", category:"Snacks", price:100, tax:5, available:true, featured:false, orders:63, type:"Veg", addons:[{name:"Cheese Dip",price:25},{name:"Sriracha",price:15}] },
  { id:4, name:"Cold Coffee", description:"Chilled blended coffee with milk and ice cream", category:"Beverages", price:120, tax:5, available:true, featured:true, orders:76, type:"Veg", addons:[{name:"Extra Shot",price:20}] },
  { id:5, name:"Cappuccino", description:"Classic espresso topped with steamed milk foam", category:"Coffee", price:110, tax:5, available:false, featured:false, orders:58, type:"Veg", addons:[{name:"Almond Milk",price:20},{name:"Extra Shot",price:20}] },
  { id:6, name:"Latte", description:"Smooth espresso with velvety steamed milk", category:"Coffee", price:130, tax:5, available:true, featured:false, orders:44, type:"Veg", addons:[{name:"Almond Milk",price:20}] },
  { id:7, name:"Chicken Pizza", description:"Hand-tossed pizza with grilled chicken, bell peppers and mozzarella", category:"Pizza", price:280, tax:5, available:true, featured:true, orders:24, type:"Non-Veg", addons:[{name:"Extra Cheese",price:40},{name:"Jalapeños",price:15}] },
  { id:8, name:"Margherita Pizza", description:"Classic tomato base with fresh mozzarella and basil", category:"Pizza", price:240, tax:5, available:true, featured:false, orders:19, type:"Veg", addons:[{name:"Extra Cheese",price:40}] },
  { id:9, name:"Chocolate Cake", description:"Rich moist chocolate layered cake with ganache", category:"Desserts", price:160, tax:5, available:true, featured:false, orders:37, type:"Veg", addons:[] },
  { id:10, name:"Pasta Alfredo", description:"Creamy fettuccine alfredo with fresh herbs and parmesan", category:"Main Course", price:280, tax:5, available:true, featured:false, orders:28, type:"Veg", addons:[{name:"Chicken",price:60},{name:"Extra Parmesan",price:20}] },
]

const initCategories: Category[] = [
  { id:1, name:"Breakfast", displayOrder:1, active:true, itemCount:8 },
  { id:2, name:"Main Course", displayOrder:2, active:true, itemCount:12 },
  { id:3, name:"Burgers", displayOrder:3, active:true, itemCount:6 },
  { id:4, name:"Pizza", displayOrder:4, active:true, itemCount:5 },
  { id:5, name:"Snacks", displayOrder:5, active:true, itemCount:7 },
  { id:6, name:"Coffee", displayOrder:6, active:true, itemCount:9 },
  { id:7, name:"Beverages", displayOrder:7, active:true, itemCount:11 },
  { id:8, name:"Desserts", displayOrder:8, active:true, itemCount:4 },
]

const initTables: AdminTable[] = [
  { id:"T01", label:"Table 01", capacity:2, status:"AVAILABLE", session:"—", orders:0, total:0, paid:0, qrActive:true },
  { id:"T02", label:"Table 02", capacity:4, status:"OCCUPIED", session:"#7818", orders:1, total:420, paid:0, qrActive:true },
  { id:"T03", label:"Table 03", capacity:2, status:"OCCUPIED", session:"#7819", orders:1, total:850, paid:850, qrActive:true },
  { id:"T04", label:"Table 04", capacity:4, status:"AVAILABLE", session:"—", orders:0, total:0, paid:0, qrActive:false },
  { id:"T05", label:"Table 05", capacity:6, status:"OCCUPIED", session:"#7820", orders:1, total:320, paid:0, qrActive:true },
  { id:"T08", label:"Table 08", capacity:4, status:"OCCUPIED", session:"#7822", orders:1, total:540, paid:270, qrActive:true },
  { id:"T09", label:"Table 09", capacity:2, status:"AVAILABLE", session:"—", orders:0, total:0, paid:0, qrActive:true },
  { id:"T10", label:"Table 10", capacity:6, status:"AVAILABLE", session:"—", orders:0, total:0, paid:0, qrActive:false },
  { id:"T12", label:"Table 12", capacity:4, status:"PAYMENT PENDING", session:"#7825", orders:3, total:1085, paid:350, qrActive:true },
]

const initOrders: AdminOrder[] = [
  { id:"#1048", table:"T12", session:"#7825", time:"7:12 PM", date:"06 Oct 2026", items:[{name:"Chicken Burger",qty:1,price:200},{name:"Cold Coffee",qty:1,price:150}], subtotal:350, tax:18, total:368, specialInstructions:"Regular ice in coffee", orderStatus:"SERVED", paymentStatus:"PAID", paid:368, cashier:"Vikash Kumar" },
  { id:"#1049", table:"T12", session:"#7825", time:"7:28 PM", date:"06 Oct 2026", items:[{name:"Pasta Alfredo",qty:1,price:320,customization:"Extra Parmesan"},{name:"French Fries",qty:1,price:100}], subtotal:420, tax:21, total:441, specialInstructions:"Less spicy", orderStatus:"SERVED", paymentStatus:"UNPAID", paid:0, cashier:"Vikash Kumar" },
  { id:"#1050", table:"T12", session:"#7825", time:"7:44 PM", date:"06 Oct 2026", items:[{name:"Margherita Pizza",qty:1,price:265},{name:"Lime Soda",qty:1,price:50}], subtotal:315, tax:16, total:331, specialInstructions:"Crispy crust on pizza", orderStatus:"PREPARING", paymentStatus:"UNPAID", paid:0, cashier:"Vikash Kumar" },
  { id:"#1042", table:"T02", session:"#7818", time:"7:02 PM", date:"06 Oct 2026", items:[{name:"Margherita Pizza",qty:1,price:340},{name:"Garlic Bread",qty:1,price:80}], subtotal:420, tax:21, total:441, orderStatus:"SERVED", paymentStatus:"UNPAID", paid:0, cashier:"Priya Menon" },
  { id:"#1038", table:"T03", session:"#7819", time:"6:44 PM", date:"06 Oct 2026", items:[{name:"Pasta Alfredo",qty:2,price:640},{name:"Tiramisu",qty:1,price:210}], subtotal:850, tax:43, total:893, orderStatus:"COMPLETED", paymentStatus:"PAID", paid:893, cashier:"Vikash Kumar" },
  { id:"#1039", table:"T05", session:"#7820", time:"7:10 PM", date:"06 Oct 2026", items:[{name:"Chicken Biryani",qty:1,price:280},{name:"Raita",qty:1,price:40}], subtotal:320, tax:16, total:336, orderStatus:"SERVED", paymentStatus:"UNPAID", paid:0, cashier:"Priya Menon" },
  { id:"#1045", table:"T08", session:"#7822", time:"7:20 PM", date:"06 Oct 2026", items:[{name:"Club Sandwich",qty:2,price:440},{name:"Iced Tea",qty:1,price:100}], subtotal:540, tax:27, total:567, orderStatus:"SERVED", paymentStatus:"PARTIALLY PAID", paid:270, cashier:"Vikash Kumar" },
]

const initBills: AdminBill[] = [
  { id:"INV-2026-001058", table:"T12", session:"#7825", date:"06 Oct 2026", time:"7:48 PM", subtotal:1085, tax:54, total:1139, paid:350, balance:789, status:"PARTIALLY PAID" },
  { id:"INV-2026-001045", table:"T08", session:"#7822", date:"06 Oct 2026", time:"7:20 PM", subtotal:540, tax:27, total:567, paid:270, balance:297, status:"PARTIALLY PAID" },
  { id:"INV-2026-001042", table:"T02", session:"#7818", date:"06 Oct 2026", time:"7:02 PM", subtotal:420, tax:21, total:441, paid:0, balance:441, status:"UNPAID" },
  { id:"INV-2026-001038", table:"T03", session:"#7819", date:"06 Oct 2026", time:"6:44 PM", subtotal:850, tax:43, total:893, paid:893, balance:0, status:"PAID" },
]

const initPayments: AdminPayment[] = [
  { id:"PAY-00128", billId:"INV-2026-001058", table:"T12", session:"#7825", amount:350, method:"UPI", status:"SUCCESS", date:"06 Oct 2026", time:"7:25 PM", cashier:"Vikash Kumar", reference:"UPI/26100672589" },
  { id:"PAY-00127", billId:"INV-2026-001045", table:"T08", session:"#7822", amount:270, method:"CASH", status:"SUCCESS", date:"06 Oct 2026", time:"7:21 PM", cashier:"Vikash Kumar", reference:"CSH-2610-09" },
  { id:"PAY-00126", billId:"INV-2026-001038", table:"T03", session:"#7819", amount:893, method:"CARD", status:"SUCCESS", date:"06 Oct 2026", time:"6:58 PM", cashier:"Vikash Kumar", reference:"EDC/TXN-49102" },
  { id:"PAY-00125", billId:"INV-2026-001035", table:"T06", session:"#7815", amount:640, method:"UPI", status:"SUCCESS", date:"06 Oct 2026", time:"6:40 PM", cashier:"Vikash Kumar", reference:"UPI/26100664012" },
  { id:"PAY-00124", billId:"INV-2026-001031", table:"T11", session:"#7812", amount:490, method:"CASH", status:"REFUNDED", date:"06 Oct 2026", time:"6:15 PM", cashier:"Vikash Kumar", reference:"CSH-2610-04", refundReason:"Customer billing dispute" },
]

const initStaff: StaffMember[] = [
  { id:1, name:"Vikash Kumar", email:"vikash@terminal2.in", phone:"+91 98765 43210", role:"Admin", status:"Active", lastActive:"Now", permissions:ALL_PERMISSIONS },
  { id:2, name:"Priya Menon", email:"priya@terminal2.in", phone:"+91 91234 56789", role:"Cashier", status:"Active", lastActive:"2 min ago", permissions:["View Orders","Manage Bills","Manage Payments"] },
  { id:3, name:"Arun Raj", email:"arun@terminal2.in", phone:"+91 98712 34567", role:"Kitchen Staff", status:"Active", lastActive:"8 min ago", permissions:["View Orders"] },
  { id:4, name:"Meena S", email:"meena@terminal2.in", phone:"+91 90001 11223", role:"Cashier", status:"Inactive", lastActive:"Yesterday", permissions:["View Orders","Manage Bills","Manage Payments"] },
]

// ============================================================
// NAV
// ============================================================
const NAV: [string, string, View, React.ComponentType<{className?:string}>][] = [
  ["Dashboard","/admin","dashboard",LayoutDashboard],
  ["Orders","/admin/orders","orders",ClipboardList],
  ["Menu","/admin/menu","menu",UtensilsCrossed],
  ["Categories","/admin/categories","categories",Tags],
  ["Tables","/admin/tables","tables",Table2],
  ["QR Codes","/admin/qr","qr",QrCode],
  ["Bills","/admin/bills","bills",FileText],
  ["Payments","/admin/payments","payments",WalletCards],
  ["Reports","/admin/reports","reports",BarChart3],
  ["Staff","/admin/staff","staff",Users],
  ["Settings","/admin/settings","settings",Settings],
]

import React from "react"

// ============================================================
// MAIN COMPONENT
// ============================================================
export function AdminApp({ view = "dashboard" as View }: { view?: View }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initMenu)
  const [categories, setCategories] = useState<Category[]>(initCategories)
  const [tables, setTables] = useState<AdminTable[]>(initTables)
  const [orders] = useState<AdminOrder[]>(initOrders)
  const [bills] = useState<AdminBill[]>(initBills)
  const [payments] = useState<AdminPayment[]>(initPayments)
  const [staff, setStaff] = useState<StaffMember[]>(initStaff)
  const [toast, setToast] = useState("")
  const [globalSearch, setGlobalSearch] = useState("")

  const notify = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(""), 3000) }

  const headerTitles: Record<View, { title: string; subtitle: string }> = {
    dashboard: { title:"Admin Dashboard", subtitle:"Terminal 2 operations overview and analytics" },
    orders: { title:"Order Management", subtitle:"View and monitor all dining orders" },
    menu: { title:"Menu Management", subtitle:"Configure items, pricing and availability" },
    categories: { title:"Category Management", subtitle:"Organise your menu into guest-facing sections" },
    tables: { title:"Table Management", subtitle:"Monitor dining floor capacity and sessions" },
    qr: { title:"QR Code Management", subtitle:"Guest QR codes for contactless table ordering" },
    bills: { title:"Bills & Invoices", subtitle:"Review session invoices and payment balances" },
    payments: { title:"Payment Transactions", subtitle:"Monitor all payment activity and transaction history" },
    reports: { title:"Business Reports", subtitle:"Revenue analytics, performance metrics and export tools" },
    staff: { title:"Staff Management", subtitle:"Manage team members, roles and access permissions" },
    settings: { title:"Restaurant Settings", subtitle:"Configure Terminal 2 operations and preferences" },
  }
  const { title, subtitle } = headerTitles[view]

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <span className="admin-brand-mark"><Store /></span>
          <span><strong>TERMINAL <b>2</b></strong><small>Administration</small></span>
        </Link>

        <nav className="admin-nav">
          <p>WORKSPACE</p>
          {NAV.slice(0,1).map(([label,href,key,Icon]) => (
            <Link key={key} href={href} className={view===key?"active":""}><Icon />{label}</Link>
          ))}
          <p>OPERATIONS</p>
          {NAV.slice(1,9).map(([label,href,key,Icon]) => (
            <Link key={key} href={href} className={view===key?"active":""}><Icon />{label}
              {key==="payments" && <em>5</em>}
            </Link>
          ))}
          <p>MANAGEMENT</p>
          {NAV.slice(9).map(([label,href,key,Icon]) => (
            <Link key={key} href={href} className={view===key?"active":""}><Icon />{label}</Link>
          ))}
        </nav>

        <div className="admin-user">
          <span className="admin-avatar">VK</span>
          <span><strong>Vikash Kumar</strong><small><i />Online · Admin</small></span>
          <LogOut />
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">TERMINAL 2 / ADMINISTRATION</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="admin-header-actions">
            <label className="admin-search-box">
              <Search />
              <input value={globalSearch} onChange={e=>setGlobalSearch(e.target.value)} placeholder="Search anything…" />
            </label>
            <button className="admin-icon-btn" aria-label="Notifications"><Bell /><i /></button>
            <span className="admin-profile" title="Vikash Kumar — Admin">VK</span>
          </div>
        </header>

        {view==="dashboard"  && <DashboardView tables={tables} orders={orders} onNotice={notify} />}
        {view==="menu"       && <MenuView items={menuItems} setItems={setMenuItems} categories={categories} onNotice={notify} />}
        {view==="categories" && <CategoriesView categories={categories} setCategories={setCategories} onNotice={notify} />}
        {view==="tables"     && <TablesView tables={tables} setTables={setTables} onNotice={notify} />}
        {view==="qr"         && <QrView tables={tables} onNotice={notify} />}
        {view==="orders"     && <OrdersView orders={orders} onNotice={notify} />}
        {view==="bills"      && <BillsView bills={bills} orders={orders} onNotice={notify} />}
        {view==="payments"   && <PaymentsView payments={payments} onNotice={notify} />}
        {view==="reports"    && <ReportsView onNotice={notify} />}
        {view==="staff"      && <StaffView staff={staff} setStaff={setStaff} onNotice={notify} />}
        {view==="settings"   && <SettingsView onNotice={notify} />}
      </main>

      {toast && <div className="admin-toast"><ShieldCheck />{toast}</div>}
    </div>
  )
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function PageSection({ eyebrow, title, desc, action, children }: { eyebrow:string; title:string; desc:string; action?:React.ReactNode; children:React.ReactNode }) {
  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <div><p className="admin-kicker">{eyebrow}</p><h2>{title}</h2><p>{desc}</p></div>
        {action}
      </div>
      {children}
    </div>
  )
}

function AdminBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/\s+/g,"-").replace(/_/g,"-")
  return <span className={`admin-badge ${cls}`}>{status}</span>
}

function ConfirmModal({ title, body, confirmLabel="Confirm", danger=false, onConfirm, onCancel }: { title:string; body:string; confirmLabel?:string; danger?:boolean; onConfirm:()=>void; onCancel:()=>void }) {
  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal-box" onClick={e=>e.stopPropagation()}>
        <div className="admin-modal-icon">{danger?<XCircle />:<AlertCircle />}</div>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="admin-modal-actions">
          <button className="admin-btn-outline" onClick={onCancel}>Cancel</button>
          <button className={`admin-btn-primary${danger?" danger":""}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

function Drawer({ title, subtitle, onClose, children }: { title:string; subtitle?:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div className="admin-drawer-backdrop" onClick={onClose}>
      <div className="admin-drawer" onClick={e=>e.stopPropagation()}>
        <div className="admin-drawer-header">
          <div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>
          <button className="admin-close-btn" onClick={onClose}><X /></button>
        </div>
        <div className="admin-drawer-body">{children}</div>
      </div>
    </div>
  )
}

// ============================================================
// VIEW: DASHBOARD
// ============================================================
function DashboardView({ tables, orders, onNotice }: { tables:AdminTable[]; orders:AdminOrder[]; onNotice:(s:string)=>void }) {
  const activeTables = tables.filter(t=>t.status!=="AVAILABLE").length
  const metrics = [
    ["TODAY'S REVENUE","₹42,850","+12.4% from yesterday",CircleDollarSign],
    ["TODAY'S ORDERS","148","22 orders this hour",Receipt],
    ["ACTIVE TABLES",String(activeTables),"4 ready for billing",Table2],
    ["PENDING PAYMENTS","7","₹3,480 outstanding",WalletCards],
    ["AVG. ORDER VALUE","₹290","+8.2% from last week",BarChart3],
    ["COMPLETED TODAY","112","75.6% completion rate",CheckCircle2],
  ] as const

  return (
    <div className="admin-content">
      <section className="admin-welcome">
        <div>
          <p className="admin-kicker">MONDAY, 06 OCTOBER 2026</p>
          <h2>Good evening, Vikash 👋</h2>
          <p>Here&apos;s what&apos;s happening at Terminal 2 today.</p>
        </div>
        <Link href="/admin/reports" className="admin-btn-outline"><BarChart3 />View reports<ChevronRight /></Link>
      </section>

      <section className="admin-metrics-grid">
        {metrics.map(([label,value,note,Icon]) => (
          <article className="admin-metric-card" key={label}>
            <span className="admin-metric-icon"><Icon /></span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
              <em>{note}</em>
            </div>
          </article>
        ))}
      </section>

      <div className="admin-dash-row">
        {/* Revenue Chart */}
        <section className="admin-panel admin-panel-lg">
          <div className="admin-panel-heading">
            <div><p className="admin-kicker">REVENUE OVERVIEW</p><h3>Revenue Performance</h3></div>
            <div className="admin-chart-tabs">
              {["Today","7 Days","30 Days","This Month"].map((t,i)=><button key={t} className={i===0?"active":""}>{t}</button>)}
            </div>
          </div>
          <div className="admin-bar-chart">
            {[["Mon",285],["Tue",324],["Wed",298],["Thu",362],["Fri",428],["Sat",390],["Sun",350]].map(([day,h])=>(
              <div key={day}>
                <span style={{height:`${Number(h)/5}px`}} title={money(Number(h)*100)} />
                <small>{day}</small>
                <b>{money(Number(h)*100)}</b>
              </div>
            ))}
          </div>
        </section>

        {/* Orders Donut */}
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><p className="admin-kicker">ORDER ACTIVITY</p><h3>Orders Overview</h3></div>
          </div>
          <div className="admin-donut-wrap">
            <div className="admin-donut"><strong>148</strong><small>Total orders</small></div>
            <div className="admin-legend">
              <span><i className="green" />Completed <b>112</b></span>
              <span><i className="orange" />In Progress <b>28</b></span>
              <span><i className="red" />Cancelled <b>8</b></span>
            </div>
          </div>
        </section>
      </div>

      <div className="admin-dash-three">
        {/* Popular Items */}
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-kicker">TOP SELLERS</p><h3>Popular Items</h3></div><Link href="/admin/reports">View all<ChevronRight /></Link></div>
          <div className="admin-popular-list">
            {[["01","Chicken Burger","82 orders","₹14,760"],["02","Cold Coffee","76 orders","₹9,120"],["03","French Fries","63 orders","₹6,300"],["04","Cappuccino","58 orders","₹6,380"]].map(x=>(
              <div key={x[1]}><span className="pop-rank">{x[0]}</span><strong>{x[1]}<small>{x[2]}</small></strong><b>{x[3]}</b></div>
            ))}
          </div>
        </section>

        {/* Payment Breakdown */}
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-kicker">PAYMENTS TODAY</p><h3>Payment Breakdown</h3></div><span className="admin-total-badge">₹42,850</span></div>
          <div className="admin-pay-ring"><strong>₹42,850</strong><small>Total received</small></div>
          <div className="admin-pay-legend">
            <span><i className="online" />UPI / Online <b>₹30,400</b></span>
            <span><i className="cash" />Cash <b>₹7,250</b></span>
            <span><i className="card" />Card <b>₹5,200</b></span>
          </div>
        </section>

        {/* Active Tables */}
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-kicker">DINING FLOOR</p><h3>Active Tables</h3></div><Link href="/admin/tables">View floor<ChevronRight /></Link></div>
          <div className="admin-mini-table">
            <div className="admin-mini-head"><span>TABLE</span><span>STATUS</span><span>TOTAL</span></div>
            {tables.filter(t=>t.status!=="AVAILABLE").slice(0,5).map(t=>(
              <div key={t.id}>
                <strong>{t.id}</strong>
                <AdminBadge status={t.status} />
                <b>{money(t.total)}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Orders */}
      <section className="admin-panel" style={{marginTop:16}}>
        <div className="admin-panel-heading"><div><p className="admin-kicker">LIVE ACTIVITY</p><h3>Recent Orders</h3></div><Link href="/admin/orders">View all<ChevronRight /></Link></div>
        <AdminOrdersTable orders={orders.slice(0,5)} onSelect={()=>{}} />
      </section>
    </div>
  )
}

// ============================================================
// VIEW: MENU
// ============================================================
function MenuView({ items, setItems, categories, onNotice }: { items:MenuItem[]; setItems:React.Dispatch<React.SetStateAction<MenuItem[]>>; categories:Category[]; onNotice:(s:string)=>void }) {
  const [query, setQuery] = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const [availFilter, setAvailFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [editItem, setEditItem] = useState<MenuItem|null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MenuItem|null>(null)

  const filtered = useMemo(()=>items.filter(i=>{
    const q = i.name.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase())
    const c = catFilter==="All" || i.category===catFilter
    const a = availFilter==="All" || (availFilter==="Available"?i.available:!i.available)
    const t = typeFilter==="All" || i.type===typeFilter
    return q&&c&&a&&t
  }),[items,query,catFilter,availFilter,typeFilter])

  const toggleAvail = (id:number) => {
    setItems(all=>all.map(i=>i.id===id?{...i,available:!i.available}:i))
    const item = items.find(i=>i.id===id)
    onNotice(`${item?.name} marked as ${item?.available?"unavailable":"available"}`)
  }

  const duplicateItem = (item:MenuItem) => {
    const newItem:MenuItem = {...item, id:Date.now(), name:`${item.name} (Copy)`, featured:false, orders:0}
    setItems(all=>[...all,newItem])
    onNotice(`${item.name} duplicated successfully`)
  }

  const confirmDelete = () => {
    if(!deleteTarget) return
    setItems(all=>all.filter(i=>i.id!==deleteTarget.id))
    onNotice(`${deleteTarget.name} deleted from menu`)
    setDeleteTarget(null)
  }

  return (
    <PageSection eyebrow="CATALOG MANAGEMENT" title="Menu Items" desc={`${items.length} items across ${categories.length} categories`}
      action={<button className="admin-btn-primary" onClick={()=>setAddOpen(true)}><Plus />Add Item</button>}>
      
      <div className="admin-filter-row">
        <div className="admin-search-input"><Search /><input placeholder="Search items, categories…" value={query} onChange={e=>setQuery(e.target.value)} /></div>
        <select className="admin-select" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {categories.map(c=><option key={c.id}>{c.name}</option>)}
        </select>
        <select className="admin-select" value={availFilter} onChange={e=>setAvailFilter(e.target.value)}>
          <option value="All">All Availability</option>
          <option>Available</option>
          <option>Unavailable</option>
        </select>
        <select className="admin-select" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
          <option value="All">Veg & Non-Veg</option>
          <option>Veg</option>
          <option>Non-Veg</option>
        </select>
      </div>

      <div className="admin-panel">
        {filtered.length===0 ? (
          <div className="admin-empty"><UtensilsCrossed /><h3>No menu items found</h3><p>Try clearing your search filters.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ITEM</th><th>CATEGORY</th><th>PRICE</th><th>TAX</th><th>TYPE</th><th>AVAILABILITY</th><th>ORDERS TODAY</th><th>ACTIONS</th></tr></thead>
              <tbody>
                {filtered.map(item=>(
                  <tr key={item.id}>
                    <td>
                      <div className="admin-item-name">
                        <span className={`food-dot-sm ${item.type==="Veg"?"veg":""}`} />
                        <div><strong>{item.name}</strong>{item.featured&&<span className="admin-featured-tag"><Star />Featured</span>}</div>
                      </div>
                    </td>
                    <td><span className="admin-cat-chip">{item.category}</span></td>
                    <td><strong>{money(item.price)}</strong></td>
                    <td>{item.tax}%</td>
                    <td>{item.type}</td>
                    <td>
                      <button className={`admin-avail-toggle ${item.available?"on":""}`} onClick={()=>toggleAvail(item.id)}>
                        {item.available?<Eye />:<EyeOff />}
                        {item.available?"Available":"Unavailable"}
                      </button>
                    </td>
                    <td><strong>{item.orders}</strong></td>
                    <td>
                      <div className="admin-row-actions">
                        <button className="admin-icon-action" title="Edit" onClick={()=>setEditItem(item)}><Pencil /></button>
                        <button className="admin-icon-action" title="Duplicate" onClick={()=>duplicateItem(item)}><Copy /></button>
                        <button className="admin-icon-action danger" title="Delete" onClick={()=>setDeleteTarget(item)}><Trash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Drawer */}
      {addOpen && (
        <MenuItemForm
          title="Add Menu Item"
          categories={categories}
          onSave={(data)=>{
            const newItem:MenuItem={...data,id:Date.now(),orders:0}
            setItems(all=>[newItem,...all])
            onNotice(`${data.name} added to menu`)
            setAddOpen(false)
          }}
          onCancel={()=>setAddOpen(false)}
        />
      )}

      {/* Edit Item Drawer */}
      {editItem && (
        <MenuItemForm
          title="Edit Menu Item"
          initial={editItem}
          categories={categories}
          onSave={(data)=>{
            setItems(all=>all.map(i=>i.id===editItem.id?{...i,...data}:i))
            onNotice(`${data.name} updated successfully`)
            setEditItem(null)
          }}
          onCancel={()=>setEditItem(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          title={`Delete "${deleteTarget.name}"?`}
          body="This item will be permanently removed from the menu. This cannot be undone."
          confirmLabel="Delete Item"
          danger
          onConfirm={confirmDelete}
          onCancel={()=>setDeleteTarget(null)}
        />
      )}
    </PageSection>
  )
}

function MenuItemForm({ title, initial, categories, onSave, onCancel }: {
  title:string; initial?:MenuItem; categories:Category[];
  onSave:(data:Omit<MenuItem,"id"|"orders">)=>void; onCancel:()=>void
}) {
  const [name, setName] = useState(initial?.name??"")
  const [desc, setDesc] = useState(initial?.description??"")
  const [cat, setCat] = useState(initial?.category??categories[0]?.name??"")
  const [price, setPrice] = useState(String(initial?.price??0))
  const [tax, setTax] = useState(String(initial?.tax??5))
  const [type, setType] = useState<FoodType>(initial?.type??"Veg")
  const [avail, setAvail] = useState(initial?.available??true)
  const [featured, setFeatured] = useState(initial?.featured??false)
  const [addons, setAddons] = useState<{name:string;price:number}[]>(initial?.addons??[])
  const [addonName, setAddonName] = useState("")
  const [addonPrice, setAddonPrice] = useState("")

  const addAddon = () => {
    if(!addonName.trim()||!addonPrice) return
    setAddons(a=>[...a,{name:addonName.trim(),price:Number(addonPrice)}])
    setAddonName(""); setAddonPrice("")
  }

  const handleSave = () => {
    if(!name.trim()||!price) return
    onSave({ name:name.trim(), description:desc, category:cat, price:Number(price), tax:Number(tax), type, available:avail, featured, addons })
  }

  return (
    <Drawer title={title} subtitle={initial?"Update item details and availability":"Add a new item to your menu"} onClose={onCancel}>
      <div className="admin-form">
        <div className="admin-form-row">
          <label>Item Name *<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Chicken Burger" /></label>
          <label>Category *
            <select value={cat} onChange={e=>setCat(e.target.value)}>
              {categories.map(c=><option key={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <label>Description<textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Short description visible to customers" rows={2} /></label>
        <div className="admin-form-row">
          <label>Price (₹) *<input type="number" value={price} onChange={e=>setPrice(e.target.value)} min={0} /></label>
          <label>Tax %<input type="number" value={tax} onChange={e=>setTax(e.target.value)} min={0} max={28} /></label>
        </div>
        <div className="admin-form-row">
          <label>Food Type
            <select value={type} onChange={e=>setType(e.target.value as FoodType)}>
              <option>Veg</option><option>Non-Veg</option>
            </select>
          </label>
        </div>
        <div className="admin-toggle-row">
          <span><strong>Available for ordering</strong><small>Customers can see and order this item</small></span>
          <button className={`admin-toggle ${avail?"on":""}`} onClick={()=>setAvail(v=>!v)} />
        </div>
        <div className="admin-toggle-row">
          <span><strong>Featured item</strong><small>Highlight this item in the menu header</small></span>
          <button className={`admin-toggle ${featured?"on":""}`} onClick={()=>setFeatured(v=>!v)} />
        </div>

        <div className="admin-addons-section">
          <p className="admin-kicker">ADD-ONS / CUSTOMISATIONS</p>
          {addons.map((a,i)=>(
            <div key={i} className="admin-addon-row">
              <span>{a.name}</span><b>+{money(a.price)}</b>
              <button onClick={()=>setAddons(all=>all.filter((_,j)=>j!==i))}><X /></button>
            </div>
          ))}
          <div className="admin-addon-input">
            <input placeholder="Add-on name" value={addonName} onChange={e=>setAddonName(e.target.value)} />
            <input placeholder="₹ Price" type="number" value={addonPrice} onChange={e=>setAddonPrice(e.target.value)} style={{width:80}} />
            <button className="admin-btn-outline" onClick={addAddon}><Plus />Add</button>
          </div>
        </div>

        <div className="admin-form-actions">
          <button className="admin-btn-outline" onClick={onCancel}>Cancel</button>
          <button className="admin-btn-primary" onClick={handleSave}><Check />{initial?"Save Changes":"Add Item"}</button>
        </div>
      </div>
    </Drawer>
  )
}

// ============================================================
// VIEW: CATEGORIES
// ============================================================
function CategoriesView({ categories, setCategories, onNotice }: { categories:Category[]; setCategories:React.Dispatch<React.SetStateAction<Category[]>>; onNotice:(s:string)=>void }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category|null>(null)
  const [deleteCat, setDeleteCat] = useState<Category|null>(null)
  const [catName, setCatName] = useState("")
  const [catOrder, setCatOrder] = useState("")
  const [catActive, setCatActive] = useState(true)

  const openAdd = () => { setCatName(""); setCatOrder(String(categories.length+1)); setCatActive(true); setEditCat(null); setFormOpen(true) }
  const openEdit = (c:Category) => { setCatName(c.name); setCatOrder(String(c.displayOrder)); setCatActive(c.active); setEditCat(c); setFormOpen(true) }

  const handleSave = () => {
    if(!catName.trim()) return
    if(editCat) {
      setCategories(all=>all.map(c=>c.id===editCat.id?{...c,name:catName,displayOrder:Number(catOrder),active:catActive}:c))
      onNotice(`Category "${catName}" updated`)
    } else {
      setCategories(all=>[...all,{id:Date.now(),name:catName,displayOrder:Number(catOrder),active:catActive,itemCount:0}])
      onNotice(`Category "${catName}" added`)
    }
    setFormOpen(false)
  }

  const confirmDelete = () => {
    if(!deleteCat) return
    setCategories(all=>all.filter(c=>c.id!==deleteCat.id))
    onNotice(`Category "${deleteCat.name}" deleted`)
    setDeleteCat(null)
  }

  return (
    <PageSection eyebrow="CATALOG MANAGEMENT" title="Menu Categories" desc={`${categories.length} categories · Drag to reorder`}
      action={<button className="admin-btn-primary" onClick={openAdd}><Plus />Add Category</button>}>
      
      <div className="admin-category-grid">
        {categories.map((cat,i)=>(
          <article className="admin-cat-card" key={cat.id}>
            <div className="admin-cat-card-top">
              <span className="admin-cat-number">{String(i+1).padStart(2,"0")}</span>
              <div>
                <h3>{cat.name}</h3>
                <p>{cat.itemCount} menu items</p>
              </div>
              <span className={`admin-badge ${cat.active?"active":"inactive"}`}>{cat.active?"Active":"Inactive"}</span>
            </div>
            <div className="admin-cat-card-actions">
              <button className="admin-icon-action" title="Edit" onClick={()=>openEdit(cat)}><Pencil /></button>
              <button className="admin-icon-action" title="Move up" onClick={()=>onNotice(`${cat.name} moved up`)}><ChevronUp /></button>
              <button className="admin-icon-action" title="Move down" onClick={()=>onNotice(`${cat.name} moved down`)}><ChevronDown /></button>
              <button className="admin-icon-action danger" title="Delete" onClick={()=>setDeleteCat(cat)}><Trash2 /></button>
            </div>
          </article>
        ))}
      </div>

      {formOpen && (
        <Drawer title={editCat?"Edit Category":"Add Category"} onClose={()=>setFormOpen(false)}>
          <div className="admin-form">
            <label>Category Name *<input value={catName} onChange={e=>setCatName(e.target.value)} placeholder="e.g. Main Course" /></label>
            <label>Display Order<input type="number" value={catOrder} onChange={e=>setCatOrder(e.target.value)} min={1} /></label>
            <div className="admin-toggle-row">
              <span><strong>Active</strong><small>Show this category to customers</small></span>
              <button className={`admin-toggle ${catActive?"on":""}`} onClick={()=>setCatActive(v=>!v)} />
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn-outline" onClick={()=>setFormOpen(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}><Check />{editCat?"Save Changes":"Add Category"}</button>
            </div>
          </div>
        </Drawer>
      )}

      {deleteCat && (
        <ConfirmModal
          title={`Delete "${deleteCat.name}"?`}
          body={`This category and its display configuration will be removed. The ${deleteCat.itemCount} items assigned to it will become uncategorised.`}
          confirmLabel="Delete Category"
          danger
          onConfirm={confirmDelete}
          onCancel={()=>setDeleteCat(null)}
        />
      )}
    </PageSection>
  )
}

// ============================================================
// VIEW: TABLES
// ============================================================
function TablesView({ tables, setTables, onNotice }: { tables:AdminTable[]; setTables:React.Dispatch<React.SetStateAction<AdminTable[]>>; onNotice:(s:string)=>void }) {
  const [selectedTable, setSelectedTable] = useState<AdminTable|null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<AdminTable|null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editTable, setEditTable] = useState<AdminTable|null>(null)

  // Add table form state
  const [newId, setNewId] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [newCap, setNewCap] = useState("4")

  const handleAddTable = () => {
    if(!newId.trim()) return
    const t:AdminTable = { id:newId.toUpperCase(), label:newLabel||`Table ${newId}`, capacity:Number(newCap), status:"AVAILABLE", session:"—", orders:0, total:0, paid:0, qrActive:false }
    setTables(all=>[...all,t])
    onNotice(`Table ${t.id} added successfully`)
    setAddOpen(false); setNewId(""); setNewLabel(""); setNewCap("4")
  }

  return (
    <PageSection eyebrow="DINING FLOOR MANAGEMENT" title="Tables" desc={`${tables.length} tables · ${tables.filter(t=>t.status!=="AVAILABLE").length} occupied`}
      action={<button className="admin-btn-primary" onClick={()=>setAddOpen(true)}><Plus />Add Table</button>}>
      
      <div className="admin-table-grid">
        {tables.map(table=>{
          const balance = Math.max(table.total-table.paid,0)
          return (
            <button key={table.id} className={`admin-table-card ${table.status.toLowerCase().replace(/\s+/g,"-")}`} onClick={()=>setSelectedTable(table)}>
              <div className="admin-table-card-top">
                <strong>{table.id}</strong>
                <AdminBadge status={table.status} />
              </div>
              <div className="admin-table-capacity"><Users style={{width:12}} /> {table.capacity} seats</div>
              {table.orders>0 ? (
                <>
                  <b className="admin-table-total">{money(table.total)}</b>
                  <small>{table.session} · {table.orders} {table.orders===1?"order":"orders"}</small>
                  {balance>0 && <p className="admin-table-balance">Balance: {money(balance)}</p>}
                  <footer>{table.qrActive?<span className="admin-qr-active">QR Active</span>:<span className="admin-qr-inactive">No QR</span>}<ChevronRight /></footer>
                </>
              ) : (
                <div className="admin-table-avail"><Check />Ready for guests</div>
              )}
            </button>
          )
        })}
      </div>

      {/* Table Detail Drawer */}
      {selectedTable && (
        <Drawer title={selectedTable.label} subtitle={`${selectedTable.id} · Capacity ${selectedTable.capacity} · ${selectedTable.status}`} onClose={()=>setSelectedTable(null)}>
          <div className="admin-detail-grid">
            <div><small>TABLE ID</small><strong>{selectedTable.id}</strong></div>
            <div><small>CAPACITY</small><strong>{selectedTable.capacity} seats</strong></div>
            <div><small>STATUS</small><AdminBadge status={selectedTable.status} /></div>
            <div><small>SESSION</small><strong>{selectedTable.session}</strong></div>
            <div><small>ORDERS</small><strong>{selectedTable.orders}</strong></div>
            <div><small>TOTAL</small><strong>{money(selectedTable.total)}</strong></div>
            <div><small>PAID</small><strong style={{color:"#378158"}}>{money(selectedTable.paid)}</strong></div>
            <div><small>BALANCE</small><strong style={{color:selectedTable.total-selectedTable.paid>0?"#a85c38":"#378158"}}>{money(Math.max(selectedTable.total-selectedTable.paid,0))}</strong></div>
            <div><small>QR CODE</small><strong>{selectedTable.qrActive?"Active":"Not Generated"}</strong></div>
          </div>
          <div className="admin-drawer-actions">
            <Link href="/admin/orders" className="admin-btn-outline"><ClipboardList />View Orders</Link>
            <Link href="/admin/qr" className="admin-btn-outline"><QrCode />Generate QR</Link>
            <button className="admin-btn-outline" onClick={()=>{setEditTable(selectedTable);setEditOpen(true)}}><Edit2 />Edit Table</button>
            <button className="admin-btn-danger" onClick={()=>setDeactivateTarget(selectedTable)}><XCircle />Deactivate</button>
          </div>
        </Drawer>
      )}

      {/* Add Table Drawer */}
      {addOpen && (
        <Drawer title="Add New Table" subtitle="Add a dining table to the restaurant floor" onClose={()=>setAddOpen(false)}>
          <div className="admin-form">
            <div className="admin-form-row">
              <label>Table Number *<input value={newId} onChange={e=>setNewId(e.target.value)} placeholder="e.g. T13" /></label>
              <label>Table Label<input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="e.g. Table 13" /></label>
            </div>
            <label>Seating Capacity *
              <select value={newCap} onChange={e=>setNewCap(e.target.value)}>
                {[2,4,6,8,10].map(n=><option key={n} value={n}>{n} seats</option>)}
              </select>
            </label>
            <div className="admin-form-actions">
              <button className="admin-btn-outline" onClick={()=>setAddOpen(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleAddTable}><Check />Save Table</button>
            </div>
          </div>
        </Drawer>
      )}

      {/* Deactivate Confirmation */}
      {deactivateTarget && (
        <ConfirmModal
          title={`Deactivate ${deactivateTarget.id}?`}
          body={`Table ${deactivateTarget.id} will be marked as closed and removed from the active dining floor. Any ongoing sessions must be settled first.`}
          confirmLabel="Deactivate Table"
          danger
          onConfirm={()=>{ setTables(all=>all.map(t=>t.id===deactivateTarget.id?{...t,status:"CLOSED"}:t)); onNotice(`${deactivateTarget.id} deactivated`); setDeactivateTarget(null); setSelectedTable(null) }}
          onCancel={()=>setDeactivateTarget(null)}
        />
      )}
    </PageSection>
  )
}

// ============================================================
// VIEW: QR CODES
// ============================================================
function QrView({ tables, onNotice }: { tables:AdminTable[]; onNotice:(s:string)=>void }) {
  const [preview, setPreview] = useState<AdminTable|null>(null)
  const allTables = tables

  return (
    <PageSection eyebrow="GUEST ACCESS" title="QR Code Management" desc="Each QR code encodes the table URL and enables contactless ordering">
      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>TABLE</th><th>LABEL</th><th>QR STATUS</th><th>QR URL</th><th>LAST GENERATED</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {allTables.map(t=>(
                <tr key={t.id}>
                  <td><strong>{t.id}</strong></td>
                  <td>{t.label}</td>
                  <td><span className={`admin-badge ${t.qrActive?"active":"inactive"}`}>{t.qrActive?"Active":"Not Generated"}</span></td>
                  <td><code style={{fontSize:10,color:"#796b63"}}>/order?table={t.id.slice(1)}</code></td>
                  <td>{t.qrActive?"06 Oct 2026":"—"}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-icon-action" title="View QR" onClick={()=>setPreview(t)}><Eye /></button>
                      <button className="admin-icon-action" title="Download" onClick={()=>onNotice(`QR for ${t.id} downloaded`)}><Download /></button>
                      <button className="admin-icon-action" title="Print" onClick={()=>onNotice(`Print dialog for ${t.id} opened`)}><Printer /></button>
                      <button className="admin-icon-action" title="Regenerate" onClick={()=>onNotice(`QR for ${t.id} regenerated`)}><RotateCcw /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Preview Modal */}
      {preview && (
        <div className="admin-modal-backdrop" onClick={()=>setPreview(null)}>
          <div className="admin-qr-preview" onClick={e=>e.stopPropagation()}>
            <button className="admin-close-btn" style={{alignSelf:"flex-end"}} onClick={()=>setPreview(null)}><X /></button>
            <div className="admin-qr-brand">TERMINAL <span>2</span></div>
            <p className="admin-qr-scan-label">SCAN TO ORDER</p>
            <div className="admin-fake-qr">
              {Array.from({length:81}).map((_,i)=>(
                <i key={i} style={{opacity:((i*7+preview.id.charCodeAt(1))%10)/10+0.1,background:(i*11)%7===0?"#30221c":"transparent"}} />
              ))}
            </div>
            <h3>TABLE {preview.id.slice(1).replace(/^0+/,"")}</h3>
            <code>/order?table={preview.id.slice(1).replace(/^0+/,"")}</code>
            <small>Point your camera at the QR code to open the ordering menu</small>
            <div className="admin-qr-actions">
              <button className="admin-btn-outline" onClick={()=>onNotice(`QR for ${preview.id} downloaded`)}><Download />Download</button>
              <button className="admin-btn-outline" onClick={()=>onNotice("Print dialog opened")}><Printer />Print</button>
              <button className="admin-btn-primary" onClick={()=>onNotice(`QR for ${preview.id} regenerated`)}><RotateCcw />Regenerate</button>
            </div>
          </div>
        </div>
      )}
    </PageSection>
  )
}

// ============================================================
// VIEW: ORDERS
// ============================================================
function OrdersView({ orders, onNotice }: { orders:AdminOrder[]; onNotice:(s:string)=>void }) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [payFilter, setPayFilter] = useState("ALL")
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder|null>(null)

  const filtered = useMemo(()=>orders.filter(o=>{
    const q = o.id.toLowerCase().includes(query.toLowerCase())||o.table.toLowerCase().includes(query.toLowerCase())
    const s = statusFilter==="ALL"||o.orderStatus===statusFilter
    const p = payFilter==="ALL"||o.paymentStatus===payFilter
    return q&&s&&p
  }),[orders,query,statusFilter,payFilter])

  return (
    <PageSection eyebrow="ORDER REGISTER" title="All Orders" desc="Read-only view of all dining orders. Use Kitchen to manage preparation.">
      <div className="admin-filter-row">
        <div className="admin-search-input"><Search /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order #, table…" /></div>
        <select className="admin-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {["NEW","ACCEPTED","PREPARING","READY","SERVED","COMPLETED"].map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="admin-select" value={payFilter} onChange={e=>setPayFilter(e.target.value)}>
          <option value="ALL">All Payments</option>
          {["PAID","UNPAID","PARTIALLY PAID","PENDING","FAILED"].map(s=><option key={s}>{s}</option>)}
        </select>
        <button className="admin-btn-outline" onClick={()=>onNotice("Order export generated")}><Download />Export</button>
      </div>

      <div className="admin-panel">
        {filtered.length===0
          ? <div className="admin-empty"><ClipboardList /><h3>No orders found</h3><p>Adjust filters or search term.</p></div>
          : <AdminOrdersTable orders={filtered} onSelect={setSelectedOrder} />
        }
      </div>

      {selectedOrder && (
        <Drawer title={selectedOrder.id} subtitle={`Table ${selectedOrder.table} · Session ${selectedOrder.session} · ${selectedOrder.date}`} onClose={()=>setSelectedOrder(null)}>
          <OrderDetailContent order={selectedOrder} />
        </Drawer>
      )}
    </PageSection>
  )
}

function AdminOrdersTable({ orders, onSelect }: { orders:AdminOrder[]; onSelect:(o:AdminOrder)=>void }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>ORDER</th><th>TABLE</th><th>SESSION</th><th>TIME</th><th>ITEMS</th><th>TOTAL</th><th>ORDER STATUS</th><th>PAYMENT</th><th></th></tr></thead>
        <tbody>
          {orders.map(o=>(
            <tr key={o.id} style={{cursor:"pointer"}} onClick={()=>onSelect(o)}>
              <td><strong>{o.id}</strong></td>
              <td>{o.table}</td>
              <td>{o.session}</td>
              <td>{o.time}</td>
              <td>{o.items.reduce((s,i)=>s+i.qty,0)} items</td>
              <td><strong>{money(o.total)}</strong></td>
              <td><AdminBadge status={o.orderStatus} /></td>
              <td><AdminBadge status={o.paymentStatus} /></td>
              <td><button className="admin-icon-action" title="Details" onClick={e=>{e.stopPropagation();onSelect(o)}}><ChevronRight /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OrderDetailContent({ order }: { order:AdminOrder }) {
  const statusSteps:OrderStatus[] = ["NEW","ACCEPTED","PREPARING","READY","SERVED","COMPLETED"]
  const stepIdx = statusSteps.indexOf(order.orderStatus)
  return (
    <div className="admin-form">
      <div className="admin-detail-grid">
        <div><small>TABLE</small><strong>{order.table}</strong></div>
        <div><small>SESSION</small><strong>{order.session}</strong></div>
        <div><small>ORDER TIME</small><strong>{order.time}</strong></div>
        <div><small>CASHIER</small><strong>{order.cashier}</strong></div>
      </div>
      <h4 style={{margin:"18px 0 10px",fontSize:12,fontWeight:800,letterSpacing:".1em",color:"#aa8a76"}}>ITEMS ORDERED</h4>
      <div className="admin-order-items">
        {order.items.map((item,i)=>(
          <div key={i} className="admin-order-item-row">
            <span><strong>{item.name}</strong> × {item.qty}{item.customization&&<small style={{color:"#796b63",display:"block"}}>{item.customization}</small>}</span>
            <b>{money(item.price)}</b>
          </div>
        ))}
      </div>
      {order.specialInstructions && (
        <div className="admin-special-note">
          <small>SPECIAL INSTRUCTIONS</small>
          <p>&ldquo;{order.specialInstructions}&rdquo;</p>
        </div>
      )}
      <div className="admin-order-totals">
        <div><span>Subtotal</span><b>{money(order.subtotal)}</b></div>
        <div><span>Tax (5%)</span><b>{money(order.tax)}</b></div>
        <div className="total-row"><span>Grand Total</span><b>{money(order.total)}</b></div>
        <div><span>Paid</span><b style={{color:"#378158"}}>{money(order.paid)}</b></div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <AdminBadge status={order.orderStatus} />
        <AdminBadge status={order.paymentStatus} />
      </div>
      <h4 style={{margin:"18px 0 10px",fontSize:12,fontWeight:800,letterSpacing:".1em",color:"#aa8a76"}}>ORDER TIMELINE</h4>
      <div className="admin-timeline">
        {statusSteps.map((step,i)=>(
          <div key={step} className={`admin-timeline-step ${i<=stepIdx?"done":""} ${i===stepIdx?"current":""}`}>
            <div className="admin-timeline-dot">{i<stepIdx&&<Check />}</div>
            <span>{step}<small>{i<=stepIdx?`Completed at ${order.time}`:""}</small></span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// VIEW: BILLS
// ============================================================
function BillsView({ bills, orders, onNotice }: { bills:AdminBill[]; orders:AdminOrder[]; onNotice:(s:string)=>void }) {
  const [selected, setSelected] = useState<AdminBill|null>(null)

  return (
    <PageSection eyebrow="BILLING REGISTER" title="Invoices & Bills" desc="View-only bill register. Payment collection handled by Cashier."
      action={<button className="admin-btn-outline" onClick={()=>onNotice("Bills exported to CSV")}><Download />Export Bills</button>}>
      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>BILL NUMBER</th><th>TABLE</th><th>SESSION</th><th>DATE</th><th>SUBTOTAL</th><th>GST</th><th>TOTAL</th><th>PAID</th><th>BALANCE</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {bills.map(bill=>(
                <tr key={bill.id}>
                  <td><strong>{bill.id}</strong></td>
                  <td>{bill.table}</td>
                  <td>{bill.session}</td>
                  <td>{bill.date}</td>
                  <td>{money(bill.subtotal)}</td>
                  <td>{money(bill.tax)}</td>
                  <td><strong>{money(bill.total)}</strong></td>
                  <td style={{color:"#378158"}}>{money(bill.paid)}</td>
                  <td style={{color:bill.balance>0?"#a85c38":"#378158",fontWeight:700}}>{money(bill.balance)}</td>
                  <td><AdminBadge status={bill.status} /></td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-icon-action" title="View" onClick={()=>setSelected(bill)}><Eye /></button>
                      <button className="admin-icon-action" title="Print" onClick={()=>onNotice(`Invoice ${bill.id} sent to printer`)}><Printer /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Drawer title={selected.id} subtitle={`Table ${selected.table} · Session ${selected.session} · ${selected.date}`} onClose={()=>setSelected(null)}>
          <div className="admin-invoice-preview">
            <div className="admin-invoice-head">
              <h2>TERMINAL 2</h2>
              <p>Coimbatore, Tamil Nadu</p>
              <p>GSTIN: 29AAACT2026R1ZM</p>
            </div>
            <div className="admin-invoice-meta">
              <div><small>BILL NO</small><strong>{selected.id}</strong></div>
              <div><small>TABLE</small><strong>{selected.table}</strong></div>
              <div><small>DATE</small><strong>{selected.date}</strong></div>
              <div><small>SESSION</small><strong>{selected.session}</strong></div>
            </div>
            <div className="admin-invoice-divider" />
            {orders.filter(o=>o.table===selected.table&&o.session===selected.session).flatMap(o=>o.items).map((item,i)=>(
              <div key={i} className="admin-invoice-item">
                <span>{item.name} × {item.qty}</span>
                <b>{money(item.price)}</b>
              </div>
            ))}
            <div className="admin-invoice-divider" />
            <div className="admin-invoice-totals">
              <div><span>Subtotal</span><b>{money(selected.subtotal)}</b></div>
              <div><span>CGST (2.5%)</span><b>{money(Math.round(selected.subtotal*0.025))}</b></div>
              <div><span>SGST (2.5%)</span><b>{money(Math.round(selected.subtotal*0.025))}</b></div>
              <div className="admin-invoice-grand"><span>Grand Total</span><b>{money(selected.total)}</b></div>
              <div style={{color:"#378158"}}><span>Paid</span><b>{money(selected.paid)}</b></div>
              <div style={{color:selected.balance>0?"#a85c38":"#378158",fontWeight:700}}><span>Balance Due</span><b>{money(selected.balance)}</b></div>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn-primary" onClick={()=>onNotice(`${selected.id} printed`)}><Printer />Print Bill</button>
              <button className="admin-btn-outline" onClick={()=>onNotice("Bill reprinted")}><RotateCcw />Reprint</button>
            </div>
          </div>
        </Drawer>
      )}
    </PageSection>
  )
}

// ============================================================
// VIEW: PAYMENTS
// ============================================================
function PaymentsView({ payments, onNotice }: { payments:AdminPayment[]; onNotice:(s:string)=>void }) {
  const [selected, setSelected] = useState<AdminPayment|null>(null)
  const [methodFilter, setMethodFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [query, setQuery] = useState("")

  const filtered = useMemo(()=>payments.filter(p=>{
    const q = p.id.toLowerCase().includes(query.toLowerCase())||p.reference.toLowerCase().includes(query.toLowerCase())||p.table.toLowerCase().includes(query.toLowerCase())
    const m = methodFilter==="ALL"||p.method===methodFilter
    const s = statusFilter==="ALL"||p.status===statusFilter
    return q&&m&&s
  }),[payments,query,methodFilter,statusFilter])

  return (
    <PageSection eyebrow="PAYMENT LEDGER" title="Payment Transactions" desc="Read-only payment history. Refunds are processed from the Cashier.">
      <div className="admin-metrics-grid compact">
        {[["TOTAL TODAY","₹42,850"],["UPI / ONLINE","₹30,400"],["CASH","₹7,250"],["CARD","₹5,200"]].map(([l,v])=>(
          <article className="admin-metric-card compact" key={l}>
            <div><small>{l}</small><strong>{v}</strong></div>
          </article>
        ))}
      </div>

      <div className="admin-filter-row">
        <div className="admin-search-input"><Search /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Payment ID, reference, table…" /></div>
        <select className="admin-select" value={methodFilter} onChange={e=>setMethodFilter(e.target.value)}>
          <option value="ALL">All Methods</option>
          {["CASH","UPI","CARD"].map(m=><option key={m}>{m}</option>)}
        </select>
        <select className="admin-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {["SUCCESS","REFUNDED","PENDING","FAILED"].map(s=><option key={s}>{s}</option>)}
        </select>
        <button className="admin-btn-outline" onClick={()=>onNotice("Payment ledger exported")}><Download />Export</button>
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>PAYMENT ID</th><th>INVOICE</th><th>TABLE</th><th>AMOUNT</th><th>METHOD</th><th>REFERENCE</th><th>STATUS</th><th>DATE</th><th>CASHIER</th><th></th></tr></thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id} style={{cursor:"pointer"}} onClick={()=>setSelected(p)}>
                  <td><strong>{p.id}</strong></td>
                  <td>{p.billId}</td>
                  <td>{p.table}</td>
                  <td><strong>{money(p.amount)}</strong></td>
                  <td>{p.method}</td>
                  <td><code style={{fontSize:10}}>{p.reference}</code></td>
                  <td><AdminBadge status={p.status} /></td>
                  <td>{p.date} {p.time}</td>
                  <td>{p.cashier}</td>
                  <td><button className="admin-icon-action" onClick={e=>{e.stopPropagation();setSelected(p)}}><ChevronRight /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Drawer title={selected.id} subtitle={`${selected.billId} · Table ${selected.table}`} onClose={()=>setSelected(null)}>
          <div className="admin-form">
            <div className="admin-detail-grid">
              <div><small>AMOUNT</small><strong style={{fontSize:20,color:"#a85c38"}}>{money(selected.amount)}</strong></div>
              <div><small>METHOD</small><strong>{selected.method}</strong></div>
              <div><small>TABLE</small><strong>{selected.table}</strong></div>
              <div><small>SESSION</small><strong>{selected.session}</strong></div>
              <div><small>DATE</small><strong>{selected.date}</strong></div>
              <div><small>TIME</small><strong>{selected.time}</strong></div>
              <div><small>CASHIER</small><strong>{selected.cashier}</strong></div>
              <div><small>STATUS</small><AdminBadge status={selected.status} /></div>
              <div className="full-span"><small>TRANSACTION REF</small><strong style={{fontFamily:"monospace"}}>{selected.reference}</strong></div>
              {selected.refundReason && <div className="full-span"><small>REFUND REASON</small><strong>{selected.refundReason}</strong></div>}
            </div>
            <p style={{fontSize:11,color:"#796b63",marginTop:16,padding:"10px",background:"#f9f0da",borderRadius:8}}>
              <Info style={{width:14,display:"inline",verticalAlign:"middle",marginRight:6}} />
              Payment refunds are processed from the Cashier module. Admin view is read-only.
            </p>
          </div>
        </Drawer>
      )}
    </PageSection>
  )
}

// ============================================================
// VIEW: REPORTS
// ============================================================
function ReportsView({ onNotice }: { onNotice:(s:string)=>void }) {
  const [period, setPeriod] = useState("This Month")

  const popularItems = [
    {rank:"01",name:"Chicken Burger",qty:82,rev:14760},
    {rank:"02",name:"Cold Coffee",qty:76,rev:9120},
    {rank:"03",name:"French Fries",qty:63,rev:6300},
    {rank:"04",name:"Cappuccino",qty:58,rev:6380},
    {rank:"05",name:"Chicken Pizza",qty:24,rev:6720},
    {rank:"06",name:"Pasta Alfredo",qty:28,rev:7840},
  ]
  const tablePerf = [
    {id:"T12",orders:34,revenue:12450,avg:366},{id:"T08",orders:28,revenue:9820,avg:351},
    {id:"T03",orders:31,revenue:11280,avg:364},{id:"T05",orders:26,revenue:8960,avg:345},
    {id:"T02",orders:22,revenue:7840,avg:356},
  ]

  return (
    <PageSection eyebrow="BUSINESS INTELLIGENCE" title="Reports & Analytics" desc="Revenue performance, order volume and operational metrics">
      <div className="admin-filter-row">
        {["Today","Yesterday","7 Days","30 Days","This Month","Custom"].map(p=>(
          <button key={p} className={`admin-period-btn ${period===p?"active":""}`} onClick={()=>setPeriod(p)}>{p}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button className="admin-btn-outline" onClick={()=>onNotice("Report exported to CSV")}><Download />CSV</button>
          <button className="admin-btn-outline" onClick={()=>onNotice("Report exported to PDF")}><FileText />PDF</button>
          <button className="admin-btn-outline" onClick={()=>onNotice("Report sent to printer")}><Printer />Print</button>
        </div>
      </div>

      <div className="admin-report-kpis">
        {[["REVENUE","₹3,86,420","+14.8%"],["ORDERS","1,248","+9.2%"],["AVG. ORDER VALUE","₹309","+5.1%"],["TAXES COLLECTED","₹18,402","+11.4%"],["DISCOUNTS GIVEN","₹2,840","-3.2%"],["COMPLETED ORDERS","1,108","88.8%"]].map(([l,v,c])=>(
          <article key={l} className="admin-kpi-card"><small>{l}</small><strong>{v}</strong><em style={{color:c.startsWith("+")?"#378158":"#a85c38"}}>{c} vs prev period</em></article>
        ))}
      </div>

      <div className="admin-dash-row" style={{marginTop:16}}>
        <section className="admin-panel admin-panel-lg">
          <div className="admin-panel-heading"><div><p className="admin-kicker">DAILY REVENUE</p><h3>Revenue by Day</h3></div><button className="admin-btn-outline" onClick={()=>onNotice("Chart exported")}><Download /></button></div>
          <div className="admin-bar-chart large">
            {[285,324,298,362,428,390,350,410,382,460,435,482].map((h,i)=>(
              <div key={i}><span style={{height:`${h/3}px`}} /><small>{i+1} Oct</small></div>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-kicker">PEAK HOURS</p><h3>Orders by Hour</h3></div></div>
          <div className="admin-hour-list">
            {[["7 AM",18],["12 PM",38],["1 PM",52],["2 PM",44],["7 PM",86],["8 PM",96],["9 PM",72],["10 PM",48]].map(([h,n])=>(
              <div key={h}><span>{h}</span><i><b style={{width:`${Number(n)}%`}} /></i><strong>{n}</strong></div>
            ))}
          </div>
        </section>
      </div>

      <div className="admin-dash-row" style={{marginTop:16}}>
        <section className="admin-panel admin-panel-lg">
          <div className="admin-panel-heading"><div><p className="admin-kicker">MENU PERFORMANCE</p><h3>Popular Items This Period</h3></div><button className="admin-btn-outline" onClick={()=>onNotice("Item report exported")}><Download /></button></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>RANK</th><th>ITEM NAME</th><th>QTY SOLD</th><th>REVENUE</th><th>PERFORMANCE</th></tr></thead>
              <tbody>
                {popularItems.map(item=>(
                  <tr key={item.rank}>
                    <td><span className="pop-rank">{item.rank}</span></td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.qty}</td>
                    <td><strong>{money(item.rev)}</strong></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,height:6,background:"#f0e8e3",borderRadius:3}}>
                          <div style={{width:`${(item.qty/82)*100}%`,height:6,background:"#b76443",borderRadius:3}} />
                        </div>
                        <small>{Math.round((item.qty/82)*100)}%</small>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-kicker">TABLE PERFORMANCE</p><h3>Revenue by Table</h3></div></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>TABLE</th><th>ORDERS</th><th>REVENUE</th><th>AVG</th></tr></thead>
              <tbody>
                {tablePerf.map(t=>(
                  <tr key={t.id}>
                    <td><strong>{t.id}</strong></td>
                    <td>{t.orders}</td>
                    <td><strong>{money(t.revenue)}</strong></td>
                    <td>{money(t.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="admin-panel" style={{marginTop:16}}>
        <div className="admin-panel-heading"><div><p className="admin-kicker">CATEGORY PERFORMANCE</p><h3>Sales Mix by Category</h3></div><button className="admin-btn-outline" onClick={()=>onNotice("Category report exported")}><Download /></button></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>CATEGORY</th><th>ORDERS</th><th>REVENUE</th><th>% OF SALES</th><th>VISUAL</th></tr></thead>
            <tbody>
              {[["Main Course",286,"₹82,450","32%",32],["Beverages",324,"₹64,320","25%",25],["Snacks",248,"₹42,180","16%",16],["Pizza",154,"₹39,820","15%",15],["Coffee",186,"₹28,950","12%",12]].map(([c,o,r,p,pct])=>(
                <tr key={c as string}>
                  <td><strong>{c}</strong></td>
                  <td>{o}</td>
                  <td><strong>{r}</strong></td>
                  <td>{p}</td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,height:6,background:"#f0e8e3",borderRadius:3}}>
                        <div style={{width:`${pct}%`,height:6,background:"#b76443",borderRadius:3}} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageSection>
  )
}

// ============================================================
// VIEW: STAFF
// ============================================================
function StaffView({ staff, setStaff, onNotice }: { staff:StaffMember[]; setStaff:React.Dispatch<React.SetStateAction<StaffMember[]>>; onNotice:(s:string)=>void }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editMember, setEditMember] = useState<StaffMember|null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<StaffMember|null>(null)
  const [permTarget, setPermTarget] = useState<StaffMember|null>(null)

  // Form state
  const [sName, setSName] = useState("")
  const [sEmail, setSEmail] = useState("")
  const [sPhone, setSPhone] = useState("")
  const [sRole, setSRole] = useState<StaffRole>("Cashier")
  const [sStatus, setSStatus] = useState<StaffStatus>("Active")
  const [sPerms, setSPerms] = useState<string[]>([])

  const openAdd = () => { setSName(""); setSEmail(""); setSPhone(""); setSRole("Cashier"); setSStatus("Active"); setSPerms([]); setEditMember(null); setFormOpen(true) }
  const openEdit = (m:StaffMember) => { setSName(m.name); setSEmail(m.email); setSPhone(m.phone); setSRole(m.role); setSStatus(m.status); setSPerms([...m.permissions]); setEditMember(m); setFormOpen(true) }

  const handleSave = () => {
    if(!sName.trim()) return
    if(editMember) {
      setStaff(all=>all.map(m=>m.id===editMember.id?{...m,name:sName,email:sEmail,phone:sPhone,role:sRole,status:sStatus,permissions:sPerms}:m))
      onNotice(`${sName} updated successfully`)
    } else {
      setStaff(all=>[...all,{id:Date.now(),name:sName,email:sEmail,phone:sPhone,role:sRole,status:sStatus,lastActive:"Just now",permissions:sPerms}])
      onNotice(`${sName} added to team`)
    }
    setFormOpen(false)
  }

  const handleDeactivate = () => {
    if(!deactivateTarget) return
    setStaff(all=>all.map(m=>m.id===deactivateTarget.id?{...m,status:"Inactive"}:m))
    onNotice(`${deactivateTarget.name} deactivated`)
    setDeactivateTarget(null)
  }

  const togglePerm = (perm:string) => {
    setSPerms(p=>p.includes(perm)?p.filter(x=>x!==perm):[...p,perm])
  }

  const ROLE_COLORS:Record<StaffRole,string> = { Admin:"#a85c38", Cashier:"#378158", "Kitchen Staff":"#1a73e8" }

  return (
    <PageSection eyebrow="TEAM MANAGEMENT" title="Staff & Access Control" desc={`${staff.filter(m=>m.status==="Active").length} active · ${staff.filter(m=>m.status==="Inactive").length} inactive`}
      action={<button className="admin-btn-primary" onClick={openAdd}><Plus />Add Staff</button>}>

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>NAME</th><th>EMAIL</th><th>PHONE</th><th>ROLE</th><th>STATUS</th><th>LAST ACTIVE</th><th>PERMISSIONS</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {staff.map(m=>(
                <tr key={m.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{width:32,height:32,borderRadius:"50%",background:"#f1e0d4",display:"grid",placeItems:"center",fontSize:11,fontWeight:800,color:"#9e5d3c",flexShrink:0}}>
                        {m.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </span>
                      <strong>{m.name}</strong>
                    </div>
                  </td>
                  <td>{m.email}</td>
                  <td>{m.phone}</td>
                  <td><span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:99,fontSize:10,fontWeight:800,background:"#f1e0d4",color:ROLE_COLORS[m.role]}}>{m.role}</span></td>
                  <td><AdminBadge status={m.status} /></td>
                  <td>{m.lastActive}</td>
                  <td><button className="admin-icon-action" title="Manage Permissions" onClick={()=>setPermTarget(m)}><Shield /></button></td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-icon-action" title="Edit" onClick={()=>openEdit(m)}><Pencil /></button>
                      {m.status==="Active" && <button className="admin-icon-action danger" title="Deactivate" onClick={()=>setDeactivateTarget(m)}><XCircle /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Drawer */}
      {formOpen && (
        <Drawer title={editMember?"Edit Staff Member":"Add Staff Member"} subtitle="Manage team access and responsibilities" onClose={()=>setFormOpen(false)}>
          <div className="admin-form">
            <div className="admin-form-row">
              <label>Full Name *<input value={sName} onChange={e=>setSName(e.target.value)} placeholder="e.g. Vikash Kumar" /></label>
              <label>Email<input type="email" value={sEmail} onChange={e=>setSEmail(e.target.value)} placeholder="name@terminal2.in" /></label>
            </div>
            <div className="admin-form-row">
              <label>Phone<input value={sPhone} onChange={e=>setSPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" /></label>
              <label>Role
                <select value={sRole} onChange={e=>setSRole(e.target.value as StaffRole)}>
                  <option>Admin</option><option>Cashier</option><option>Kitchen Staff</option>
                </select>
              </label>
            </div>
            <label>Status
              <select value={sStatus} onChange={e=>setSStatus(e.target.value as StaffStatus)}>
                <option>Active</option><option>Inactive</option>
              </select>
            </label>
            <div>
              <p style={{fontSize:11,fontWeight:800,letterSpacing:".1em",color:"#aa8a76",margin:"12px 0 8px"}}>PERMISSIONS</p>
              <div className="admin-permissions-grid">
                {ALL_PERMISSIONS.map(perm=>(
                  <label key={perm} className="admin-perm-row">
                    <input type="checkbox" checked={sPerms.includes(perm)} onChange={()=>togglePerm(perm)} />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn-outline" onClick={()=>setFormOpen(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}><Check />{editMember?"Save Changes":"Create Staff"}</button>
            </div>
          </div>
        </Drawer>
      )}

      {/* Permissions Drawer */}
      {permTarget && (
        <Drawer title={`Permissions: ${permTarget.name}`} subtitle={`Role: ${permTarget.role}`} onClose={()=>setPermTarget(null)}>
          <div className="admin-form">
            <div className="admin-permissions-grid">
              {ALL_PERMISSIONS.map(perm=>(
                <label key={perm} className="admin-perm-row">
                  <input type="checkbox" checked={permTarget.permissions.includes(perm)} readOnly />
                  {perm}
                </label>
              ))}
            </div>
            <p style={{fontSize:11,color:"#796b63",marginTop:12,padding:10,background:"#f9f0da",borderRadius:8}}>
              <Info style={{width:14,display:"inline",verticalAlign:"middle",marginRight:6}} />
              Edit permissions through the Edit Staff form. Authentication will be implemented with the backend.
            </p>
            <div className="admin-form-actions">
              <button className="admin-btn-outline" onClick={()=>setPermTarget(null)}>Close</button>
              <button className="admin-btn-primary" onClick={()=>{setPermTarget(null);openEdit(permTarget)}}><Pencil />Edit Permissions</button>
            </div>
          </div>
        </Drawer>
      )}

      {/* Deactivate Confirmation */}
      {deactivateTarget && (
        <ConfirmModal
          title={`Deactivate ${deactivateTarget.name}?`}
          body="This staff member will no longer be able to access Terminal 2 systems. They can be reactivated at any time."
          confirmLabel="Deactivate"
          danger
          onConfirm={handleDeactivate}
          onCancel={()=>setDeactivateTarget(null)}
        />
      )}
    </PageSection>
  )
}

// ============================================================
// VIEW: SETTINGS
// ============================================================
function SettingsView({ onNotice }: { onNotice:(s:string)=>void }) {
  const [section, setSection] = useState("Restaurant")
  const sections = ["Restaurant","Business","Taxes","Payments","Orders","Notifications","Printers","Users"]

  // Toggle states
  const [restOpen, setRestOpen] = useState(true)
  const [allowPayNow, setAllowPayNow] = useState(true)
  const [allowCounter, setAllowCounter] = useState(true)
  const [allowCash, setAllowCash] = useState(true)
  const [allowUPI, setAllowUPI] = useState(true)
  const [allowCard, setAllowCard] = useState(true)
  const [allowMultiOrder, setAllowMultiOrder] = useState(true)
  const [allowCancel, setAllowCancel] = useState(false)
  const [notifNew, setNotifNew] = useState(true)
  const [notifPay, setNotifPay] = useState(true)
  const [notifKitchen, setNotifKitchen] = useState(true)
  const [notifLow, setNotifLow] = useState(false)

  return (
    <PageSection eyebrow="CONFIGURATION" title="Restaurant Settings" desc="Configure how Terminal 2 operates across every workspace">
      <div className="admin-settings-layout">
        <nav className="admin-settings-nav">
          {sections.map(s=>(
            <button key={s} className={section===s?"active":""} onClick={()=>setSection(s)}>
              {s}<ChevronRight />
            </button>
          ))}
        </nav>

        <div className="admin-settings-content">
          {section==="Restaurant" && (
            <div>
              <div className="admin-settings-section">
                <h3>Restaurant Details</h3>
                <p>These details appear on receipts and customer ordering pages.</p>
                <div className="admin-form-grid">
                  <label>Restaurant Name<input defaultValue="Terminal 2" /></label>
                  <label>Phone<input defaultValue="+91 422 400 2020" /></label>
                  <label style={{gridColumn:"1/-1"}}>Address<input defaultValue="Airport Road, Terminal 2, Coimbatore, Tamil Nadu" /></label>
                  <label>Email<input defaultValue="hello@terminal2.in" /></label>
                  <label>Website<input defaultValue="www.terminal2.in" /></label>
                  <label>GSTIN<input defaultValue="29AAACT2026R1ZM" /></label>
                  <label>FSSAI No.<input defaultValue="11223344556677" /></label>
                </div>
                <button className="admin-btn-primary" style={{marginTop:16}} onClick={()=>onNotice("Restaurant details saved")}><Check />Save Changes</button>
              </div>
            </div>
          )}

          {section==="Business" && (
            <div>
              <div className="admin-settings-section">
                <h3>Business Hours</h3>
                <p>Control when guests can place new orders.</p>
                <div className="admin-hours-row">
                  <strong>Monday – Sunday</strong>
                  <input defaultValue="07:00 AM" style={{width:100}} />
                  <span>to</span>
                  <input defaultValue="11:00 PM" style={{width:100}} />
                </div>
              </div>
              <div className="admin-settings-section">
                <h3>Restaurant Status</h3>
                <div className="admin-setting-toggle-row">
                  <span><strong>Restaurant is Open</strong><small>Allow new orders through QR and counter</small></span>
                  <button className={`admin-toggle ${restOpen?"on":""}`} onClick={()=>setRestOpen(v=>!v)} />
                </div>
                <select className="admin-select" style={{marginTop:12}} defaultValue="Open">
                  <option>Open</option><option>Closed</option><option>Temporarily Paused</option>
                </select>
                <button className="admin-btn-primary" style={{marginTop:16}} onClick={()=>onNotice("Business hours saved")}><Check />Save Changes</button>
              </div>
            </div>
          )}

          {section==="Taxes" && (
            <div>
              <div className="admin-settings-section">
                <h3>Tax Configuration</h3>
                <p>Configure GST rates applied to all food and beverage items.</p>
                <div className="admin-form-grid">
                  <label>CGST %<input type="number" defaultValue="2.5" step="0.5" /></label>
                  <label>SGST %<input type="number" defaultValue="2.5" step="0.5" /></label>
                  <label>Other Charges %<input type="number" defaultValue="0" /></label>
                  <label>Service Charge %<input type="number" defaultValue="5" /></label>
                </div>
                <div className="admin-setting-toggle-row" style={{marginTop:16}}>
                  <span><strong>Tax Inclusive Pricing</strong><small>Prices displayed include GST</small></span>
                  <button className="admin-toggle" />
                </div>
                <button className="admin-btn-primary" style={{marginTop:16}} onClick={()=>onNotice("Tax settings saved")}><Check />Save Tax Settings</button>
              </div>
            </div>
          )}

          {section==="Payments" && (
            <div>
              <div className="admin-settings-section">
                <h3>Payment Method Configuration</h3>
                <p>Enable or disable payment methods available to customers and cashiers.</p>
                {[["Pay Now (Online)", allowPayNow, setAllowPayNow,"Customer pays before order is sent to kitchen"],
                  ["Pay at Counter", allowCounter, setAllowCounter,"Customer pays at the cash counter after dining"],
                  ["Cash Payments", allowCash, setAllowCash,"Cashier can accept physical currency"],
                  ["UPI / QR Payments", allowUPI, setAllowUPI,"Google Pay, PhonePe, Paytm, BHIM UPI"],
                  ["Card / POS Terminal", allowCard, setAllowCard,"Credit and debit card via EDC machine"],
                ].map(([label,val,setter,desc]:[string,boolean,React.Dispatch<React.SetStateAction<boolean>>,string])=>(
                  <div key={label} className="admin-setting-toggle-row">
                    <span><strong>{label}</strong><small>{desc}</small></span>
                    <button className={`admin-toggle ${val?"on":""}`} onClick={()=>setter((v:boolean)=>!v)} />
                  </div>
                ))}
                <button className="admin-btn-primary" style={{marginTop:16}} onClick={()=>onNotice("Payment settings saved")}><Check />Save Settings</button>
              </div>
            </div>
          )}

          {section==="Orders" && (
            <div>
              <div className="admin-settings-section">
                <h3>Order Configuration</h3>
                {[["Allow Pay Now","allowPayNow",allowPayNow,setAllowPayNow,"Enable Pay Now option on customer ordering page"],
                  ["Allow Pay at Counter","allowCounter",allowCounter,setAllowCounter,"Customer can choose to pay at counter"],
                  ["Multiple Orders per Session","multi",allowMultiOrder,setAllowMultiOrder,"Customer can place additional orders during session"],
                  ["Customer Order Cancellation","cancel",allowCancel,setAllowCancel,"Allow customers to cancel unconfirmed orders"],
                ].map(([label,,val,setter,desc]:[string,string,boolean,React.Dispatch<React.SetStateAction<boolean>>,string])=>(
                  <div key={label} className="admin-setting-toggle-row">
                    <span><strong>{label}</strong><small>{desc}</small></span>
                    <button className={`admin-toggle ${val?"on":""}`} onClick={()=>setter((v:boolean)=>!v)} />
                  </div>
                ))}
                <label style={{display:"flex",flexDirection:"column",gap:4,marginTop:16,fontSize:12}}>
                  Estimated Preparation Time (minutes)
                  <input type="number" defaultValue="20" style={{width:120,padding:"8px 12px",border:"1px solid #eadfd7",borderRadius:8}} />
                </label>
                <button className="admin-btn-primary" style={{marginTop:16}} onClick={()=>onNotice("Order settings saved")}><Check />Save Settings</button>
              </div>
            </div>
          )}

          {section==="Notifications" && (
            <div>
              <div className="admin-settings-section">
                <h3>Notification Preferences</h3>
                <p>Choose which operational events trigger alerts.</p>
                {[["New Order Notification",notifNew,setNotifNew,"Alert when a new order is placed by a customer"],
                  ["Payment Notification",notifPay,setNotifPay,"Alert when a payment is received or fails"],
                  ["Kitchen Notification",notifKitchen,setNotifKitchen,"Alert when items are marked ready or delayed"],
                  ["Low Stock Notification",notifLow,setNotifLow,"Alert when menu item stock falls below threshold"],
                ].map(([label,val,setter,desc]:[string,boolean,React.Dispatch<React.SetStateAction<boolean>>,string])=>(
                  <div key={label} className="admin-setting-toggle-row">
                    <span><strong>{label}</strong><small>{desc}</small></span>
                    <button className={`admin-toggle ${val?"on":""}`} onClick={()=>setter((v:boolean)=>!v)} />
                  </div>
                ))}
                <button className="admin-btn-primary" style={{marginTop:16}} onClick={()=>onNotice("Notification preferences saved")}><Check />Save</button>
              </div>
            </div>
          )}

          {section==="Printers" && (
            <div>
              <div className="admin-settings-section">
                <h3>Hardware & Printer Management</h3>
                {[["Receipt Printer (Customer Bill)","Epson TM-T88VI","192.168.1.101","Connected"],
                  ["Kitchen KOT Printer","Star TSP100","192.168.1.102","Connected"],
                  ["Admin Report Printer","HP LaserJet M110w","192.168.1.103","Disconnected"],
                ].map(([label,model,ip,status])=>(
                  <div key={label} className="admin-printer-card">
                    <div>
                      <strong>{label}</strong>
                      <small>{model} · IP: {ip}</small>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span className={`admin-badge ${status==="Connected"?"active":"inactive"}`}>{status}</span>
                      <button className="admin-btn-outline" onClick={()=>onNotice(`Test print sent to ${model}`)}><Printer />Test Print</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section==="Users" && (
            <div>
              <div className="admin-settings-section">
                <h3>Role & Permission Overview</h3>
                <p>Summary of access levels for each staff role.</p>
                {[
                  {role:"Admin",color:"#a85c38",perms:ALL_PERMISSIONS},
                  {role:"Cashier",color:"#378158",perms:["View Orders","Manage Bills","Manage Payments"]},
                  {role:"Kitchen Staff",color:"#1a73e8",perms:["View Orders"]},
                ].map(r=>(
                  <div key={r.role} className="admin-role-card">
                    <div className="admin-role-header">
                      <Shield style={{color:r.color,width:16}} />
                      <strong style={{color:r.color}}>{r.role}</strong>
                    </div>
                    <div className="admin-role-perms">
                      {ALL_PERMISSIONS.map(p=>(
                        <span key={p} className={`admin-perm-chip ${r.perms.includes(p)?"granted":""}`}>{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
                <p style={{fontSize:11,color:"#796b63",marginTop:12,padding:10,background:"#f9f0da",borderRadius:8}}>
                  <Info style={{width:14,display:"inline",verticalAlign:"middle",marginRight:6}} />
                  Role-based access control will be enforced when the authentication backend is connected.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageSection>
  )
}
