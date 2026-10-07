'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Flame,
  Layers,
  LayoutDashboard,
  QrCode,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Table2,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'

export default function StaffPortalPage() {
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f4f0] text-[#2c211b] font-sans">
      {/* Top Header */}
      <header className="border-b border-[#eadfd7] bg-[#30221c] text-[#f9efe7] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-11 h-11 rounded-xl bg-[#e5a77c] text-[#30221c]">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl tracking-wider font-bold text-white">
                  TERMINAL <span className="text-[#e5a77c]">2</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-[#684330] text-[#f1c7aa] px-2.5 py-0.5 rounded-full border border-[#83563f]">
                  STAFF PORTAL
                </span>
              </div>
              <p className="text-xs text-[#bca99d]">
                Restaurant Operations & Management Hub • Avinashi Road, Coimbatore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#d8c7bc]">
            <div className="flex items-center gap-2 bg-[#231813] px-3.5 py-2 rounded-lg border border-[#483429]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#72c48f] animate-pulse" />
              <span className="font-medium text-white">Operations Active</span>
              <span className="text-[#8e7b71]">|</span>
              <Clock className="w-3.5 h-3.5 text-[#e5a77c]" />
              <span className="font-mono text-white">{timeStr || 'Loading...'}</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 bg-[#231813] px-3.5 py-2 rounded-lg border border-[#483429]">
              <span className="text-[#bca99d]">Terminal Station:</span>
              <strong className="text-white">POS-COUNTER-01</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <section className="mb-8 rounded-2xl bg-[#fffdfb] border border-[#eadfd7] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#a7785e] mb-1">
              TERMINAL 2 ENTERPRISE ECOSYSTEM
            </p>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2c211b]">
              Staff Operational Workspaces
            </h1>
            <p className="text-sm text-[#796b63] mt-1 max-w-2xl">
              Select an operational workspace below to manage kitchen line orders, floor dining tables, customer checkout billing, or complete restaurant administration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#faeedf] text-[#b26732] text-xs font-bold border border-[#f0dac5]">
              <span className="w-2 h-2 rounded-full bg-[#b26732]" />
              Active Shift: Evening
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#dff0e5] text-[#378158] text-xs font-bold border border-[#bfe2cb]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Systems Ready
            </span>
          </div>
        </section>

        {/* 3 Primary Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* 1. Kitchen Monitor */}
          <div className="flex flex-col justify-between rounded-2xl bg-[#fffdfb] border-2 border-[#eadfd7] hover:border-[#df9b70] transition-all duration-200 shadow-sm p-6 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#faeedf] text-[#b26732] grid place-items-center">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#faedc9] text-[#a97819]">
                  Live KDS
                </span>
              </div>

              <h2 className="text-xl font-bold font-serif text-[#2c211b] mb-2 group-hover:text-[#b26732] transition-colors">
                Kitchen Monitor
              </h2>
              <p className="text-sm text-[#796b63] mb-5">
                Real-time kitchen order display board with 6-state order lifecycle, item-level prep checklists, and order rejection flow.
              </p>

              <div className="space-y-2.5 border-t border-[#f0e6de] pt-4 mb-6 text-xs text-[#57473d]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72c48f] shrink-0" />
                  <span>Workflow: NEW &rarr; ACCEPTED &rarr; PREPARING &rarr; READY &rarr; SERVED &rarr; COMPLETED</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72c48f] shrink-0" />
                  <span>Reject order with reason logging (Unavailable, Busy, etc.)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72c48f] shrink-0" />
                  <span>Urgency indicators, sound alerts & item status checkboxes</span>
                </div>
              </div>
            </div>

            <Link
              href="/kitchen"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#30221c] text-[#f9efe7] hover:bg-[#4a2d20] font-bold text-sm transition-colors"
            >
              Launch Kitchen Monitor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2. Cashier + Billing */}
          <div className="flex flex-col justify-between rounded-2xl bg-[#fffdfb] border-2 border-[#eadfd7] hover:border-[#df9b70] transition-all duration-200 shadow-sm p-6 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#e3f3e8] text-[#2e7d4d] grid place-items-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#dff0e5] text-[#378158]">
                  Billing POS
                </span>
              </div>

              <h2 className="text-xl font-bold font-serif text-[#2c211b] mb-2 group-hover:text-[#2e7d4d] transition-colors">
                Cashier + Billing
              </h2>
              <p className="text-sm text-[#796b63] mb-5">
                Front-of-house cashier desk for dining session tracking, bill computation, split payments, refunds, and receipt printing.
              </p>

              <div className="space-y-2.5 border-t border-[#f0e6de] pt-4 mb-6 text-xs text-[#57473d]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72c48f] shrink-0" />
                  <span>Floor table sessions, active orders & running balances</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72c48f] shrink-0" />
                  <span>Payment settlement via Cash, UPI QR, and Card terminal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72c48f] shrink-0" />
                  <span>Partial settlements, refunds, and 80mm thermal receipt generator</span>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/cashier"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#30221c] text-[#f9efe7] hover:bg-[#4a2d20] font-bold text-sm transition-colors mb-3"
              >
                Launch Cashier Desk
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <Link
                  href="/cashier/tables"
                  className="py-1.5 px-2 rounded-lg bg-[#f8f4f0] hover:bg-[#ecd8ca] text-[#796b63] font-semibold transition-colors"
                >
                  Table Floorplan
                </Link>
                <Link
                  href="/cashier/bills"
                  className="py-1.5 px-2 rounded-lg bg-[#f8f4f0] hover:bg-[#ecd8ca] text-[#796b63] font-semibold transition-colors"
                >
                  Bill Register
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Admin Management */}
          <div className="flex flex-col justify-between rounded-2xl bg-[#fffdfb] border-2 border-[#eadfd7] hover:border-[#df9b70] transition-all duration-200 shadow-sm p-6 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#eef2f7] text-[#355375] grid place-items-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#e8f0fe] text-[#1a73e8]">
                  Management
                </span>
              </div>

              <h2 className="text-xl font-bold font-serif text-[#2c211b] mb-2 group-hover:text-[#355375] transition-colors">
                Admin Management
              </h2>
              <p className="text-sm text-[#796b63] mb-5">
                Executive back-office administration: menu catalog, price adjustments, table QR code generation, staff roles, and analytics.
              </p>

              <div className="space-y-2.5 border-t border-[#f0e6de] pt-4 mb-6 text-xs text-[#57473d]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72c48f] shrink-0" />
                  <span>Live menu items, categories, add-on pricing & 86 stock toggles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72c48f] shrink-0" />
                  <span>Table configuration & printable table QR code station</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72c48f] shrink-0" />
                  <span>Revenue charts, sales mix reports & staff permissions</span>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#30221c] text-[#f9efe7] hover:bg-[#4a2d20] font-bold text-sm transition-colors mb-3"
              >
                Launch Admin Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <Link
                  href="/admin/menu"
                  className="py-1.5 px-2 rounded-lg bg-[#f8f4f0] hover:bg-[#ecd8ca] text-[#796b63] font-semibold transition-colors"
                >
                  Menu Catalog
                </Link>
                <Link
                  href="/admin/reports"
                  className="py-1.5 px-2 rounded-lg bg-[#f8f4f0] hover:bg-[#ecd8ca] text-[#796b63] font-semibold transition-colors"
                >
                  Sales Reports
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Route Directory */}
        <section className="rounded-2xl bg-[#fffdfb] border border-[#eadfd7] p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0e6de]">
            <div>
              <h3 className="text-base font-bold text-[#2c211b] font-serif">Staff Module Directory</h3>
              <p className="text-xs text-[#796b63]">Direct shortcuts to all sub-routes across Kitchen, Cashier, and Admin</p>
            </div>
            <span className="text-xs font-semibold text-[#a7785e]">Staff App • Port 3001</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kitchen */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#b26732] mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Kitchen Routes
              </p>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link href="/kitchen" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Kitchen Monitor Board</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/kitchen</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cashier */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#2e7d4d] mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Cashier Sub-routes
              </p>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/cashier" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Cashier Dashboard</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/cashier</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cashier/tables" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Dining Tables</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/cashier/tables</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cashier/orders" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Cashier Orders</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/cashier/orders</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cashier/bills" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Bills & Invoices</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/cashier/bills</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cashier/payments" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Payment Records</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/cashier/payments</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cashier/settings" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>POS Settings</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/cashier/settings</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Admin */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#355375] mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Sub-routes
              </p>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/admin" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Admin Dashboard</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/menu" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Menu Catalog</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/menu</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/categories" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Categories</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/categories</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/tables" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Restaurant Tables</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/tables</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/qr" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Table QR Codes</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/qr</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/orders" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Audit Orders</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/orders</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/bills" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Audit Bills</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/bills</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/payments" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Audit Payments</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/payments</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/reports" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Sales & Revenue Reports</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/reports</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/staff" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>Staff Directory</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/staff</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/settings" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f4f0] text-[#4a2d20] font-medium transition-colors">
                    <span>System Settings</span>
                    <span className="font-mono text-[11px] text-[#a9968c]">/admin/settings</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Customer App Notice */}
        <div className="rounded-xl border border-[#eadfd7] bg-[#f0e6de]/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#796b63]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#a7785e]" />
            <span>
              Customer Table Ordering App is running independently on <strong>Port 3000</strong> (e.g., <code className="bg-white/80 px-1.5 py-0.5 rounded border border-[#e2d5cb]">http://localhost:3000/order?table=12</code>).
            </span>
          </div>
          <a
            href="http://localhost:3000/order?table=12"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#b26732] hover:underline"
          >
            Launch Customer Ordering App <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eadfd7] py-6 text-center text-xs text-[#a9968c]">
        TERMINAL 2 &bull; Enterprise Restaurant Management &bull; Built for High-Volume Operations &bull; Staff Suite v2.0
      </footer>
    </div>
  )
}
