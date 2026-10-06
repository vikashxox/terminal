"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Ban,
  Bell,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  Download,
  FileText,
  Filter,
  HelpCircle,
  Info,
  LayoutDashboard,
  LogOut,
  Minus,
  Percent,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RotateCcw,
  Search,
  Settings,
  Split,
  Table2,
  Tag,
  UserRound,
  Users,
  Utensils,
  WalletCards,
  X,
} from "lucide-react"

export type PaymentMethod = "CASH" | "UPI" | "CARD"
export type PaymentStatus = "PAID" | "UNPAID" | "PARTIALLY PAID" | "PENDING" | "FAILED" | "REFUNDED" | "VOID"
export type TableStatus = "AVAILABLE" | "OCCUPIED" | "PAYMENT PENDING" | "PAID" | "CLOSING"
export type OrderStatus = "NEW" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED"

export interface OrderItem {
  name: string
  qty: number
  price: number
  prepStatus?: "PREPARING" | "READY" | "SERVED"
  customization?: string
}

export interface Order {
  id: string
  table: string
  session: string
  time: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paid: number
  specialInstructions?: string
}

export interface TableSession {
  table: string
  session: string
  started: string
  status: TableStatus
  capacity?: number
  orderIds: string[]
}

export interface Invoice {
  id: string
  table: string
  session: string
  time: string
  date: string
  cashier: string
  subtotal: number
  tax: number
  total: number
  paid: number
  balance: number
  status: PaymentStatus
  items: OrderItem[]
}

export interface PaymentRecord {
  id: string
  billId: string
  table: string
  session: string
  amount: number
  method: PaymentMethod
  status: "SUCCESS" | "REFUNDED" | "VOID"
  time: string
  date: string
  cashier: string
  reference?: string
  refundReason?: string
}

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`

// Initial Seed Orders
const initialOrders: Order[] = [
  // Table 12 multi-order dining session
  {
    id: "#1048",
    table: "T12",
    session: "#7825",
    time: "7:12 PM",
    items: [
      { name: "Chicken Burger", qty: 1, price: 200, prepStatus: "SERVED" },
      { name: "Cold Coffee", qty: 1, price: 150, prepStatus: "SERVED" },
    ],
    subtotal: 350,
    tax: 0,
    total: 350,
    orderStatus: "SERVED",
    paymentStatus: "PAID",
    paid: 350,
    specialInstructions: "Regular ice in coffee",
  },
  {
    id: "#1049",
    table: "T12",
    session: "#7825",
    time: "7:28 PM",
    items: [
      { name: "Pasta Alfredo", qty: 1, price: 320, prepStatus: "SERVED", customization: "Extra Parmesan" },
      { name: "French Fries", qty: 1, price: 100, prepStatus: "SERVED" },
    ],
    subtotal: 420,
    tax: 0,
    total: 420,
    orderStatus: "SERVED",
    paymentStatus: "UNPAID",
    paid: 0,
    specialInstructions: "Less spicy, extra cheese on the side",
  },
  {
    id: "#1050",
    table: "T12",
    session: "#7825",
    time: "7:44 PM",
    items: [
      { name: "Margherita Pizza", qty: 1, price: 265, prepStatus: "PREPARING" },
      { name: "Lime Soda", qty: 1, price: 50, prepStatus: "READY" },
    ],
    subtotal: 315,
    tax: 0,
    total: 315,
    orderStatus: "PREPARING",
    paymentStatus: "UNPAID",
    paid: 0,
    specialInstructions: "Crispy crust on pizza",
  },
  // Table 02
  {
    id: "#1042",
    table: "T02",
    session: "#7818",
    time: "7:02 PM",
    items: [
      { name: "Margherita Pizza", qty: 1, price: 340, prepStatus: "SERVED" },
      { name: "Garlic Bread", qty: 1, price: 80, prepStatus: "SERVED" },
    ],
    subtotal: 420,
    tax: 0,
    total: 420,
    orderStatus: "SERVED",
    paymentStatus: "UNPAID",
    paid: 0,
  },
  // Table 03
  {
    id: "#1038",
    table: "T03",
    session: "#7819",
    time: "6:44 PM",
    items: [
      { name: "Pasta Alfredo", qty: 2, price: 640, prepStatus: "SERVED" },
      { name: "Tiramisu Dessert", qty: 1, price: 210, prepStatus: "SERVED" },
    ],
    subtotal: 850,
    tax: 0,
    total: 850,
    orderStatus: "COMPLETED",
    paymentStatus: "PAID",
    paid: 850,
  },
  // Table 05
  {
    id: "#1039",
    table: "T05",
    session: "#7820",
    time: "7:10 PM",
    items: [
      { name: "Chicken Biryani", qty: 1, price: 280, prepStatus: "SERVED" },
      { name: "Raita & Salan", qty: 1, price: 40, prepStatus: "SERVED" },
    ],
    subtotal: 320,
    tax: 0,
    total: 320,
    orderStatus: "SERVED",
    paymentStatus: "UNPAID",
    paid: 0,
  },
  // Table 08
  {
    id: "#1045",
    table: "T08",
    session: "#7822",
    time: "7:20 PM",
    items: [
      { name: "Club Sandwich", qty: 2, price: 440, prepStatus: "SERVED" },
      { name: "Iced Peach Tea", qty: 1, price: 100, prepStatus: "SERVED" },
    ],
    subtotal: 540,
    tax: 0,
    total: 540,
    orderStatus: "SERVED",
    paymentStatus: "PARTIALLY PAID",
    paid: 270,
  },
]

// Initial Seed Tables
const initialTables: TableSession[] = [
  { table: "T01", session: "—", started: "—", status: "AVAILABLE", capacity: 2, orderIds: [] },
  { table: "T02", session: "#7818", started: "6:48 PM", status: "PAYMENT PENDING", capacity: 4, orderIds: ["#1042"] },
  { table: "T03", session: "#7819", started: "6:31 PM", status: "PAID", capacity: 2, orderIds: ["#1038"] },
  { table: "T04", session: "—", started: "—", status: "AVAILABLE", capacity: 4, orderIds: [] },
  { table: "T05", session: "#7820", started: "7:02 PM", status: "OCCUPIED", capacity: 6, orderIds: ["#1039"] },
  { table: "T08", session: "#7822", started: "7:12 PM", status: "OCCUPIED", capacity: 4, orderIds: ["#1045"] },
  { table: "T09", session: "—", started: "—", status: "AVAILABLE", capacity: 2, orderIds: [] },
  { table: "T10", session: "—", started: "—", status: "AVAILABLE", capacity: 6, orderIds: [] },
  { table: "T12", session: "#7825", started: "7:12 PM", status: "OCCUPIED", capacity: 4, orderIds: ["#1048", "#1049", "#1050"] },
]

// Initial Seed Invoices
const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-001058",
    table: "T12",
    session: "#7825",
    time: "7:48 PM",
    date: "06 Oct 2026",
    cashier: "Vikash Kumar",
    subtotal: 1085,
    tax: 54,
    total: 1139,
    paid: 350,
    balance: 789,
    status: "PARTIALLY PAID",
    items: [
      { name: "Chicken Burger", qty: 1, price: 200 },
      { name: "Cold Coffee", qty: 1, price: 150 },
      { name: "Pasta Alfredo", qty: 1, price: 320 },
      { name: "French Fries", qty: 1, price: 100 },
      { name: "Margherita Pizza", qty: 1, price: 265 },
      { name: "Lime Soda", qty: 1, price: 50 },
    ],
  },
  {
    id: "INV-2026-001045",
    table: "T08",
    session: "#7822",
    time: "7:20 PM",
    date: "06 Oct 2026",
    cashier: "Vikash Kumar",
    subtotal: 540,
    tax: 27,
    total: 567,
    paid: 270,
    balance: 297,
    status: "PARTIALLY PAID",
    items: [
      { name: "Club Sandwich", qty: 2, price: 440 },
      { name: "Iced Peach Tea", qty: 1, price: 100 },
    ],
  },
  {
    id: "INV-2026-001042",
    table: "T02",
    session: "#7818",
    time: "7:02 PM",
    date: "06 Oct 2026",
    cashier: "Vikash Kumar",
    subtotal: 420,
    tax: 21,
    total: 441,
    paid: 0,
    balance: 441,
    status: "UNPAID",
    items: [
      { name: "Margherita Pizza", qty: 1, price: 340 },
      { name: "Garlic Bread", qty: 1, price: 80 },
    ],
  },
  {
    id: "INV-2026-001038",
    table: "T03",
    session: "#7819",
    time: "6:44 PM",
    date: "06 Oct 2026",
    cashier: "Vikash Kumar",
    subtotal: 850,
    tax: 43,
    total: 893,
    paid: 893,
    balance: 0,
    status: "PAID",
    items: [
      { name: "Pasta Alfredo", qty: 2, price: 640 },
      { name: "Tiramisu Dessert", qty: 1, price: 210 },
    ],
  },
]

// Initial Seed Payments
const initialPayments: PaymentRecord[] = [
  {
    id: "PAY-00128",
    billId: "INV-2026-001058",
    table: "T12",
    session: "#7825",
    amount: 350,
    method: "UPI",
    status: "SUCCESS",
    time: "7:25 PM",
    date: "06 Oct 2026",
    cashier: "Vikash Kumar",
    reference: "UPI/26100672589",
  },
  {
    id: "PAY-00127",
    billId: "INV-2026-001045",
    table: "T08",
    session: "#7822",
    amount: 270,
    method: "CASH",
    status: "SUCCESS",
    time: "7:21 PM",
    date: "06 Oct 2026",
    cashier: "Vikash Kumar",
    reference: "CSH-2610-09",
  },
  {
    id: "PAY-00126",
    billId: "INV-2026-001038",
    table: "T03",
    session: "#7819",
    amount: 893,
    method: "CARD",
    status: "SUCCESS",
    time: "6:58 PM",
    date: "06 Oct 2026",
    cashier: "Vikash Kumar",
    reference: "EDC/TXN-49102",
  },
  {
    id: "PAY-00125",
    billId: "INV-2026-001035",
    table: "T06",
    session: "#7815",
    amount: 640,
    method: "UPI",
    status: "SUCCESS",
    time: "6:40 PM",
    date: "06 Oct 2026",
    cashier: "Vikash Kumar",
    reference: "UPI/26100664012",
  },
  {
    id: "PAY-00124",
    billId: "INV-2026-001031",
    table: "T11",
    session: "#7812",
    amount: 490,
    method: "CASH",
    status: "REFUNDED",
    time: "6:15 PM",
    date: "06 Oct 2026",
    cashier: "Vikash Kumar",
    reference: "CSH-2610-04",
    refundReason: "Customer billing dispute - duplicate charge",
  },
]

const navItems = [
  { label: "Dashboard", href: "/cashier", icon: LayoutDashboard },
  { label: "Active Tables", href: "/cashier/tables", icon: Table2 },
  { label: "Orders", href: "/cashier/orders", icon: Receipt },
  { label: "Bills", href: "/cashier/bills", icon: FileText },
  { label: "Payments", href: "/cashier/payments", icon: WalletCards },
  { label: "Settings", href: "/cashier/settings", icon: Settings },
]

export function CashierApp({ view = "dashboard" }: { view?: string }) {
  const [tables, setTables] = useState<TableSession[]>(initialTables)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments)

  // Drawer & Modal States
  const [selectedTable, setSelectedTable] = useState<TableSession | null>(
    view === "tables" ? initialTables.find((t) => t.table === "T12") || null : null
  )
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [invoiceModalData, setInvoiceModalData] = useState<Invoice | null>(null)
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentDetailModal, setPaymentDetailModal] = useState<PaymentRecord | null>(null)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundTargetPayment, setRefundTargetPayment] = useState<PaymentRecord | null>(null)

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState("")

  const notify = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(""), 3500)
  }

  // Active session helper
  const activeTable = useMemo(() => {
    if (!selectedTable) return null
    return tables.find((t) => t.table === selectedTable.table) || selectedTable
  }, [selectedTable, tables])

  const activeOrders = useMemo(() => {
    if (!activeTable) return []
    return orders.filter((o) => activeTable.orderIds.includes(o.id))
  }, [activeTable, orders])

  const sessionSubtotal = useMemo(() => {
    return activeOrders.reduce((sum, o) => sum + o.subtotal, 0)
  }, [activeOrders])

  const sessionTax = useMemo(() => {
    return Math.round(sessionSubtotal * 0.05)
  }, [sessionSubtotal])

  const sessionTotal = sessionSubtotal + sessionTax

  const sessionPaid = useMemo(() => {
    return activeOrders.reduce((sum, o) => sum + o.paid, 0)
  }, [activeOrders])

  const sessionBalance = Math.max(sessionTotal - sessionPaid, 0)

  // Handlers
  const handleSelectTable = (table: TableSession) => {
    if (table.orderIds.length === 0) {
      notify(`Table ${table.table} is currently available for guest seating`)
      return
    }
    setSelectedTable(table)
  }

  const handleGenerateInvoice = (tableSession: TableSession) => {
    const tableOrders = orders.filter((o) => tableSession.orderIds.includes(o.id))
    const subtotal = tableOrders.reduce((s, o) => s + o.subtotal, 0)
    const tax = Math.round(subtotal * 0.05)
    const total = subtotal + tax
    const paid = tableOrders.reduce((s, o) => s + o.paid, 0)
    const balance = Math.max(total - paid, 0)

    const allItems: OrderItem[] = tableOrders.flatMap((o) => o.items)
    const existingInv = invoices.find((inv) => inv.table === tableSession.table && inv.session === tableSession.session)

    if (existingInv) {
      setInvoiceModalData(existingInv)
    } else {
      const newInv: Invoice = {
        id: `INV-2026-00${Math.floor(1060 + Math.random() * 40)}`,
        table: tableSession.table,
        session: tableSession.session,
        time: "07:50 PM",
        date: "06 Oct 2026",
        cashier: "Vikash Kumar",
        subtotal,
        tax,
        total,
        paid,
        balance,
        status: balance === 0 ? "PAID" : paid > 0 ? "PARTIALLY PAID" : "UNPAID",
        items: allItems,
      }
      setInvoices((prev) => [newInv, ...prev])
      setInvoiceModalData(newInv)
    }
  }

  // Payment Collection Handler (supports partial payments)
  const handlePaymentCompleted = (amountPaid: number, method: PaymentMethod, reference?: string) => {
    if (!activeTable) return

    const newPaymentId = `PAY-00${Math.floor(130 + payments.length)}`
    const newRecord: PaymentRecord = {
      id: newPaymentId,
      billId: `INV-2026-001058`,
      table: activeTable.table,
      session: activeTable.session,
      amount: amountPaid,
      method,
      status: "SUCCESS",
      time: "07:56 PM",
      date: "06 Oct 2026",
      cashier: "Vikash Kumar",
      reference: reference || `${method}-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    }

    setPayments((prev) => [newRecord, ...prev])

    // Distribute paid amount across unpaid orders in session
    let remainingToDistribute = amountPaid
    const updatedOrders = orders.map((order) => {
      if (!activeTable.orderIds.includes(order.id)) return order

      const orderBalance = Math.max(order.total - order.paid, 0)
      if (orderBalance <= 0) return order

      const paymentForThisOrder = Math.min(orderBalance, remainingToDistribute)
      remainingToDistribute -= paymentForThisOrder

      const newPaid = order.paid + paymentForThisOrder
      const newStatus: PaymentStatus = newPaid >= order.total ? "PAID" : newPaid > 0 ? "PARTIALLY PAID" : "UNPAID"

      return {
        ...order,
        paid: newPaid,
        paymentStatus: newStatus,
      }
    })
    setOrders(updatedOrders)

    // Calculate updated table balance
    const updatedTableOrders = updatedOrders.filter((o) => activeTable.orderIds.includes(o.id))
    const newTotalPaid = updatedTableOrders.reduce((sum, o) => sum + o.paid, 0)
    const newBalance = Math.max(sessionTotal - newTotalPaid, 0)

    const newTableStatus: TableStatus = newBalance === 0 ? "PAID" : "OCCUPIED"

    setTables((prev) =>
      prev.map((t) => (t.table === activeTable.table ? { ...t, status: newTableStatus } : t))
    )

    // Update matching invoice if exists
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.table === activeTable.table && inv.session === activeTable.session) {
          const invBalance = Math.max(inv.total - newTotalPaid, 0)
          return {
            ...inv,
            paid: newTotalPaid,
            balance: invBalance,
            status: invBalance === 0 ? "PAID" : "PARTIALLY PAID",
          }
        }
        return inv
      })
    )

    setPaymentModalOpen(false)

    if (newBalance === 0) {
      notify(`Full payment of ${money(amountPaid)} settled! Table ${activeTable.table} is now fully paid.`)
    } else {
      notify(`Partial payment of ${money(amountPaid)} collected. Outstanding balance: ${money(newBalance)}.`)
    }
  }

  // Close Session Handler (Allowed ONLY when balance is 0)
  const handleCloseSession = (tableSession: TableSession) => {
    const tableOrders = orders.filter((o) => tableSession.orderIds.includes(o.id))
    const total = tableOrders.reduce((s, o) => s + o.subtotal, 0) + Math.round(tableOrders.reduce((s, o) => s + o.subtotal, 0) * 0.05)
    const paid = tableOrders.reduce((s, o) => s + o.paid, 0)
    const balance = Math.max(total - paid, 0)

    if (balance > 0) {
      notify(`Cannot close session: Table ${tableSession.table} has an unpaid balance of ${money(balance)}.`)
      return
    }

    setTables((prev) =>
      prev.map((t) =>
        t.table === tableSession.table
          ? { ...t, status: "AVAILABLE", session: "—", started: "—", orderIds: [] }
          : t
      )
    )
    setSelectedTable(null)
    notify(`Session ${tableSession.session} closed. Table ${tableSession.table} is now ready and available for guests.`)
  }

  // Refund Payment Handler
  const handleRefundConfirm = (payment: PaymentRecord, reason: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === payment.id ? { ...p, status: "REFUNDED", refundReason: reason } : p
      )
    )

    // Adjust table and order paid amount
    setOrders((prev) =>
      prev.map((o) => {
        if (o.table === payment.table && o.paid >= payment.amount) {
          const newPaid = Math.max(o.paid - payment.amount, 0)
          return {
            ...o,
            paid: newPaid,
            paymentStatus: newPaid === 0 ? "UNPAID" : "PARTIALLY PAID",
          }
        }
        return o
      })
    )

    setTables((prev) =>
      prev.map((t) => (t.table === payment.table ? { ...t, status: "OCCUPIED" } : t))
    )

    setRefundModalOpen(false)
    setPaymentDetailModal(null)
    notify(`Payment ${payment.id} for ${money(payment.amount)} refunded successfully. Reason: ${reason}.`)
  }

  return (
    <div className="cashier-shell">
      {/* Sidebar */}
      <aside className="cashier-sidebar">
        <div className="cashier-brand">
          <span className="cashier-brand-mark">
            <Calculator />
          </span>
          <span>
            <strong>
              TERMINAL <b>2</b>
            </strong>
            <small>Cashier & Billing Desk</small>
          </span>
        </div>

        <nav className="cashier-nav">
          <p>WORKSPACE</p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              (view === "dashboard" && item.label === "Dashboard") ||
              view === item.label.toLowerCase().replaceAll(" ", "") ||
              (view === "tables" && item.label === "Active Tables")
            return (
              <Link key={item.label} href={item.href} className={isActive ? "active" : ""}>
                <Icon />
                {item.label}
                {item.label === "Active Tables" && (
                  <em>{tables.filter((t) => t.status !== "AVAILABLE").length}</em>
                )}
                {item.label === "Payments" && <em>{payments.length}</em>}
              </Link>
            )
          })}
        </nav>

        <div className="cashier-staff">
          <span className="cashier-avatar">VK</span>
          <span>
            <strong>Vikash Kumar</strong>
            <small>
              <i /> Terminal POS #01 Online
            </small>
          </span>
          <LogOut />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="cashier-main">
        {/* Header */}
        <header className="cashier-header">
          <div>
            <p className="cashier-kicker">TERMINAL 2 / CASHIER DESK</p>
            <h1>
              {view === "dashboard"
                ? "Cashier Dashboard"
                : view === "tables"
                ? "Active Dining Tables"
                : view === "orders"
                ? "Order Management"
                : view === "bills"
                ? "Bills & Invoice Register"
                : view === "payments"
                ? "Payment Transactions"
                : "Cashier Settings"}
            </h1>
            <p>
              {view === "dashboard"
                ? "Real-time revenue, active tables, and pending payments overview"
                : view === "tables"
                ? "Monitor floor dining sessions, order totals, and table balances"
                : view === "orders"
                ? "Complete list of orders with preparation and payment statuses"
                : view === "bills"
                ? "Generated tax invoices, payment settlements, and print actions"
                : view === "payments"
                ? "Payment ledger, transaction verification, and refund management"
                : "Configure POS receipt printers, tax preferences, and day-end registers"}
            </p>
          </div>

          <div className="cashier-header-actions">
            <span className="cashier-clock">
              06 OCT 2026 <b>07:56 PM</b>
            </span>
            <button
              className="cashier-icon"
              aria-label="Notifications"
              onClick={() => notify("All POS systems and printers synchronized.")}
            >
              <Bell />
              <i />
            </button>
            <span className="cashier-profile" title="Vikash Kumar (Cashier)">
              VK
            </span>
          </div>
        </header>

        {/* View Router */}
        {view === "dashboard" && (
          <DashboardView
            tables={tables}
            orders={orders}
            payments={payments}
            onSelectTable={handleSelectTable}
            onCollectPayment={(table) => {
              setSelectedTable(table)
              setPaymentModalOpen(true)
            }}
            onViewOrders={() => {}}
          />
        )}

        {view === "tables" && (
          <TablesView tables={tables} orders={orders} onSelectTable={handleSelectTable} />
        )}

        {view === "orders" && (
          <OrdersView
            orders={orders}
            onSelectOrder={(order) => setSelectedOrder(order)}
            onSelectTable={(tableNum) => {
              const table = tables.find((t) => t.table === tableNum)
              if (table) handleSelectTable(table)
            }}
          />
        )}

        {view === "bills" && (
          <BillsView
            invoices={invoices}
            onViewInvoice={(inv) => setInvoiceModalData(inv)}
            onPrintInvoice={(inv) => notify(`Printing invoice ${inv.id} on Epson TM-T88VI thermal printer...`)}
            onCollectPayment={(inv) => {
              const table = tables.find((t) => t.table === inv.table)
              if (table) {
                setSelectedTable(table)
                setPaymentModalOpen(true)
              }
            }}
            onGenerateNew={() => {
              const pendingTable = tables.find((t) => t.status === "OCCUPIED" || t.status === "PAYMENT PENDING")
              if (pendingTable) handleGenerateInvoice(pendingTable)
              else notify("No occupied tables available for bill generation.")
            }}
          />
        )}

        {view === "payments" && (
          <PaymentsView
            payments={payments}
            onSelectPayment={(payment) => setPaymentDetailModal(payment)}
            onRefundPayment={(payment) => {
              setRefundTargetPayment(payment)
              setRefundModalOpen(true)
            }}
          />
        )}

        {view === "settings" && <SettingsView onNotice={notify} />}
      </main>

      {/* Session Drawer */}
      {activeTable && (
        <SessionDrawer
          table={activeTable}
          orders={activeOrders}
          subtotal={sessionSubtotal}
          tax={sessionTax}
          total={sessionTotal}
          paid={sessionPaid}
          balance={sessionBalance}
          onClose={() => setSelectedTable(null)}
          onViewInvoice={() => handleGenerateInvoice(activeTable)}
          onSplitBill={() => setSplitModalOpen(true)}
          onCollectPayment={() => setPaymentModalOpen(true)}
          onCloseSession={() => handleCloseSession(activeTable)}
          onSelectOrder={(order) => setSelectedOrder(order)}
          onNotice={notify}
        />
      )}

      {/* Professional Restaurant Invoice Modal */}
      {invoiceModalData && (
        <InvoiceModal
          invoice={invoiceModalData}
          onClose={() => setInvoiceModalData(null)}
          onPrint={() => notify(`Invoice ${invoiceModalData.id} printed to Epson TM-T88VI.`)}
          onReprint={() => notify(`Reprinting customer copy of ${invoiceModalData.id}...`)}
        />
      )}

      {/* Payment Collection Modal (Cash, UPI, Card, with Partial Payment Support) */}
      {paymentModalOpen && activeTable && (
        <PaymentModal
          table={activeTable}
          balanceDue={sessionBalance}
          totalDue={sessionTotal}
          paidSoFar={sessionPaid}
          onClose={() => setPaymentModalOpen(false)}
          onComplete={handlePaymentCompleted}
          onNotice={notify}
        />
      )}

      {/* Split Bill Modal */}
      {splitModalOpen && activeTable && (
        <SplitBillModal
          table={activeTable}
          orders={activeOrders}
          total={sessionTotal}
          balance={sessionBalance}
          onClose={() => setSplitModalOpen(false)}
          onCollectShare={(amount) => {
            setSplitModalOpen(false)
            setPaymentModalOpen(true)
          }}
          onNotice={notify}
        />
      )}

      {/* Order Details Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onViewTableSession={() => {
            const table = tables.find((t) => t.table === selectedOrder.table)
            setSelectedOrder(null)
            if (table) setSelectedTable(table)
          }}
          onPrintKOT={() => notify(`Kitchen Order Ticket (KOT) for ${selectedOrder.id} sent to Star TSP100.`)}
          onNotice={notify}
        />
      )}

      {/* Payment Detail Modal */}
      {paymentDetailModal && (
        <PaymentDetailModal
          payment={paymentDetailModal}
          onClose={() => setPaymentDetailModal(null)}
          onPrintReceipt={() => notify(`Payment receipt for ${paymentDetailModal.id} printed.`)}
          onInitiateRefund={() => {
            setRefundTargetPayment(paymentDetailModal)
            setRefundModalOpen(true)
          }}
        />
      )}

      {/* Refund / Void Confirmation Modal */}
      {refundModalOpen && refundTargetPayment && (
        <RefundModal
          payment={refundTargetPayment}
          onClose={() => {
            setRefundModalOpen(false)
            setRefundTargetPayment(null)
          }}
          onConfirm={(reason) => handleRefundConfirm(refundTargetPayment, reason)}
        />
      )}

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="cashier-toast" role="alert">
          <Check />
          {toastMessage}
        </div>
      )}
    </div>
  )
}

/* ==========================================================================
   VIEW 1: CASHIER DASHBOARD
   ========================================================================== */
function DashboardView({
  tables,
  orders,
  payments,
  onSelectTable,
  onCollectPayment,
  onViewOrders,
}: {
  tables: TableSession[]
  orders: Order[]
  payments: PaymentRecord[]
  onSelectTable: (table: TableSession) => void
  onCollectPayment: (table: TableSession) => void
  onViewOrders: () => void
}) {
  const activeTablesCount = tables.filter((t) => t.status !== "AVAILABLE").length
  const pendingPaymentsTables = tables.filter(
    (t) => t.status === "PAYMENT PENDING" || (t.status === "OCCUPIED" && t.orderIds.length > 0)
  )

  const pendingAmount = pendingPaymentsTables.reduce((sum, t) => {
    const tableOrders = orders.filter((o) => t.orderIds.includes(o.id))
    const total = tableOrders.reduce((s, o) => s + o.subtotal, 0)
    const paid = tableOrders.reduce((s, o) => s + o.paid, 0)
    return sum + Math.max(total - paid, 0)
  }, 0)

  return (
    <>
      {/* Metric Cards */}
      <section className="cashier-metrics">
        <div className="cashier-metric">
          <span className="metric-icon">
            <CircleDollarSign />
          </span>
          <small>TODAY&apos;S REVENUE</small>
          <strong>₹42,850</strong>
          <em>+12.4% from yesterday</em>
        </div>

        <div className="cashier-metric">
          <span className="metric-icon">
            <Receipt />
          </span>
          <small>TODAY&apos;S ORDERS</small>
          <strong>148</strong>
          <em>22 orders this hour</em>
        </div>

        <div className="cashier-metric">
          <span className="metric-icon">
            <Table2 />
          </span>
          <small>ACTIVE TABLES</small>
          <strong>{activeTablesCount}</strong>
          <em>4 ready for billing</em>
        </div>

        <div className="cashier-metric">
          <span className="metric-icon">
            <WalletCards />
          </span>
          <small>PENDING PAYMENTS</small>
          <strong>{pendingPaymentsTables.length}</strong>
          <em>{money(pendingAmount || 8420)} unpaid</em>
        </div>
      </section>

      {/* Grid: Action Needed + Payment Split */}
      <div className="cashier-grid-two">
        {/* Action Needed */}
        <section className="cashier-panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">ACTION NEEDED</p>
              <h2>Pending Table Settlements</h2>
            </div>
            <Link href="/cashier/tables">
              View floor <ChevronRight />
            </Link>
          </div>

          <div className="pending-row">
            <span className="table-avatar">T12</span>
            <span>
              <strong>Table 12 · Session #7825</strong>
              <small>3 orders · Subtotal ₹1,085 · Paid ₹350</small>
            </span>
            <b>₹735</b>
            <button
              onClick={() => {
                const t12 = tables.find((t) => t.table === "T12")
                if (t12) onCollectPayment(t12)
              }}
            >
              COLLECT
            </button>
          </div>

          <div className="pending-row">
            <span className="table-avatar">T08</span>
            <span>
              <strong>Table 08 · Session #7822</strong>
              <small>1 order · Subtotal ₹540 · Paid ₹270</small>
            </span>
            <b>₹270</b>
            <button
              onClick={() => {
                const t08 = tables.find((t) => t.table === "T08")
                if (t08) onCollectPayment(t08)
              }}
            >
              COLLECT
            </button>
          </div>

          <div className="pending-row">
            <span className="table-avatar">T02</span>
            <span>
              <strong>Table 02 · Session #7818</strong>
              <small>1 order · Subtotal ₹420 · Unpaid</small>
            </span>
            <b>₹420</b>
            <button
              onClick={() => {
                const t02 = tables.find((t) => t.table === "T02")
                if (t02) onCollectPayment(t02)
              }}
            >
              COLLECT
            </button>
          </div>
        </section>

        {/* Payment Split Panel */}
        <section className="cashier-panel sales-panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">TODAY&apos;S BREAKDOWN</p>
              <h2>Payment Method Split</h2>
            </div>
            <span className="sales-total">₹42,850</span>
          </div>

          <div className="sales-bar">
            <i style={{ width: "29%" }} title="Cash: 29%" />
            <i style={{ width: "45%" }} title="UPI: 45%" />
            <i style={{ width: "26%" }} title="Card: 26%" />
          </div>

          <div className="split-legend">
            <span>
              <i className="cash" /> Counter Cash Payments <b>₹12,450 (29%)</b>
            </span>
            <span>
              <i className="online" /> UPI & QR Payments <b>₹19,280 (45%)</b>
            </span>
            <span>
              <i style={{ background: "#e6c2aa" }} /> Card Terminal (POS) <b>₹11,120 (26%)</b>
            </span>
          </div>
        </section>
      </div>

      {/* Recent Activity Table */}
      <section className="cashier-panel recent-panel">
        <div className="panel-heading">
          <div>
            <p className="section-label">LIVE ORDER REGISTER</p>
            <h2>Recent Orders</h2>
          </div>
          <Link href="/cashier/orders">
            View all orders <ChevronRight />
          </Link>
        </div>
        <OrdersTable orders={orders.slice(0, 5)} onSelectOrder={() => {}} />
      </section>
    </>
  )
}

/* ==========================================================================
   VIEW 2: TABLES MANAGEMENT (/cashier/tables)
   ========================================================================== */
function TablesView({
  tables,
  orders,
  onSelectTable,
}: {
  tables: TableSession[]
  orders: Order[]
  onSelectTable: (table: TableSession) => void
}) {
  const [filter, setFilter] = useState<string>("ALL")

  const filteredTables = useMemo(() => {
    if (filter === "ALL") return tables
    return tables.filter((t) => t.status === filter)
  }, [tables, filter])

  return (
    <section className="tables-view">
      <div className="view-toolbar">
        <div>
          <p className="section-label">FLOOR MANAGEMENT</p>
          <h2>Dining Tables ({tables.length} tables)</h2>
        </div>

        <div className="filter-pills">
          {["ALL", "AVAILABLE", "OCCUPIED", "PAYMENT PENDING", "PAID"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="table-grid">
        {filteredTables.map((table) => {
          const tableOrders = orders.filter((o) => table.orderIds.includes(o.id))
          const subtotal = tableOrders.reduce((s, o) => s + o.subtotal, 0)
          const paid = tableOrders.reduce((s, o) => s + o.paid, 0)
          const balance = Math.max(subtotal - paid, 0)

          return (
            <button
              key={table.table}
              className={`table-tile ${table.status.toLowerCase().replaceAll(" ", "-")}`}
              onClick={() => onSelectTable(table)}
            >
              <div className="table-tile-top">
                <span>{table.table}</span>
                <span className={`status-badge ${table.status.toLowerCase().replaceAll(" ", "-")}`}>
                  {table.status}
                </span>
              </div>

              {table.orderIds.length > 0 ? (
                <>
                  <strong>{money(subtotal)}</strong>
                  <small>
                    Session {table.session} · {table.orderIds.length}{" "}
                    {table.orderIds.length === 1 ? "order" : "orders"}
                  </small>
                  <p>
                    {paid > 0 && <span style={{ color: "#438661" }}>{money(paid)} paid · </span>}
                    <span style={{ color: balance > 0 ? "#a85c38" : "#438661", fontWeight: 700 }}>
                      {balance > 0 ? `${money(balance)} balance` : "Fully paid"}
                    </span>
                  </p>
                  <em>
                    MANAGE SESSION <ChevronRight />
                  </em>
                </>
              ) : (
                <div className="available-copy">
                  <Check />
                  <span>Available · {table.capacity} Seats</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ==========================================================================
   VIEW 3: ORDERS MANAGEMENT (/cashier/orders)
   ========================================================================== */
function OrdersView({
  orders,
  onSelectOrder,
  onSelectTable,
}: {
  orders: Order[]
  onSelectOrder: (order: Order) => void
  onSelectTable: (table: string) => void
}) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [paymentFilter, setPaymentFilter] = useState("ALL")

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesQuery =
        order.id.toLowerCase().includes(query.toLowerCase()) ||
        order.table.toLowerCase().includes(query.toLowerCase()) ||
        order.items.some((item) => item.name.toLowerCase().includes(query.toLowerCase()))

      const matchesStatus = statusFilter === "ALL" || order.orderStatus === statusFilter
      const matchesPayment = paymentFilter === "ALL" || order.paymentStatus === paymentFilter

      return matchesQuery && matchesStatus && matchesPayment
    })
  }, [orders, query, statusFilter, paymentFilter])

  return (
    <section className="cashier-panel full-panel">
      <div className="view-toolbar">
        <div>
          <p className="section-label">ORDER REGISTER</p>
          <h2>All Orders ({orders.length})</h2>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="cashier-search">
            <Search />
            <input
              placeholder="Search order #, table, item..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="filter-pills">
            {["ALL", "PREPARING", "READY", "SERVED", "COMPLETED"].map((st) => (
              <button
                key={st}
                className={statusFilter === st ? "active" : ""}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <OrdersTable orders={filteredOrders} onSelectOrder={onSelectOrder} />
      ) : (
        <div className="empty-placeholder">
          <Receipt />
          <h3>No Orders Found</h3>
          <p>No orders match the filter criteria. Try clearing search filters.</p>
        </div>
      )}
    </section>
  )
}

function OrdersTable({
  orders,
  onSelectOrder,
}: {
  orders: Order[]
  onSelectOrder: (order: Order) => void
}) {
  return (
    <div className="cashier-table-wrap">
      <table className="cashier-table">
        <thead>
          <tr>
            <th>ORDER</th>
            <th>TABLE</th>
            <th>SESSION</th>
            <th>TIME</th>
            <th>ITEMS BREAKDOWN</th>
            <th>AMOUNT</th>
            <th>ORDER STATUS</th>
            <th>PAYMENT STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.qty, 0)
            return (
              <tr key={order.id} style={{ cursor: "pointer" }} onClick={() => onSelectOrder(order)}>
                <td>
                  <strong>{order.id}</strong>
                </td>
                <td>
                  <span className="table-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                    {order.table}
                  </span>
                </td>
                <td>{order.session}</td>
                <td>{order.time}</td>
                <td>
                  <span title={order.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}>
                    {order.items[0]?.name} × {order.items[0]?.qty}
                    {order.items.length > 1 && ` +${order.items.length - 1} more`}
                  </span>
                </td>
                <td>
                  <strong>{money(order.total)}</strong>
                </td>
                <td>
                  <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${order.paymentStatus.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  <button
                    className="row-action"
                    title="View Order Details"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectOrder(order)
                    }}
                  >
                    <ChevronRight />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ==========================================================================
   VIEW 4: BILLS & INVOICES (/cashier/bills)
   ========================================================================== */
function BillsView({
  invoices,
  onViewInvoice,
  onPrintInvoice,
  onCollectPayment,
  onGenerateNew,
}: {
  invoices: Invoice[]
  onViewInvoice: (inv: Invoice) => void
  onPrintInvoice: (inv: Invoice) => void
  onCollectPayment: (inv: Invoice) => void
  onGenerateNew: () => void
}) {
  const [query, setQuery] = useState("")

  const filtered = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(query.toLowerCase()) ||
      inv.table.toLowerCase().includes(query.toLowerCase()) ||
      inv.session.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <section className="cashier-panel full-panel">
      <div className="view-toolbar">
        <div>
          <p className="section-label">BILLING REGISTER</p>
          <h2>Tax Invoices & Bills ({invoices.length})</h2>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="cashier-search">
            <Search />
            <input
              placeholder="Search invoice #, table..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="brown-button" onClick={onGenerateNew}>
            <FileText /> Generate Bill
          </button>
        </div>
      </div>

      <div className="cashier-table-wrap">
        <table className="cashier-table">
          <thead>
            <tr>
              <th>INVOICE NUMBER</th>
              <th>TABLE</th>
              <th>SESSION</th>
              <th>DATE & TIME</th>
              <th>SUBTOTAL</th>
              <th>GST (5%)</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>BALANCE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <strong>{inv.id}</strong>
                </td>
                <td>
                  <span className="table-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                    {inv.table}
                  </span>
                </td>
                <td>{inv.session}</td>
                <td>{inv.time}</td>
                <td>{money(inv.subtotal)}</td>
                <td>{money(inv.tax)}</td>
                <td>
                  <strong>{money(inv.total)}</strong>
                </td>
                <td style={{ color: "#438661" }}>{money(inv.paid)}</td>
                <td style={{ color: inv.balance > 0 ? "#a85c38" : "#438661", fontWeight: 700 }}>
                  {money(inv.balance)}
                </td>
                <td>
                  <span
                    className={`status-badge ${inv.status.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td>
                  <button
                    className="row-action"
                    title="View Tax Invoice"
                    onClick={() => onViewInvoice(inv)}
                  >
                    <FileText />
                  </button>
                  <button
                    className="row-action"
                    title="Print Receipt"
                    onClick={() => onPrintInvoice(inv)}
                  >
                    <Printer />
                  </button>
                  {inv.balance > 0 && (
                    <button
                      className="row-action"
                      style={{ color: "#a85c38" }}
                      title="Collect Payment"
                      onClick={() => onCollectPayment(inv)}
                    >
                      <WalletCards />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ==========================================================================
   VIEW 5: PAYMENTS LEDGER (/cashier/payments)
   ========================================================================== */
function PaymentsView({
  payments,
  onSelectPayment,
  onRefundPayment,
}: {
  payments: PaymentRecord[]
  onSelectPayment: (p: PaymentRecord) => void
  onRefundPayment: (p: PaymentRecord) => void
}) {
  const [methodFilter, setMethodFilter] = useState("ALL")
  const [query, setQuery] = useState("")

  const filtered = payments.filter((p) => {
    const matchesMethod = methodFilter === "ALL" || p.method === methodFilter
    const matchesQuery =
      p.id.toLowerCase().includes(query.toLowerCase()) ||
      p.billId.toLowerCase().includes(query.toLowerCase()) ||
      p.table.toLowerCase().includes(query.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(query.toLowerCase()))
    return matchesMethod && matchesQuery
  })

  return (
    <section className="cashier-panel full-panel">
      <div className="view-toolbar">
        <div>
          <p className="section-label">PAYMENT HISTORY</p>
          <h2>Transactions Ledger ({payments.length})</h2>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="cashier-search">
            <Search />
            <input
              placeholder="Search payment ID, ref, table..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="filter-pills">
            {["ALL", "CASH", "UPI", "CARD"].map((m) => (
              <button
                key={m}
                className={methodFilter === m ? "active" : ""}
                onClick={() => setMethodFilter(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cashier-table-wrap">
        <table className="cashier-table">
          <thead>
            <tr>
              <th>PAYMENT ID</th>
              <th>INVOICE REF</th>
              <th>TABLE</th>
              <th>AMOUNT</th>
              <th>METHOD</th>
              <th>TXN REFERENCE</th>
              <th>STATUS</th>
              <th>TIME</th>
              <th>CASHIER</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => onSelectPayment(item)}>
                <td>
                  <strong>{item.id}</strong>
                </td>
                <td>{item.billId}</td>
                <td>{item.table}</td>
                <td>
                  <strong>{money(item.amount)}</strong>
                </td>
                <td>
                  <span className="method">
                    {item.method === "CASH" ? (
                      <CircleDollarSign />
                    ) : item.method === "UPI" ? (
                      <QrCode />
                    ) : (
                      <CreditCard />
                    )}
                    {item.method}
                  </span>
                </td>
                <td>
                  <small style={{ fontFamily: "monospace" }}>{item.reference || "—"}</small>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      item.status === "SUCCESS"
                        ? "paid"
                        : item.status === "REFUNDED"
                        ? "refunded"
                        : "void"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>{item.time}</td>
                <td>{item.cashier}</td>
                <td>
                  <button
                    className="row-action"
                    title="View Details"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectPayment(item)
                    }}
                  >
                    <ChevronRight />
                  </button>
                  {item.status === "SUCCESS" && (
                    <button
                      className="row-action"
                      style={{ color: "#a83528" }}
                      title="Refund / Void Payment"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRefundPayment(item)
                      }}
                    >
                      <RotateCcw />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ==========================================================================
   VIEW 6: CASHIER SETTINGS (/cashier/settings)
   ========================================================================== */
function SettingsView({ onNotice }: { onNotice: (msg: string) => void }) {
  const [autoPrintSettlement, setAutoPrintSettlement] = useState(true)
  const [autoPrintKOT, setAutoPrintKOT] = useState(true)
  const [serviceCharge, setServiceCharge] = useState(false)
  const [roundOff, setRoundOff] = useState(true)

  return (
    <div style={{ maxWidth: 1040 }}>
      {/* Printer Management */}
      <section className="settings-section">
        <div className="printer-card-top">
          <div>
            <h3>Hardware & Receipt Printers</h3>
            <p style={{ margin: 0, fontSize: 12, color: "var(--cashier-muted)" }}>
              Thermal POS and Kitchen Order Ticket (KOT) printer status
            </p>
          </div>
        </div>

        <div className="printer-grid">
          <div className="printer-card">
            <div className="printer-card-top">
              <strong>Receipt Printer (Customer Bill)</strong>
              <span className="printer-badge">
                <Check /> Connected
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--cashier-muted)" }}>
              Epson TM-T88VI · Thermal 80mm · IP: 192.168.1.101:9100
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button
                className="outline-button"
                onClick={() => onNotice("Test print receipt sent to Epson TM-T88VI.")}
              >
                <Printer /> Test Print Receipt
              </button>
            </div>
          </div>

          <div className="printer-card">
            <div className="printer-card-top">
              <strong>Kitchen KOT Printer</strong>
              <span className="printer-badge">
                <Check /> Connected
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--cashier-muted)" }}>
              Star TSP100 · Thermal 80mm · IP: 192.168.1.102:9100
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button
                className="outline-button"
                onClick={() => onNotice("Test KOT ticket sent to Star TSP100 kitchen printer.")}
              >
                <Printer /> Test Print KOT
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="settings-row">
            <span>
              <strong>Auto-print receipt upon settlement</strong>
              <small>Automatically triggers bill printing when payment status reaches PAID</small>
            </span>
            <button
              className={`settings-toggle ${autoPrintSettlement ? "active" : ""}`}
              onClick={() => {
                setAutoPrintSettlement(!autoPrintSettlement)
                onNotice(`Auto-print receipt ${!autoPrintSettlement ? "enabled" : "disabled"}`)
              }}
            />
          </div>

          <div className="settings-row">
            <span>
              <strong>Auto-print KOT on new order acceptance</strong>
              <small>Sends item ticket to kitchen printer as soon as cashier or kitchen accepts</small>
            </span>
            <button
              className={`settings-toggle ${autoPrintKOT ? "active" : ""}`}
              onClick={() => {
                setAutoPrintKOT(!autoPrintKOT)
                onNotice(`Auto-print KOT ${!autoPrintKOT ? "enabled" : "disabled"}`)
              }}
            />
          </div>
        </div>
      </section>

      {/* Tax & Invoice Preferences */}
      <section className="settings-section">
        <h3>Taxation & Invoice Preferences</h3>
        <div className="settings-row">
          <span>
            <strong>Goods & Services Tax (GST 5%)</strong>
            <small>Mandatory CGST (2.5%) + SGST (2.5%) on F&B restaurant services</small>
          </span>
          <span style={{ fontWeight: 700, color: "#378158" }}>Active (5.0%)</span>
        </div>

        <div className="settings-row">
          <span>
            <strong>Discretionary Service Charge (5%)</strong>
            <small>Optional restaurant service charge added to food subtotal</small>
          </span>
          <button
            className={`settings-toggle ${serviceCharge ? "active" : ""}`}
            onClick={() => {
              setServiceCharge(!serviceCharge)
              onNotice(`Service charge ${!serviceCharge ? "enabled" : "disabled"}`)
            }}
          />
        </div>

        <div className="settings-row">
          <span>
            <strong>Auto Round-off Amounts</strong>
            <small>Round invoice grand total to nearest integer rupee</small>
          </span>
          <button
            className={`settings-toggle ${roundOff ? "active" : ""}`}
            onClick={() => {
              setRoundOff(!roundOff)
              onNotice(`Auto round-off ${!roundOff ? "enabled" : "disabled"}`)
            }}
          />
        </div>

        <div className="settings-row">
          <span>
            <strong>Invoice Numbering Sequence</strong>
            <small>Prefix: INV-2026- · Current sequence: 001059</small>
          </span>
          <span style={{ fontFamily: "monospace", fontWeight: 700 }}>INV-2026-001059</span>
        </div>
      </section>

      {/* Cashier Shift & Cash Register */}
      <section className="settings-section">
        <h3>Cashier Shift & Drawer Register</h3>
        <div className="settings-grid">
          <div className="printer-card">
            <span style={{ fontSize: 11, color: "var(--cashier-muted)" }}>ACTIVE CASHIER</span>
            <strong style={{ fontSize: 16 }}>Vikash Kumar (ID: CSH-042)</strong>
            <small style={{ color: "var(--cashier-muted)" }}>Evening Shift · Started at 3:00 PM</small>
          </div>

          <div className="printer-card">
            <span style={{ fontSize: 11, color: "var(--cashier-muted)" }}>CASH IN REGISTER</span>
            <strong style={{ fontSize: 20, color: "#378158" }}>₹17,450</strong>
            <small style={{ color: "var(--cashier-muted)" }}>
              ₹5,000 opening float + ₹12,450 collected
            </small>
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: "12px" }}>
          <button
            className="brown-button"
            onClick={() => onNotice("Shift report printed. Day-end register closed successfully.")}
          >
            <LogOut /> Close Shift & Generate Day-End Report
          </button>
        </div>
      </section>
    </div>
  )
}

/* ==========================================================================
   DRAWER 1: TABLE DINING SESSION DRAWER
   ========================================================================== */
function SessionDrawer({
  table,
  orders,
  subtotal,
  tax,
  total,
  paid,
  balance,
  onClose,
  onViewInvoice,
  onSplitBill,
  onCollectPayment,
  onCloseSession,
  onSelectOrder,
  onNotice,
}: {
  table: TableSession
  orders: Order[]
  subtotal: number
  tax: number
  total: number
  paid: number
  balance: number
  onClose: () => void
  onViewInvoice: () => void
  onSplitBill: () => void
  onCollectPayment: () => void
  onCloseSession: () => void
  onSelectOrder: (order: Order) => void
  onNotice: (msg: string) => void
}) {
  return (
    <div className="session-backdrop" onClick={onClose}>
      <section className="session-panel" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <p className="section-label">TABLE SESSION</p>
            <h2>
              {table.table} <span>Session {table.session}</span>
            </h2>
            <p>
              Opened {table.started} · {orders.length} orders · Status:{" "}
              <b style={{ color: "#a85c38" }}>{table.status}</b>
            </p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close session drawer">
            <X />
          </button>
        </header>

        {/* Orders in this session */}
        <div className="session-orders">
          <p className="section-label" style={{ margin: "0 0 10px" }}>
            ORDERS IN THIS DINING SESSION ({orders.length})
          </p>
          {orders.map((order) => (
            <article
              key={order.id}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectOrder(order)}
            >
              <div>
                <strong>{order.id}</strong>
                <small>
                  {order.time} ·{" "}
                  <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </small>
                {order.items.map((item, idx) => (
                  <span key={idx}>
                    {item.name} × {item.qty} ({money(item.price)})
                  </span>
                ))}
                {order.specialInstructions && (
                  <small style={{ color: "#ab7c39", fontStyle: "italic" }}>
                    &ldquo;{order.specialInstructions}&rdquo;
                  </small>
                )}
              </div>
              <div>
                <b>{money(order.total)}</b>
                <span
                  className={`status-badge ${order.paymentStatus.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {order.paymentStatus}
                </span>
                <small style={{ marginTop: 4 }}>
                  {order.paid > 0 ? `${money(order.paid)} paid` : "Unpaid"}
                </small>
              </div>
            </article>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="balance-card">
          <span>
            <small>SESSION SUBTOTAL</small>
            <b>{money(subtotal)}</b>
          </span>
          <span>
            <small>TAXES (GST 5%)</small>
            <b>{money(tax)}</b>
          </span>
          <span>
            <small>GRAND TOTAL</small>
            <b>{money(total)}</b>
          </span>
          <span className="paid-line">
            <small>TOTAL PAID SO FAR</small>
            <b>{money(paid)}</b>
          </span>
          <span className="due-line">
            <small>REMAINING BALANCE DUE</small>
            <b style={{ color: balance > 0 ? "#a85c38" : "#438661" }}>{money(balance)}</b>
          </span>
        </div>

        {/* Action CTAs */}
        <div className="session-actions" style={{ flexWrap: "wrap", marginTop: 20 }}>
          <button className="outline-button" onClick={onViewInvoice}>
            <FileText /> View Invoice
          </button>

          <button className="outline-button" onClick={onSplitBill}>
            <Split /> Split Bill
          </button>

          {balance > 0 ? (
            <button className="brown-button" style={{ flex: 1 }} onClick={onCollectPayment}>
              <WalletCards /> Collect {money(balance)}
            </button>
          ) : (
            <button
              className="brown-button"
              style={{ flex: 1, background: "#378158" }}
              onClick={onCloseSession}
            >
              <CheckCircle2 /> Close Session & Free Table
            </button>
          )}
        </div>

        {balance > 0 && (
          <p className="payment-warning">
            <AlertCircle style={{ width: 14, display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            Table session cannot be closed while an outstanding balance of {money(balance)} remains.
          </p>
        )}
      </section>
    </div>
  )
}

/* ==========================================================================
   MODAL 1: PROFESSIONAL RESTAURANT INVOICE (INV-2026-001058)
   ========================================================================== */
function InvoiceModal({
  invoice,
  onClose,
  onPrint,
  onReprint,
}: {
  invoice: Invoice
  onClose: () => void
  onPrint: () => void
  onReprint: () => void
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="invoice-paper" onClick={(e) => e.stopPropagation()}>
        {/* Invoice Header */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <h2 style={{ margin: "0 0 4px", font: "700 22px Georgia, serif", letterSpacing: ".06em" }}>
            TERMINAL 2
          </h2>
          <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--cashier-muted)" }}>
            FINE DINING & AIRPORT CONCOURSE
          </p>
          <p style={{ margin: "0 0 2px", fontSize: 10, color: "var(--cashier-muted)" }}>
            Departure Level, Airport Road, Terminal 2 · Phone: +91 98765 43210
          </p>
          <p style={{ margin: 0, fontSize: 10, color: "var(--cashier-muted)" }}>
            GSTIN: 29AAACT2026R1ZM · FSSAI: 11223344556677
          </p>
        </div>

        <div className="invoice-divider" />

        {/* Bill Metadata */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
          <div>
            <b>Bill No:</b> {invoice.id}
          </div>
          <div>
            <b>Table:</b> {invoice.table}
          </div>
          <div>
            <b>Date:</b> {invoice.date}
          </div>
          <div>
            <b>Session:</b> {invoice.session}
          </div>
          <div>
            <b>Time:</b> {invoice.time}
          </div>
          <div>
            <b>Cashier:</b> {invoice.cashier}
          </div>
        </div>

        <div className="invoice-divider" />

        {/* Itemized Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>ITEM</th>
              <th style={{ textAlign: "center" }}>QTY</th>
              <th style={{ textAlign: "right" }}>RATE</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td style={{ textAlign: "center" }}>{item.qty}</td>
                <td style={{ textAlign: "right" }}>{money(Math.round(item.price / item.qty))}</td>
                <td>{money(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-divider" />

        {/* Tax & Totals Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <b>{money(invoice.subtotal)}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--cashier-muted)" }}>
            <span>CGST (2.5%)</span>
            <span>{money(Math.round(invoice.subtotal * 0.025))}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--cashier-muted)" }}>
            <span>SGST (2.5%)</span>
            <span>{money(Math.round(invoice.subtotal * 0.025))}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              borderTop: "1px dashed #d5c4b8",
              paddingTop: 6,
              marginTop: 2,
            }}
          >
            <strong>Grand Total</strong>
            <strong>{money(invoice.total)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#378158" }}>
            <span>Paid Amount</span>
            <b>{money(invoice.paid)}</b>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: invoice.balance > 0 ? "#a85c38" : "#378158",
              fontWeight: 700,
            }}
          >
            <span>Balance Due</span>
            <b>{money(invoice.balance)}</b>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 10, color: "var(--cashier-muted)" }}>
          <p style={{ margin: "0 0 4px" }}>Thank you for dining with us! Please visit again.</p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#f9f6f2",
              padding: "4px 10px",
              borderRadius: 6,
            }}
          >
            <QrCode style={{ width: 14 }} /> E-Invoice Digital Receipt Validated
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="brown-button" style={{ flex: 1 }} onClick={onPrint}>
            <Printer /> Print Bill
          </button>
          <button className="outline-button" onClick={onReprint}>
            <RotateCcw /> Reprint
          </button>
          <button className="outline-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   MODAL 2: PAYMENT COLLECTION (CASH, UPI, CARD + PARTIAL PAYMENT)
   ========================================================================== */
function PaymentModal({
  table,
  balanceDue,
  totalDue,
  paidSoFar,
  onClose,
  onComplete,
  onNotice,
}: {
  table: TableSession
  balanceDue: number
  totalDue: number
  paidSoFar: number
  onClose: () => void
  onComplete: (amount: number, method: PaymentMethod, reference?: string) => void
  onNotice: (msg: string) => void
}) {
  const [method, setMethod] = useState<PaymentMethod>("CASH")
  const [amountToPay, setAmountToPay] = useState<string>(String(balanceDue))
  const [receivedCash, setReceivedCash] = useState<string>(String(balanceDue))
  const [isProcessing, setIsProcessing] = useState(false)
  const [upiApp, setUpiApp] = useState("Google Pay")
  const [cardTerminal, setCardTerminal] = useState("EDC Machine #1 (HDFC)")

  const payNum = Math.min(Math.max(Number(amountToPay) || 0, 0), balanceDue)
  const cashNum = Number(receivedCash) || 0
  const changeDue = Math.max(cashNum - payNum, 0)
  const isPartial = payNum < balanceDue

  const handleComplete = () => {
    if (payNum <= 0) {
      onNotice("Please enter a valid payment amount greater than ₹0.")
      return
    }

    if (method === "CASH" && cashNum < payNum) {
      onNotice(`Cash received (${money(cashNum)}) is less than amount due (${money(payNum)}).`)
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onComplete(payNum, method, method === "UPI" ? `UPI/${upiApp}` : method === "CARD" ? cardTerminal : undefined)
    }, 600)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="payment-panel" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <p className="section-label">COUNTER PAYMENT COLLECTION</p>
            <h2>Collect Payment</h2>
            <p>
              Table {table.table} · Session {table.session} · Total: {money(totalDue)} · Paid:{" "}
              {money(paidSoFar)}
            </p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </header>

        {/* Due amount and partial payment input */}
        <div className="payment-total">
          <div>
            <span>Outstanding Balance Due</span>
            <strong style={{ display: "block" }}>{money(balanceDue)}</strong>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 10, color: "var(--cashier-muted)" }}>
              {isPartial ? "PARTIAL PAYMENT" : "FULL SETTLEMENT"}
            </span>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#a85c38" }}>
              Paying: {money(payNum)}
            </span>
          </div>
        </div>

        {/* Amount to Pay Adjustment (Partial Payment Support) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--cashier-muted)" }}>
            AMOUNT TO COLLECT NOW
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              type="number"
              style={{
                flex: 1,
                border: "1px solid var(--cashier-line)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 16,
                fontWeight: 700,
              }}
              value={amountToPay}
              onChange={(e) => {
                setAmountToPay(e.target.value)
                setReceivedCash(e.target.value)
              }}
              max={balanceDue}
              min={1}
            />
            <button
              className="outline-button"
              onClick={() => {
                setAmountToPay(String(balanceDue))
                setReceivedCash(String(balanceDue))
              }}
            >
              Full: {money(balanceDue)}
            </button>
          </div>

          <div className="amount-presets">
            {balanceDue > 200 && (
              <button
                type="button"
                onClick={() => {
                  setAmountToPay("200")
                  setReceivedCash("200")
                }}
              >
                ₹200
              </button>
            )}
            {balanceDue > 350 && (
              <button
                type="button"
                onClick={() => {
                  setAmountToPay("350")
                  setReceivedCash("350")
                }}
              >
                ₹350
              </button>
            )}
            {balanceDue > 500 && (
              <button
                type="button"
                onClick={() => {
                  setAmountToPay("500")
                  setReceivedCash("500")
                }}
              >
                ₹500
              </button>
            )}
          </div>
          {isPartial && (
            <small style={{ color: "#a85c38", fontWeight: 700 }}>
              Remaining balance after this collection: {money(balanceDue - payNum)}
            </small>
          )}
        </div>

        {/* Payment Method Selector */}
        <div className="payment-methods">
          {(["CASH", "UPI", "CARD"] as PaymentMethod[]).map((m) => (
            <button
              key={m}
              className={method === m ? "selected" : ""}
              onClick={() => setMethod(m)}
            >
              {m === "CASH" ? <CircleDollarSign /> : m === "UPI" ? <QrCode /> : <CreditCard />}
              <b>{m}</b>
              <small>
                {m === "CASH" ? "Currency notes" : m === "UPI" ? "QR or GPay" : "POS swipe/tap"}
              </small>
            </button>
          ))}
        </div>

        {/* Method Specific Panel */}
        {method === "CASH" && (
          <div className="cash-entry">
            <label>
              Cash Tendered / Received
              <input
                type="number"
                value={receivedCash}
                onChange={(e) => setReceivedCash(e.target.value)}
                placeholder="0"
              />
            </label>
            <div className="amount-presets">
              {[100, 200, 500, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setReceivedCash(String(val))}
                >
                  ₹{val} Note
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReceivedCash(String(payNum))}
              >
                Exact ({money(payNum)})
              </button>
            </div>
            <div>
              <span>
                Amount Collecting <b>{money(payNum)}</b>
              </span>
              <span>
                Cash Tendered <b>{money(cashNum)}</b>
              </span>
              <span>
                Change to Return{" "}
                <b style={{ color: changeDue > 0 ? "#378158" : "inherit" }}>{money(changeDue)}</b>
              </span>
            </div>
          </div>
        )}

        {method === "UPI" && (
          <div className="waiting-payment">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                <i /> Dynamic QR Code Ready
              </span>
              <select
                style={{
                  border: "1px solid var(--cashier-line)",
                  borderRadius: 6,
                  fontSize: 11,
                  padding: "4px 8px",
                }}
                value={upiApp}
                onChange={(e) => setUpiApp(e.target.value)}
              >
                <option>Google Pay</option>
                <option>PhonePe</option>
                <option>Paytm</option>
                <option>BHIM UPI</option>
              </select>
            </div>
            <div className="qr-preview">
              <div className="qr-box">
                <QrCode style={{ width: 64, height: 64, margin: "0 auto 6px" }} />
                <span>UPI ID: terminal2@hdfcbank</span>
              </div>
              <small style={{ color: "var(--cashier-muted)" }}>
                Customer scans with any UPI app for {money(payNum)}
              </small>
            </div>
          </div>
        )}

        {method === "CARD" && (
          <div className="waiting-payment">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                <i /> Ready on Card POS Machine
              </span>
              <select
                style={{
                  border: "1px solid var(--cashier-line)",
                  borderRadius: 6,
                  fontSize: 11,
                  padding: "4px 8px",
                }}
                value={cardTerminal}
                onChange={(e) => setCardTerminal(e.target.value)}
              >
                <option>EDC Machine #1 (HDFC)</option>
                <option>EDC Machine #2 (ICICI)</option>
              </select>
            </div>
            <p style={{ marginTop: 10 }}>
              Insert chip card or tap NFC contactless on {cardTerminal} for {money(payNum)}.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="brown-button complete-button"
          disabled={isProcessing}
          onClick={handleComplete}
        >
          {isProcessing ? (
            "Processing Payment..."
          ) : (
            <>
              <Check /> Confirm Collection of {money(payNum)}
            </>
          )}
        </button>
      </section>
    </div>
  )
}

/* ==========================================================================
   MODAL 3: SPLIT BILL (EQUALLY, BY ITEMS, CUSTOM)
   ========================================================================== */
function SplitBillModal({
  table,
  orders,
  total,
  balance,
  onClose,
  onCollectShare,
  onNotice,
}: {
  table: TableSession
  orders: Order[]
  total: number
  balance: number
  onClose: () => void
  onCollectShare: (amount: number) => void
  onNotice: (msg: string) => void
}) {
  const [mode, setMode] = useState<"EQUALLY" | "BY_ITEMS" | "CUSTOM">("EQUALLY")
  const [numGuests, setNumGuests] = useState(2)

  // Split equally
  const sharePerGuest = Math.ceil(balance / numGuests)

  // Split by items mock
  const allItems = orders.flatMap((o) => o.items)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="split-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="section-label">BILL SETTLEMENT TOOLS</p>
            <h2 style={{ margin: 0, font: "600 24px Georgia, serif" }}>
              Split Bill · Table {table.table}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--cashier-muted)" }}>
              Session Total: {money(total)} · Remaining Balance to Split: {money(balance)}
            </p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Tabs */}
        <div className="split-tabs">
          <button
            className={mode === "EQUALLY" ? "active" : ""}
            onClick={() => setMode("EQUALLY")}
          >
            Split Equally
          </button>
          <button
            className={mode === "BY_ITEMS" ? "active" : ""}
            onClick={() => setMode("BY_ITEMS")}
          >
            Split by Items
          </button>
          <button
            className={mode === "CUSTOM" ? "active" : ""}
            onClick={() => setMode("CUSTOM")}
          >
            Custom Amount
          </button>
        </div>

        {/* Tab 1: Split Equally */}
        {mode === "EQUALLY" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Number of Guests:</span>
              <div style={{ display: "flex", gap: 6 }}>
                {[2, 3, 4, 5, 6].map((count) => (
                  <button
                    key={count}
                    className={`filter-pills ${numGuests === count ? "active" : ""}`}
                    style={{
                      border: "1px solid var(--cashier-line)",
                      borderRadius: 6,
                      padding: "6px 12px",
                      background: numGuests === count ? "#4f3023" : "#fff",
                      color: numGuests === count ? "#fff" : "inherit",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                    onClick={() => setNumGuests(count)}
                  >
                    {count} Guests
                  </button>
                ))}
              </div>
            </div>

            <div className="split-grid">
              {Array.from({ length: numGuests }).map((_, idx) => (
                <div key={idx} className="split-card">
                  <span style={{ fontSize: 11, color: "var(--cashier-muted)" }}>
                    Guest {idx + 1}
                  </span>
                  <b>{money(sharePerGuest)}</b>
                  <button
                    className="brown-button"
                    style={{ width: "100%", marginTop: 10, fontSize: 10 }}
                    onClick={() => onCollectShare(sharePerGuest)}
                  >
                    Collect {money(sharePerGuest)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Split by Items */}
        {mode === "BY_ITEMS" && (
          <div>
            <p style={{ fontSize: 12, color: "var(--cashier-muted)", margin: "10px 0" }}>
              Select items consumed by each customer to compute separate bill portions:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
              {allItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    border: "1px solid var(--cashier-line)",
                    borderRadius: 8,
                  }}
                >
                  <span>
                    <strong>{item.name}</strong> × {item.qty}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <b>{money(item.price)}</b>
                    <button
                      className="outline-button"
                      style={{ padding: "4px 8px", fontSize: 10 }}
                      onClick={() => onCollectShare(item.price)}
                    >
                      Collect Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Custom Amount */}
        {mode === "CUSTOM" && (
          <div style={{ margin: "16px 0" }}>
            <p style={{ fontSize: 12, color: "var(--cashier-muted)" }}>
              Collect a custom portion towards the remaining table balance:
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                type="number"
                placeholder="Enter custom amount..."
                style={{
                  flex: 1,
                  border: "1px solid var(--cashier-line)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 16,
                }}
                defaultValue={Math.round(balance / 2)}
                id="custom-split-input"
              />
              <button
                className="brown-button"
                onClick={() => {
                  const input = document.getElementById("custom-split-input") as HTMLInputElement
                  const val = Number(input?.value) || 0
                  if (val > 0 && val <= balance) {
                    onCollectShare(val)
                  } else {
                    onNotice(`Enter an amount between ₹1 and ${money(balance)}`)
                  }
                }}
              >
                Collect Amount
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button className="outline-button" onClick={onClose}>
            Close Split Tool
          </button>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   DRAWER 2: ORDER DETAILS DRAWER
   ========================================================================== */
function OrderDetailDrawer({
  order,
  onClose,
  onViewTableSession,
  onPrintKOT,
  onNotice,
}: {
  order: Order
  onClose: () => void
  onViewTableSession: () => void
  onPrintKOT: () => void
  onNotice: (msg: string) => void
}) {
  return (
    <div className="details-backdrop" onClick={onClose}>
      <div className="order-details" onClick={(e) => e.stopPropagation()}>
        <div className="details-header">
          <div>
            <p className="kitchen-kicker">ORDER INSPECTION</p>
            <h2>{order.id}</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="details-table">
          <div>
            <span>TABLE</span>
            <strong>{order.table}</strong>
          </div>
          <div>
            <span>SESSION</span>
            <strong>{order.session}</strong>
          </div>
          <div>
            <span>ORDER TIME</span>
            <strong>{order.time}</strong>
          </div>
          <div>
            <span>STATUS</span>
            <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
              {order.orderStatus}
            </span>
          </div>
        </div>

        <h3>Ordered Items</h3>
        <div className="details-items">
          {order.items.map((item, idx) => (
            <div key={idx}>
              <span>
                <strong>{item.name}</strong> × {item.qty}
                {item.customization && (
                  <small style={{ display: "block", color: "var(--cashier-muted)" }}>
                    {item.customization}
                  </small>
                )}
              </span>
              <b>{money(item.price)}</b>
            </div>
          ))}
        </div>

        {order.specialInstructions && (
          <div className="details-instruction">
            <small>SPECIAL INSTRUCTIONS</small>
            <p>&ldquo;{order.specialInstructions}&rdquo;</p>
          </div>
        )}

        <div className="balance-card" style={{ marginTop: 20 }}>
          <span>
            <small>ORDER TOTAL</small>
            <b>{money(order.total)}</b>
          </span>
          <span className="paid-line">
            <small>AMOUNT PAID</small>
            <b>{money(order.paid)}</b>
          </span>
          <span className="due-line">
            <small>PAYMENT STATUS</small>
            <span
              className={`status-badge ${order.paymentStatus.toLowerCase().replaceAll(" ", "-")}`}
            >
              {order.paymentStatus}
            </span>
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button className="brown-button" style={{ flex: 1 }} onClick={onViewTableSession}>
            <Table2 /> View Table Session
          </button>
          <button className="outline-button" onClick={onPrintKOT}>
            <Printer /> Print KOT
          </button>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   MODAL 4: PAYMENT DETAILS & RECEIPT MODAL
   ========================================================================== */
function PaymentDetailModal({
  payment,
  onClose,
  onPrintReceipt,
  onInitiateRefund,
}: {
  payment: PaymentRecord
  onClose: () => void
  onPrintReceipt: () => void
  onInitiateRefund: () => void
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="payment-panel" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <p className="section-label">TRANSACTION DETAILS</p>
            <h2>{payment.id}</h2>
            <p>Invoice Ref: {payment.billId}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </header>

        <div className="payment-total">
          <div>
            <span>Amount Transacted</span>
            <strong>{money(payment.amount)}</strong>
          </div>
          <span
            className={`status-badge ${
              payment.status === "SUCCESS"
                ? "paid"
                : payment.status === "REFUNDED"
                ? "refunded"
                : "void"
            }`}
          >
            {payment.status}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--cashier-muted)" }}>Payment Method</span>
            <b>{payment.method}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--cashier-muted)" }}>Dining Table</span>
            <b>{payment.table}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--cashier-muted)" }}>Session ID</span>
            <b>{payment.session}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--cashier-muted)" }}>Date & Time</span>
            <span>
              {payment.date} at {payment.time}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--cashier-muted)" }}>Cashier / Operator</span>
            <b>{payment.cashier}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--cashier-muted)" }}>Transaction Reference</span>
            <span style={{ fontFamily: "monospace" }}>{payment.reference || "N/A"}</span>
          </div>
          {payment.refundReason && (
            <div
              style={{
                background: "#fdf2f0",
                padding: 10,
                borderRadius: 8,
                color: "#a83528",
                marginTop: 6,
              }}
            >
              <small style={{ fontWeight: 700, display: "block" }}>REFUND REASON</small>
              {payment.refundReason}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button className="brown-button" style={{ flex: 1 }} onClick={onPrintReceipt}>
            <Printer /> Print Receipt
          </button>
          {payment.status === "SUCCESS" && (
            <button
              className="outline-button"
              style={{ color: "#a83528", borderColor: "#f0b5ab" }}
              onClick={onInitiateRefund}
            >
              <RotateCcw /> Refund / Void
            </button>
          )}
          <button className="outline-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   MODAL 5: REFUND & VOID PAYMENT CONFIRMATION
   ========================================================================== */
function RefundModal({
  payment,
  onClose,
  onConfirm,
}: {
  payment: PaymentRecord
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [selectedReason, setSelectedReason] = useState("Customer billing dispute")
  const [otherText, setOtherText] = useState("")

  const reasons = [
    "Customer billing dispute",
    "Order cancelled by kitchen",
    "Duplicate payment entry",
    "Overcharged item amount",
    "Other",
  ]

  const handleConfirm = () => {
    const finalReason = selectedReason === "Other" ? otherText.trim() || "Other reason" : selectedReason
    onConfirm(finalReason)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="kitchen-kicker" style={{ color: "#a83528" }}>
              CRITICAL ACTION
            </p>
            <h2 style={{ margin: 0, font: "600 22px Georgia, serif" }}>
              Refund Payment {payment.id}?
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--cashier-muted)" }}>
              Refunding {money(payment.amount)} collected via {payment.method} for Table{" "}
              {payment.table}.
            </p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div style={{ margin: "18px 0" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--cashier-muted)" }}>
            SELECT REASON FOR REFUND / VOID
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {reasons.map((r) => (
              <label
                key={r}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--cashier-line)",
                  background: selectedReason === r ? "#fdf2f0" : "#fff",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="refundReason"
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                />
                {r}
              </label>
            ))}

            {selectedReason === "Other" && (
              <input
                type="text"
                placeholder="Specify reason note..."
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                style={{
                  border: "1px solid var(--cashier-line)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                }}
              />
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button
            className="order-danger solid"
            style={{ flex: 1, padding: 12 }}
            onClick={handleConfirm}
          >
            <Check /> Confirm & Refund {money(payment.amount)}
          </button>
          <button className="outline-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
