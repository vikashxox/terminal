import { AdminApp } from './AdminApp'
export default function AdminPage() { return <AdminApp /> }

export const metadata = { title: 'Admin Dashboard | Terminal 2', description: 'Manage Terminal 2 restaurant operations.' }

export const dynamic = 'force-dynamic'

// Admin sub-routes are rendered through the shared client workspace.
export function generateStaticParams() { return [] }

// Keep the root page intentionally small so the admin shell remains reusable.
