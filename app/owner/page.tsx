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
  const [loading, setLoading] = useState<boolean>(true)

  // State Form Tambah/Edit Pengeluaran
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `store_id=eq.${selectedStoreId}` }, () => {
        fetchStoreTransactions(selectedStoreId)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cashier_shifts', filter: `store_id=eq.${selectedStoreId}` }, () => {
        fetchStoreTransactions(selectedStoreId)
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

    // Ambil daftar toko milik owner
    const { data: storesList } = await supabase.from('stores').select('*').eq('owner_id', session.user.id)
    
    if (storesList && storesList.length > 0) {
      setStores(storesList)
      setSelectedStoreId(storesList[0].id)
    } else {
      setLoading(false)
    }
  }

  const fetchStoreDetails = async (storeId: string) => {
    const { data } = await supabase.from('stores').select('*').eq('id', storeId).single()
    if (data) setStoreData(data)
  }

  const fetchStoreTransactions = async (storeId: string) => {
    setLoading(true)

    // Ambil Orders
    const { data: orderData } = await supabase
      .from('orders')
      .select('*, tables(nomor), order_items(*, menu_items(nama))')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    // Ambil Expenses (Pengeluaran)
    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    // Ambil Cashier Shifts
    const { data: shiftData } = await supabase
      .from('cashier_shifts')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (orderData) setOrders(orderData)
    if (expenseData) setExpenses(expenseData)
    if (shiftData) setShifts(shiftData)

    setLoading(false)
  }

  // 💸 Simpan atau Update Pengeluaran
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
        // Update Pengeluaran
        const { error } = await supabase
          .from('expenses')
          .update({ title: expenseTitle, amount: amountVal })
          .eq('id', editingExpenseId)

        if (error) throw error
        alert('✅ Pengeluaran berhasil diperbarui!')
      } else {
        // Tambah Pengeluaran Baru
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

  // ✏️ Edit Pengeluaran (Load ke Form)
  const handleEditExpense = (item: any) => {
    setEditingExpenseId(item.id)
    setExpenseTitle(item.title)
    setExpenseAmount(item.amount.toString())
  }

  // 🗑️ Hapus Pengeluaran
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

  // Kalkulasi Keuangan Real-Time
  const completedOrders = orders.filter((o) => o.status === 'selesai')
  const totalOmzet = completedOrders.reduce((acc, curr) => acc + (curr.total_harga || 0), 0)
  const totalPengeluaran = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const bersihOmzet = totalOmzet - totalPengeluaran

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans pb-20">
      
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-amber-400">🚪 Panel Eksekutif Owner</h1>
          <p className="text-xs text-slate-400 mt-0.5">Pantau laporan keuangan, pengeluaran, dan rekap shift kasir secara real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/kasir" className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl hover:bg-slate-800 transition">
            🔙 Kembali ke Kasir
          </Link>
        </div>
      </div>

      {/* Selector Toko */}
      <div className="max-w-6xl mx-auto mt-6 flex items-center gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Toko:</span>
        <select
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300 px-3 py-2 rounded-xl focus:outline-none"
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              🏪 {s.store_name} ({s.slug})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="max-w-6xl mx-auto mt-10 h-64 bg-slate-900/40 rounded-3xl animate-pulse border border-slate-800" />
      ) : (
        <div className="max-w-6xl mx-auto mt-6 space-y-6">
          
          {/* Ringkasan Grafik Keuangan Real-Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Total Omzet Penjualan</p>
              <p className="text-2xl font-black text-emerald-400">Rp {totalOmzet.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-slate-500">Dari {completedOrders.length} pesanan selesai</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Total Pengeluaran Toko</p>
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

          {/* Grid Kelola Pengeluaran & Riwayat Shift */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Form & List Pengeluaran */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                {editingExpenseId ? '✏️ Edit Pengeluaran Toko' : '💸 Tambah Pengeluaran Toko'}
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
                        <div className="flex items-center gap-3">
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
                  <p className="text-xs text-slate-500 italic text-center py-6">Belum ada data shift kasir untuk toko ini.</p>
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
    </div>
  )
}
