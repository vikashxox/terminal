"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  Plus,
  ShieldCheck,
  Store,
  X,
} from "lucide-react"

export default function NewMenuItemPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Burgers")
  const [price, setPrice] = useState("")
  const [taxCategory, setTaxCategory] = useState("GST 5% (Standard F&B)")
  const [type, setType] = useState<"Veg" | "Non-Veg">("Non-Veg")
  const [image, setImage] = useState("")
  const [available, setAvailable] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [addons, setAddons] = useState<{ name: string; price: number }[]>([
    { name: "Extra Cheese", price: 30 },
    { name: "Extra Patty", price: 60 },
    { name: "Extra Sauce", price: 20 },
  ])
  const [addonName, setAddonName] = useState("")
  const [addonPrice, setAddonPrice] = useState("")
  const [toast, setToast] = useState("")

  const notify = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(""), 2500)
  }

  const handleAddAddon = () => {
    if (!addonName.trim() || !addonPrice) return
    setAddons((prev) => [...prev, { name: addonName.trim(), price: Number(addonPrice) }])
    setAddonName("")
    setAddonPrice("")
  }

  const handleRemoveAddon = (idx: number) => {
    setAddons((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = () => {
    if (!name.trim()) {
      notify("Please provide an item name")
      return
    }
    if (!price || Number(price) <= 0) {
      notify("Please provide a valid price")
      return
    }
    notify(`"${name}" saved to menu successfully!`)
    window.setTimeout(() => {
      router.push("/admin/menu")
    }, 1000)
  }

  const categories = [
    "Breakfast",
    "Main Course",
    "Burgers",
    "Pizza",
    "Snacks",
    "Coffee",
    "Beverages",
    "Desserts",
  ]

  const taxes = [
    "GST 5% (Standard F&B)",
    "GST 12% (Packaged Food)",
    "GST 18% (Confectionery)",
    "Tax Exempt (0%)",
  ]

  return (
    <div className="admin-shell">
      <main className="admin-main" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <header className="admin-header" style={{ marginBottom: 28 }}>
          <div>
            <Link
              href="/admin/menu"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#a7785e",
                fontWeight: 700,
                textDecoration: "none",
                marginBottom: 8,
              }}
            >
              <ArrowLeft style={{ width: 14 }} /> Back to Menu
            </Link>
            <p className="admin-kicker">CATALOG MANAGEMENT / NEW ITEM</p>
            <h1>Add Menu Item</h1>
            <p>Create a new food or beverage item for customer ordering</p>
          </div>
        </header>

        <div className="admin-panel">
          <div className="admin-form">
            {/* Basic Info */}
            <div className="admin-form-row">
              <label>
                Item Name *
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Classic Chicken Burger"
                  autoFocus
                />
              </label>

              <label>
                Category *
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Delicious grilled chicken breast with fresh iceberg lettuce and creamy garlic mayo on a brioche bun."
                rows={3}
              />
            </label>

            {/* Pricing & Tax */}
            <div className="admin-form-row">
              <label>
                Price (₹) *
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="180"
                  min={0}
                />
              </label>

              <label>
                Tax Category *
                <select value={taxCategory} onChange={(e) => setTaxCategory(e.target.value)}>
                  {taxes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Veg / Non-Veg & Image */}
            <div className="admin-form-row">
              <label>
                Veg / Non-Veg *
                <select value={type} onChange={(e) => setType(e.target.value as "Veg" | "Non-Veg")}>
                  <option value="Veg">Veg (Vegetarian)</option>
                  <option value="Non-Veg">Non-Veg (Contains Meat/Poultry/Seafood)</option>
                </select>
              </label>

              <label>
                Image URL
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={() => setImage("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400")}
                    title="Insert sample burger photo"
                  >
                    <ImageIcon style={{ width: 14 }} /> Sample
                  </button>
                </div>
              </label>
            </div>

            {/* Availability & Featured */}
            <div className="admin-toggle-row">
              <span>
                <strong>Availability Status</strong>
                <small>When enabled, guests can view and order this item from table QR</small>
              </span>
              <button
                type="button"
                className={`admin-toggle ${available ? "on" : ""}`}
                onClick={() => setAvailable(!available)}
              />
            </div>

            <div className="admin-toggle-row">
              <span>
                <strong>Featured Item</strong>
                <small>Displays as a highlighted chef special recommendation on customer menu</small>
              </span>
              <button
                type="button"
                className={`admin-toggle ${featured ? "on" : ""}`}
                onClick={() => setFeatured(!featured)}
              />
            </div>

            {/* Add-ons & Customizations */}
            <div className="admin-addons-section">
              <p className="admin-kicker">OPTIONAL ADD-ONS & CUSTOMIZATIONS</p>
              <p style={{ fontSize: 12, color: "var(--admin-muted)", margin: "0 0 10px" }}>
                Guests can choose optional upgrades when adding this item to cart.
              </p>

              {addons.map((a, i) => (
                <div key={i} className="admin-addon-row">
                  <span>{a.name}</span>
                  <b>+₹{a.price}</b>
                  <button type="button" onClick={() => handleRemoveAddon(i)} aria-label="Remove addon">
                    <X />
                  </button>
                </div>
              ))}

              <div className="admin-addon-input">
                <input
                  placeholder="Add-on title (e.g. Extra Mayo)"
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  placeholder="Price (₹)"
                  type="number"
                  value={addonPrice}
                  onChange={(e) => setAddonPrice(e.target.value)}
                  style={{ width: 100 }}
                  min={0}
                />
                <button type="button" className="admin-btn-outline" onClick={handleAddAddon}>
                  <Plus style={{ width: 14 }} /> Add Add-on
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="admin-form-actions" style={{ marginTop: 28 }}>
              <button type="button" className="admin-btn-primary" onClick={handleSave} style={{ padding: "12px 24px" }}>
                <Check style={{ width: 16 }} /> Save Item
              </button>
              <Link href="/admin/menu" className="admin-btn-outline" style={{ padding: "12px 20px" }}>
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className="admin-toast">
          <ShieldCheck /> {toast}
        </div>
      )}
    </div>
  )
}
