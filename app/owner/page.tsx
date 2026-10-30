'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function OwnerDashboardPage() {
  const [stores, setStores] = useState<any[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
  const [storeData, setStoreData] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // State Form Tambah/Edit Pengeluaran
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)

  // State Target Omzet Bulanan
  const [monthlyTarget, setMonthlyTarget] = useState<number>(5000000)
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false)
  const [inputTarget, setInputTarget] = useState<string>('')

  // State Modal Tautan Cabang Toko Baru
  const [showAddStoreModal, setShowAddStoreModal] = useState<boolean>(false)
  const [newStoreSlug, setNewStoreSlug] = useState<string>('')

  // State Ganti Master PIN 6-Digit
  const [showPinModal, setShowPinModal] = useState<boolean>(false)
  const [oldPin, setOldPin] = useState<string>('')
  const [newPin, setNewPin] = useState<string>('')
  const [confirmPin, setConfirmPin] = useState<string>('')

  const supabase = createClient()

  useEffect(() => {
    checkOwnerAuthAndFetchStores()
  }, [])

  // Real-Time Subscriptions untuk Toko yang Dipilih
  useEffect(() => {
    if (!selectedStoreId) return

    fetchStoreDetails(selectedStoreId)
    fetchStoreTransactions(selectedStoreId)

    const channel = supabase
      .channel(`owner-realtime-${selectedStoreId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${selectedStoreId}` }, () => {
        fetchStoreTransactions(selectedStoreId)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        fetchStoreTransactions(selectedStoreId)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `store_id=eq.${selectedStoreId}` }, () => {
        fetchStoreTransactions(selectedStoreId)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cashier_shifts', filter: `store_id=eq.${selectedStoreId}` }, () => {
        fetchStoreTransactions(selectedStoreId)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: `store_id=eq.${selectedStoreId}` }, () => {
        fetchStoreTransactions(selectedStoreId)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores', filter: `id=eq.${selectedStoreId}` }, () => {
        fetchStoreDetails(selectedStoreId)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedStoreId])

  const checkOwnerAuthAndFetchStores = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/kasir/login'
      return
    }

    const { data: storesList } = await supabase.from('stores').select('*').eq('owner_id', session.user.id).order('created_at', { ascending: true })
    
    if (storesList && storesList.length > 0) {
      setStores(storesList)
      if (!selectedStoreId || !storesList.some(s => s.id === selectedStoreId)) {
        setSelectedStoreId(storesList[0].id)
      }
    } else {
      setStores([])
      setSelectedStoreId('')
      setLoading(false)
    }
  }

  const fetchStoreDetails = async (storeId: string) => {
    const { data } = await supabase.from('stores').select('*').eq('id', storeId).single()
    if (data) {
      setStoreData(data)
      if (data.monthly_target) setMonthlyTarget(data.monthly_target)
    }
  }

  const fetchStoreTransactions = async (storeId: string) => {
    setLoading(true)

    const { data: orderData } = await supabase
      .from('orders')
      .select('*, tables(nomor), order_items(*, menu_items(nama, harga))')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    const { data: shiftData } = await supabase
      .from('cashier_shifts')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    const { data: menuData } = await supabase
      .from('menu_items')
      .select('*')
      .eq('store_id', storeId)
      .order('nama')

    if (orderData) setOrders(orderData)
    if (expenseData) setExpenses(expenseData)
    if (shiftData) setShifts(shiftData)
    if (menuData) setMenuItems(menuData)

    setLoading(false)
  }

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseTitle || !expenseAmount || !selectedStoreId) {
      alert('⚠️ Mohon isi nama dan nominal pengeluaran!')
      return
    }

    try {
      const amountVal = parseFloat(expenseAmount)
      if (isNaN(amountVal)) {
        alert('⚠️ Nominal pengeluaran harus berupa angka!')
        return
      }

      if (editingExpenseId) {
        const { error } = await supabase
          .from('expenses')
          .update({ title: expenseTitle, amount: amountVal })
          .eq('id', editingExpenseId)

        if (error) throw error
        alert('✅ Pengeluaran berhasil diperbarui!')
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert({
            store_id: selectedStoreId,
            title: expenseTitle,
            amount: amountVal,
            created_at: new Date().toISOString()
          })

        if (error) throw error
        alert('✅ Pengeluaran berhasil ditambahkan!')
      }

      setExpenseTitle('')
      setExpenseAmount('')
      setEditingExpenseId(null)
      fetchStoreTransactions(selectedStoreId)
    } catch (err: any) {
      alert(`❌ Gagal menyimpan pengeluaran: ${err.message}`)
    }
  }

  const handleEditExpense = (item: any) => {
    setEditingExpenseId(item.id)
    setExpenseTitle(item.title)
    setExpenseAmount(item.amount.toString())
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus data pengeluaran ini?')) return

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error

      alert('🗑️ Pengeluaran berhasil dihapus!')
      fetchStoreTransactions(selectedStoreId)
    } catch (err: any) {
      alert(`❌ Gagal menghapus: ${err.message}`)
    }
  }

  const handleSaveMonthlyTarget = async () => {
    if (!selectedStoreId || !inputTarget) return
    const targetVal = parseFloat(inputTarget)
    if (isNaN(targetVal)) {
      alert('⚠️ Masukkan angka target yang valid!')
      return
    }

    const { error } = await supabase.from('stores').update({ monthly_target: targetVal }).eq('id', selectedStoreId)
    if (error) {
      alert('Gagal menyimpan target: ' + error.message)
    } else {
      setMonthlyTarget(targetVal)
      setShowTargetModal(false)
      setInputTarget('')
      alert('🎯 Target omzet berhasil diperbarui!')
    }
  }

  // Fungsi Simpan Master PIN Baru
  const handleUpdateMasterPin = async () => {
    if (!selectedStoreId || !storeData) return
    if (!oldPin || !newPin || !confirmPin) {
      alert('⚠️ Mohon isi semua kolom PIN!')
      return
    }

    if (newPin.length !== 6 || confirmPin.length !== 6) {
      alert('⚠️ PIN Master harus terdiri dari tepat 6 digit angka!')
      return
    }

    if (newPin !== confirmPin) {
      alert('❌ Konfirmasi PIN baru tidak cocok!')
      return
    }

    // Cek PIN lama (jika di database sudah ada master_pin)
    if (storeData.master_pin && storeData.master_pin !== oldPin) {
      alert('❌ PIN Master lama yang kamu masukkan salah!')
      return
    }

    const { error } = await supabase
      .from('stores')
      .update({ master_pin: newPin })
      .eq('id', selectedStoreId)

    if (error) {
      alert('❌ Gagal mengubah Master PIN: ' + error.message)
    } else {
      alert('🔒 Master PIN berhasil diperbarui!')
      setShowPinModal(false)
      setOldPin('')
      setNewPin('')
      setConfirmPin('')
      fetchStoreDetails(selectedStoreId)
    }
  }

  const handleLinkNewStore = async () => {
    if (!newStoreSlug) {
      alert('⚠️ Mohon masukkan Slug URL cabang toko!')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const cleanSlug = newStoreSlug.toLowerCase().trim().replace(/\s+/g, '-')

    const { data: existingStore, error: fetchError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', cleanSlug)
      .single()

    if (fetchError || !existingStore) {
      alert('❌ Cabang dengan Slug tersebut tidak ditemukan di database!')
      return
    }

    const { error: updateError } = await supabase
      .from('stores')
      .update({ owner_id: session.user.id })
      .eq('id', existingStore.id)

    if (updateError) {
      alert('❌ Gagal menautkan cabang: ' + updateError.message)
    } else {
      alert(`✅ Cabang "${existingStore.store_name}" berhasil ditautkan ke akun owner kamu!`)
      setShowAddStoreModal(false)
      setNewStoreSlug('')
      checkOwnerAuthAndFetchStores()
      setSelectedStoreId(existingStore.id)
    }
  }

  const handleUnlinkStore = async () => {
    if (stores.length <= 1) {
      alert('⚠️ Tidak dapat melepas tautan karena ini adalah satu-satunya cabang toko yang kamu miliki.')
      return
    }

    if (stores[0].id === selectedStoreId) {
      alert('🔒 Cabang utama (pertama) tidak dapat dilepas tautannya demi keamanan kepemilikan toko!')
      return
    }

    const storeToUnlink = stores.find(s => s.id === selectedStoreId)
    const confirmUnlink = confirm(`⚠️ Apakah kamu yakin ingin melepas tautan cabang "${storeToUnlink?.store_name || 'ini'}" dari akun kamu?`)
    
    if (!confirmUnlink) return

    try {
      const { error } = await supabase
        .from('stores')
        .update({ owner_id: null })
        .eq('id', selectedStoreId)

      if (error) throw error

      alert('🔓 Tautan cabang berhasil dilepas!')
      checkOwnerAuthAndFetchStores()
    } catch (err: any) {
      alert('❌ Gagal melepas tautan: ' + err.message)
    }
  }

  // Kalkulasi Keuangan Real-Time
  const completedOrders = orders.filter((o) => o.status === 'selesai')
  const totalOmzet = completedOrders.reduce((acc, curr) => acc + (curr.total_harga || 0), 0)
  const totalPengeluaran = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const bersihOmzet = totalOmzet - totalPengeluaran

  const targetPercentage = monthlyTarget > 0 ? Math.min(100, Math.round((totalOmzet / monthlyTarget) * 100)) : 0

  const productSalesMap: { [key: string]: { name: string; qty: number; revenue: number } } = {}
  completedOrders.forEach((ord) => {
    ord.order_items?.forEach((item: any) => {
      if (!item.menu_items || !item.menu_items.nama) return

      const menuName = item.menu_items.nama
      if (!productSalesMap[menuName]) {
        productSalesMap[menuName] = { name: menuName, qty: 0, revenue: 0 }
      }
      productSalesMap[menuName].qty += (item.qty || 0)
      productSalesMap[menuName].revenue += ((item.harga_satuan || item.menu_items?.harga || 0) * (item.qty || 0))
    })
  })

  const bestSellerProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans pb-20 overflow-x-hidden w-full box-border">
      
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-amber-400">🚪 Panel Eksekutif Owner</h1>
          <p className="text-xs text-slate-400 mt-0.5">Pantau laporan keuangan, multi-cabang tertaut, produk terlaris, stok, dan rekap shift kasir.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPinModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow transition"
          >
            🔒 Ganti Master PIN
          </button>
          <button
            onClick={() => setShowAddStoreModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow transition"
          >
            🔗 Tautkan Cabang Baru
          </button>
          <Link href="/kasir" className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl hover:bg-slate-800 transition">
            🔙 Kembali ke Kasir
          </Link>
        </div>
      </div>

      {/* Selector Multi-Cabang Toko & Tombol Unlink */}
      <div className="max-w-6xl mx-auto mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3 flex-wrap w-full">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">🏪 Pilih Cabang Tertaut:</span>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300 px-3 py-2 rounded-xl focus:outline-none max-w-full truncate"
          >
            {stores.map((s, idx) => (
              <option key={s.id} value={s.id}>
                {s.store_name} {idx === 0 ? '(Cabang Utama)' : ''} (Slug: /{s.slug})
              </option>
            ))}
          </select>

          {stores.length > 1 && stores[0]?.id !== selectedStoreId && (
            <button
              onClick={handleUnlinkStore}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl transition"
            >
              🔓 Lepas Tautan Cabang Ini
            </button>
          )}
        </div>

        {storeData && (
          <div className="text-xs text-slate-300 shrink-0">
            Status Toko: <strong className={storeData.is_open ? 'text-emerald-400' : 'text-rose-400'}>{storeData.is_open ? '● BUKA' : '○ TUTUP'}</strong>
          </div>
        )}
      </div>

      {loading ? (
        <div className="max-w-6xl mx-auto mt-10 h-64 bg-slate-900/40 rounded-3xl animate-pulse border border-slate-800" />
      ) : (
        <div className="max-w-6xl mx-auto mt-6 space-y-6">
          
          {/* Target Omzet & Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">🎯 Target Omzet Bulanan Cabang Ini</h3>
                <p className="text-sm font-bold text-white mt-0.5">
                  Rp {totalOmzet.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-normal">dari target Rp {monthlyTarget.toLocaleString('id-ID')}</span>
                </p>
              </div>
              <button
                onClick={() => { setInputTarget(monthlyTarget.toString()); setShowTargetModal(true); }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700"
              >
                ✏️ Atur Target
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 relative">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>Pencapaian: {targetPercentage}%</span>
              <span>{targetPercentage >= 100 ? '🎉 Target Tercapai!' : 'Semangat Kejar Omzet!'}</span>
            </div>
          </div>

          {/* Ringkasan Grafik Keuangan Real-Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Total Omzet Penjualan</p>
              <p className="text-2xl font-black text-emerald-400">Rp {totalOmzet.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-slate-500">Dari {completedOrders.length} pesanan selesai</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Total Pengeluaran Cabang</p>
              <p className="text-2xl font-black text-rose-400">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-slate-500">Dari {expenses.length} catatan pengeluaran</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Keuntungan Bersih (Profit)</p>
              <p className={`text-2xl font-black ${bersihOmzet >= 0 ? 'text-cyan-400' : 'text-rose-500'}`}>
                Rp {bersihOmzet.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-slate-500">Omzet dikurangi pengeluaran</p>
            </div>
          </div>

          {/* 🏆 PRODUK TERLARIS & 📦 MONITORING STOK */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Produk Paling Laku (Best Seller) */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">🏆 Produk Paling Laku (Best Seller)</h3>
              
              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {bestSellerProducts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">Belum ada data penjualan produk.</p>
                ) : (
                  bestSellerProducts.map((prod, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-white">{prod.name}</p>
                          <p className="text-[10px] text-slate-400">Terjual: <strong className="text-emerald-400">{prod.qty} Porsi/Item</strong></p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-cyan-300">Rp {prod.revenue.toLocaleString('id-ID')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Monitoring Stok Produk Real-Time */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">📦 Monitoring Stok Produk & Menu</h3>
              
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {menuItems.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">Belum ada data menu/produk di cabang ini.</p>
                ) : (
                  menuItems.map((menu) => {
                    const isLowStock = menu.stok !== undefined && menu.stok !== null && menu.stok <= 5
                    return (
                      <div key={menu.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{menu.nama}</p>
                          <p className="text-[10px] text-slate-400">Harga: Rp {menu.harga?.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black font-mono ${menu.stok === 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : isLowStock ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                            {menu.stok !== undefined && menu.stok !== null ? `Stok: ${menu.stok}` : 'Stok: Unlimited'}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>

          {/* Grid Kelola Pengeluaran & Riwayat Shift */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Form & List Pengeluaran */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                {editingExpenseId ? '✏️ Edit Pengeluaran Cabang' : '💸 Tambah Pengeluaran Cabang'}
              </h3>

              <form onSubmit={handleSaveExpense} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Keterangan / Nama Pengeluaran</label>
                  <input
                    type="text"
                    placeholder="Contoh: Beli Biji Kopi, Gas LPG, Token Listrik"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nominal (Rp)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 font-bold rounded-xl"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition">
                    {editingExpenseId ? 'Perbarui Pengeluaran' : 'Simpan Pengeluaran'}
                  </button>
                  {editingExpenseId && (
                    <button
                      type="button"
                      onClick={() => { setEditingExpenseId(null); setExpenseTitle(''); setExpenseAmount(''); }}
                      className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl text-slate-400"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Daftar Pengeluaran Terakhir</h4>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {expenses.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">Belum ada catatan pengeluaran.</p>
                  ) : (
                    expenses.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-rose-400">-Rp {item.amount?.toLocaleString('id-ID')}</span>
                          <button onClick={() => handleEditExpense(item)} className="text-[10px] text-amber-300 px-2 py-1 bg-amber-950/40 rounded-lg font-bold">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteExpense(item.id)} className="text-[10px] text-rose-400 px-2 py-1 bg-rose-950/40 rounded-lg font-bold">
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Riwayat Shift & Rekonsiliasi Kasir */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">⏱️ Riwayat Shift & Rekonsiliasi Kasir</h3>
              
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                {shifts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">Belum ada data shift kasir untuk cabang ini.</p>
                ) : (
                  shifts.map((shift) => (
                    <div key={shift.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-emerald-400">Kasir: {shift.cashier_name || 'Kasir'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${shift.status === 'open' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                          {shift.status === 'open' ? '🟢 Aktif' : '⚪ Ditutup'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>Modal Awal: <strong className="font-mono text-white">Rp {shift.starting_cash?.toLocaleString('id-ID')}</strong></div>
                        <div>Kas Fisik Laci: <strong className="font-mono text-white">Rp {shift.ending_cash?.toLocaleString('id-ID')}</strong></div>
                        <div>Kas Seharusnya: <strong className="font-mono text-white">Rp {shift.expected_cash?.toLocaleString('id-ID')}</strong></div>
                        <div>
                          Selisih: <strong className={`font-mono ${(shift.difference || 0) < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            Rp {shift.difference?.toLocaleString('id-ID')}
                          </strong>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 flex justify-between">
                        <span>Mulai: {new Date(shift.start_time).toLocaleString('id-ID')}</span>
                        {shift.end_time && <span>Selesai: {new Date(shift.end_time).toLocaleString('id-ID')}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODAL ATUR TARGET OMZET */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-xs rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-amber-400">🎯 Atur Target Omzet Bulanan</h3>
            <input
              type="number"
              placeholder="Contoh: 10000000"
              value={inputTarget}
              onChange={(e) => setInputTarget(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-bold rounded-xl font-mono"
            />
            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveMonthlyTarget} className="flex-1 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">Simpan Target</button>
              <button onClick={() => setShowTargetModal(false)} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GANTI MASTER PIN 6-DIGIT */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-6 space-y-3.5 shadow-2xl">
            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-wider">🔒 Ganti Master PIN (6-Digit)</h3>
            <p className="text-[10px] text-slate-400">PIN Master digunakan untuk otorisasi khusus oleh Owner pada sistem kasir.</p>
            
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">PIN Master Lama</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="******"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl font-mono text-center tracking-widest"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">PIN Master Baru (6 Digit)</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="******"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl font-mono text-center tracking-widest"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Konfirmasi PIN Baru</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="******"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl font-mono text-center tracking-widest"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleUpdateMasterPin} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow transition">
                Simpan PIN Baru
              </button>
              <button
                onClick={() => { setShowPinModal(false); setOldPin(''); setNewPin(''); setConfirmPin(''); }}
                className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAUTKAN CABANG BERDASARKAN SLUG */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-6 space-y-3.5">
            <h3 className="text-sm font-bold text-amber-400">🔗 Tautkan Cabang Toko</h3>
            <p className="text-[10px] text-slate-400">Masukkan slug URL cabang toko yang sudah ada agar otomatis tertaut ke akun owner kamu.</p>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Slug URL Toko</label>
              <input
                type="text"
                placeholder="Contoh: warkop-cabang-2"
                value={newStoreSlug}
                onChange={(e) => setNewStoreSlug(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl font-mono"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleLinkNewStore} className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">Tautkan Cabang</button>
              <button onClick={() => setShowAddStoreModal(false)} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl text-slate-400">Batal</button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-6 text-[10px] text-slate-400 font-medium border-t border-slate-800 mt-8">
        Powered by <strong className="text-emerald-400">reyyztore</strong> • Digital POS System
      </footer>

    </div>
  )
}
