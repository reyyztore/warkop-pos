'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function OrderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mejaParam = searchParams.get('meja')
  const supabase = createClient()

  const [menuItems, setMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [selectedTable, setSelectedTable] = useState(mejaParam || '')
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    initData()
  }, [])

  const initData = async () => {
    setLoading(true)
    const { data: catData } = await supabase.from('categories').select('*').order('urutan')
    const { data: menuData } = await supabase.from('menu_items').select('*').eq('tersedia', true)
    const { data: tblData } = await supabase.from('tables').select('*').eq('aktif', true).order('nomor')

    if (catData) setCategories(catData)
    if (menuData) setMenuItems(menuData)
    if (tblData) setTables(tblData)
    setLoading(false)
  }

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0
      const updated = current + delta
      if (updated <= 0) {
        const copy = { ...prev }
        delete copy[id]
        return copy
      }
      return { ...prev, [id]: updated }
    })
  }

  const getTotalHarga = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const item = menuItems.find((m) => m.id === id)
      return total + (item ? item.harga * qty : 0)
    }, 0)
  }

  const handleCheckout = async () => {
    if (!selectedTable) {
      alert('Pilih nomor meja kamu terlebih dahulu!')
      return
    }
    if (Object.keys(cart).length === 0) {
      alert('Pilih minimal 1 menu sebelum memesan.')
      return
    }

    setSubmitting(true)

    try {
      const namaPemesan = localStorage.getItem('customer_name') || 'Tamu'
      const targetTable = tables.find((t) => t.nomor.toString() === selectedTable.toString())

      if (!targetTable) throw new Error('Meja tidak valid.')

      // 1. Buat Header Pesanan
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          table_id: targetTable.id,
          nama_pemesan: namaPemesan,
          total_harga: getTotalHarga(),
          status: 'pending',
        })
        .select()
        .single()

      if (orderErr) throw orderErr

      // 2. Buat Detail Item
      const orderItems = Object.entries(cart).map(([menuId, qty]) => {
        const item = menuItems.find((m) => m.id === menuId)
        return {
          order_id: orderData.id,
          menu_id: menuId,
          qty,
          harga_satuan: item?.harga || 0,
        }
      })

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      alert('Pesanan berhasil dikirim ke kasir!')
      setCart({})
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesanan.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header Meja */}
      <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-sm space-y-2">
        <h1 className="text-lg font-bold">Menu Warung Kopi</h1>
        <div className="flex items-center gap-2 text-xs">
          <span>Pilih Meja:</span>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="bg-emerald-700 text-white px-3 py-1 rounded-lg border border-emerald-500 font-bold focus:outline-none"
          >
            <option value="">-- Pilih --</option>
            {tables.map((t) => (
              <option key={t.id} value={t.nomor}>
                Meja #{t.nomor}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List Menu */}
      {loading ? (
        <p className="text-xs text-slate-400 text-center">Memuat menu...</p>
      ) : (
        <div className="space-y-4">
          {menuItems.map((item) => {
            const qty = cart[item.id] || 0
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm"
              >
                {item.foto_url ? (
                  <img src={item.foto_url} alt={item.nama} className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                    ☕
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm">{item.nama}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{item.deskripsi}</p>
                  <p className="text-xs font-bold text-emerald-600 mt-1">
                    Rp {item.harga.toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Counter */}
                <div className="flex items-center gap-2">
                  {qty > 0 && (
                    <>
                      <button
                        onClick={() => updateCart(item.id, -1)}
                        className="w-7 h-7 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-800">{qty}</span>
                    </>
                  )}
                  <button
                    onClick={() => updateCart(item.id, 1)}
                    className="w-7 h-7 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-sm shadow-emerald-200"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-slate-800">
          <div>
            <p className="text-[10px] text-slate-400">Total Pembayaran</p>
            <p className="text-sm font-bold text-emerald-400">
              Rp {getTotalHarga().toLocaleString('id-ID')}
            </p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
          >
            {submitting ? 'Kirim...' : 'Kirim Pesanan →'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function MejaPage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs text-slate-400 text-center">Memuat...</div>}>
      <OrderContent />
    </Suspense>
  )
}
