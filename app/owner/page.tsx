'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function OwnerPanelPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [stores, setStores] = useState<any[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all')

  // Owner Config & Analytics State
  const [totalOmzet, setTotalOmzet] = useState<number>(0)
  const [totalHpp, setTotalHpp] = useState<number>(0)
  const [totalExpense, setTotalExpense] = useState<number>(0)
  const [netProfit, setNetProfit] = useState<number>(0)
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0)
  const [topMenuItems, setTopMenuItems] = useState<any[]>([])
  const [recentExpenses, setRecentExpenses] = useState<any[]>([])

  // Target Omzet & Multi-Branch Toggle
  const [monthlyTarget, setMonthlyTarget] = useState<number>(10000000)
  const [isMultiBranch, setIsMultiBranch] = useState<boolean>(false)

  // 🆕 MASTER PIN STATE
  const [currentMasterPin, setCurrentMasterPin] = useState<string>('123456')
  const [showPinChangeModal, setShowPinChangeModal] = useState<boolean>(false)
  const [oldPinInput, setOldPinInput] = useState<string>('')
  const [newPinInput, setNewPinInput] = useState<string>('')

  // Form Modal Expense State
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false)
  const [expenseDesc, setExpenseDesc] = useState<string>('')
  const [expenseAmount, setExpenseAmount] = useState<string>('')

  // Form Modal Tambah Cabang State
  const [showAddBranchModal, setShowAddBranchModal] = useState<boolean>(false)
  const [newBranchName, setNewBranchName] = useState<string>('')
  const [newBranchSlug, setNewBranchSlug] = useState<string>('')

  useEffect(() => {
    initOwnerData()
  }, [])

  useEffect(() => {
    if (stores.length > 0) {
      fetchAnalytics(selectedStoreId)
    }
  }, [selectedStoreId, stores])

  const initOwnerData = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/kasir/login'
      return
    }

    const { data: userStores } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', session.user.id)

    if (userStores && userStores.length > 0) {
      setStores(userStores)
      setIsMultiBranch(userStores[0].is_multi_branch || false)
      setMonthlyTarget(userStores[0].monthly_target || 10000000)
      if (userStores[0].master_pin) {
        setCurrentMasterPin(userStores[0].master_pin)
      }
    } else {
      const { data: profile } = await supabase.from('profiles').select('store_id').eq('id', session.user.id).single()
      if (profile?.store_id) {
        const { data: singleStore } = await supabase.from('stores').select('*').eq('id', profile.store_id)
        if (singleStore && singleStore.length > 0) {
          setStores(singleStore)
          if (singleStore[0].master_pin) {
            setCurrentMasterPin(singleStore[0].master_pin)
          }
        }
      }
    }
    setLoading(false)
  }

  const fetchAnalytics = async (targetStoreId: string) => {
    setLoading(true)

    let targetIds: string[] = []
    if (targetStoreId === 'all') {
      targetIds = stores.map((s) => s.id)
    } else {
      targetIds = [targetStoreId]
    }

    if (targetIds.length === 0) {
      setLoading(false)
      return
    }

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(nama))')
      .in('store_id', targetIds)
      .eq('status', 'selesai')

    const { data: expenseData } = await supabase
      .from('store_expenses')
      .select('*')
      .in('store_id', targetIds)
      .order('created_at', { ascending: false })

    if (ordersData) {
      setTotalOrdersCount(ordersData.length)

      const omzetCalculated = ordersData.reduce((acc, curr) => acc + (curr.total_harga || 0), 0)
      setTotalOmzet(omzetCalculated)

      let hppCalculated = 0
      const itemMap: { [key: string]: { nama: string; qty: number; totalRp: number } } = {}

      ordersData.forEach((ord) => {
        ord.order_items?.forEach((item: any) => {
          const menuName = item.menu_items?.nama || 'Menu'
          const itemQty = item.qty || 1
          const itemPrice = (item.harga_satuan || 0) * itemQty
          hppCalculated += (item.hpp_satuan || 0) * itemQty

          if (!itemMap[menuName]) {
            itemMap[menuName] = { nama: menuName, qty: 0, totalRp: 0 }
          }
          itemMap[menuName].qty += itemQty
          itemMap[menuName].totalRp += itemPrice
        })
      })

      setTotalHpp(hppCalculated)

      const sortedTopItems = Object.values(itemMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)

      setTopMenuItems(sortedTopItems)
    }

    if (expenseData) {
      setRecentExpenses(expenseData)
      const expenseCalculated = expenseData.reduce((acc, curr) => acc + (curr.amount || 0), 0)
      setTotalExpense(expenseCalculated)
    }

    setLoading(false)
  }

  useEffect(() => {
    setNetProfit(totalOmzet - totalHpp - totalExpense)
  }, [totalOmzet, totalHpp, totalExpense])

  const handleToggleMultiBranch = async (nextState: boolean) => {
    setIsMultiBranch(nextState)
    if (stores.length > 0) {
      await supabase.from('stores').update({ is_multi_branch: nextState }).in('id', stores.map((s) => s.id))
    }
  }

  // 🆕 FUNGSI MENGGANTI MASTER PIN 6-DIGIT
  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (oldPinInput !== currentMasterPin) {
      alert('❌ PIN Lama yang Anda masukkan salah!')
      return
    }

    if (newPinInput.length !== 6 || !/^\d+$/.test(newPinInput)) {
      alert('⚠️ Master PIN harus berupa 6 angka!')
      return
    }

    try {
      const storeIds = stores.map((s) => s.id)
      await supabase
        .from('stores')
        .update({ master_pin: newPinInput })
        .in('id', storeIds)

      setCurrentMasterPin(newPinInput)
      setOldPinInput('')
      setNewPinInput('')
      setShowPinChangeModal(false)
      alert('✅ Master PIN 6-Digit Berhasil Diperbarui!')
    } catch (err: any) {
      alert('Gagal mengubah PIN: ' + err.message)
    }
  }

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseDesc || !expenseAmount) return

    const activeStoreId = selectedStoreId === 'all' ? stores[0]?.id : selectedStoreId
    if (!activeStoreId) return

    await supabase.from('store_expenses').insert({
      store_id: activeStoreId,
      description: expenseDesc,
      amount: parseFloat(expenseAmount),
      category: 'operasional',
    })

    setExpenseDesc('')
    setExpenseAmount('')
    setShowExpenseModal(false)
    fetchAnalytics(selectedStoreId)
    alert('✅ Pengeluaran toko berhasil dicatat!')
  }

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBranchName || !newBranchSlug) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase.from('stores').insert({
      store_name: newBranchName,
      slug: newBranchSlug.toLowerCase().trim(),
      owner_id: session.user.id,
      is_multi_branch: true,
      is_open: true,
      master_pin: currentMasterPin,
    })

    if (error) {
      alert('Gagal membuat cabang: ' + error.message)
    } else {
      alert('🎉 Cabang Baru Berhasil Dibuat!')
      setNewBranchName('')
      setNewBranchSlug('')
      setShowAddBranchModal(false)
      initOwnerData()
    }
  }

  const progressTargetPct = Math.min(100, Math.round((totalOmzet / (monthlyTarget || 1)) * 100))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans pb-16">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-800">
          <div>
            <Link href="/kasir" className="text-xs text-amber-400 font-bold hover:underline">← Kembali ke Dashboard Kasir</Link>
            <h1 className="text-xl font-black text-white mt-1">👑 Panel Eksekutif Owner</h1>
            <p className="text-xs text-slate-400">Ringkasan Finansial & Analitik Bisnis Reyyztore</p>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            {/* 🆕 TOMBOL KELOLA PIN OWNER */}
            <button
              onClick={() => setShowPinChangeModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 border border-amber-500/50 text-amber-300 text-xs font-bold rounded-xl shadow transition"
            >
              🔑 Ubah Master PIN
            </button>

            <button
              onClick={() => handleToggleMultiBranch(!isMultiBranch)}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition ${
                isMultiBranch ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {isMultiBranch ? '🌐 Multi-Cabang (ON)' : '🏪 Fokus 1 Cabang (OFF)'}
            </button>

            {isMultiBranch && (
              <button
                onClick={() => setShowAddBranchModal(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow transition"
              >
                + Tambah Cabang
              </button>
            )}
          </div>
        </div>

        {/* 🏢 DROPDOWN SELECTOR CABANG */}
        {isMultiBranch && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-xs font-bold text-amber-400">🏢 Pilih Tampilan Laporan Cabang:</p>
              <p className="text-[10px] text-slate-400">Pilih cabang spesifik atau konsolidasi gabungan total omzet.</p>
            </div>

            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="bg-slate-950 border border-amber-500/50 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl focus:outline-none w-full sm:w-auto"
            >
              <option value="all">🌐 Semua Cabang (Gabungan Total)</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  🏪 {s.store_name} ({s.slug})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 📊 GRID METRIK RINGKASAN FINANSIAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Omzet Kotor (Gross)</p>
            <p className="text-xl font-black text-emerald-400">Rp {totalOmzet.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-slate-500">{totalOrdersCount} Pesanan Selesai</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total HPP / Modal</p>
            <p className="text-xl font-black text-indigo-400">Rp {totalHpp.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-slate-500">Estimasi Modal Bahan Baku</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Biaya Operasional</p>
            <p className="text-xl font-black text-rose-400">Rp {totalExpense.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-slate-500">Es batu, galon, kebersihan, dll.</p>
          </div>

          <div className="bg-slate-900 border border-amber-500/40 p-4 rounded-3xl space-y-1 bg-amber-500/5">
            <p className="text-[10px] font-bold text-amber-400 uppercase">Laba Bersih (Net Profit)</p>
            <p className="text-xl font-black text-amber-300">Rp {netProfit.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-emerald-400 font-bold">Omzet - HPP - Biaya</p>
          </div>
        </div>

        {/* 🎯 PROGRESS BAR TARGET OMZET BULANAN */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-amber-400 uppercase">🎯 Target Omzet Bulanan</h3>
              <p className="text-[10px] text-slate-400">Pencapaian omzet toko periode ini</p>
            </div>
            <span className="text-xs font-black text-emerald-400 font-mono">{progressTargetPct}% Pencapaian</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressTargetPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Tercapai: Rp {totalOmzet.toLocaleString('id-ID')}</span>
            <span>Target: Rp {(monthlyTarget || 0).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* 🏆 TOP 5 MENU TERLARIS & EXPENSE TRACKER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
            <h3 className="text-xs font-black text-amber-400 uppercase">🏆 Top 5 Menu Terlaris</h3>
            {topMenuItems.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">Belum ada data penjualan menu.</p>
            ) : (
              <div className="space-y-2">
                {topMenuItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 font-black text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white">{item.nama}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{item.qty} porsi</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-rose-400 uppercase">💸 Pengeluaran Operasional</h3>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold rounded-xl"
              >
                + Catat Biaya
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">Belum ada catatan pengeluaran.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentExpenses.map((exp) => (
                  <div key={exp.id} className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{exp.description}</p>
                      <p className="text-[9px] text-slate-500">{new Date(exp.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                    <span className="font-mono text-rose-400 font-bold">Rp {(exp.amount || 0).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 🆕 MODAL UBAH MASTER PIN OWNER */}
      {showPinChangeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveNewPin} className="bg-slate-900 border border-slate-800 text-white w-full max-w-xs rounded-3xl p-6 space-y-3.5">
            <div className="text-center space-y-1">
              <div className="text-2xl">🔑</div>
              <h3 className="text-sm font-bold text-amber-400">Pengaturan Master PIN Owner</h3>
              <p className="text-[10px] text-slate-400">Ganti PIN 6-digit untuk proteksi mode owner dari kasir.</p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">PIN Lama</label>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="••••••"
                value={oldPinInput}
                onChange={(e) => setOldPinInput(e.target.value)}
                className="w-full mt-1 text-center font-mono p-2 bg-slate-950 border border-slate-800 text-xs text-amber-300 rounded-xl"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">PIN Baru (6 Angka)</label>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="••••••"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                className="w-full mt-1 text-center font-mono p-2 bg-slate-950 border border-slate-800 text-xs text-emerald-300 rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">
                Simpan PIN Baru
              </button>
              <button type="button" onClick={() => setShowPinChangeModal(false)} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CATAT PENGELUARAN */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveExpense} className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-6 space-y-3.5">
            <h3 className="text-sm font-bold text-rose-400">💸 Catat Pengeluaran Operasional</h3>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Keterangan Biaya</label>
              <input
                type="text"
                required
                placeholder="misal: Beli Es Batu 2 Plastik"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white font-bold rounded-xl"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nominal Biaya (Rp)</label>
              <input
                type="number"
                required
                placeholder="15000"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white font-bold rounded-xl font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-rose-500 text-slate-950 font-black text-xs rounded-xl">
                Simpan Biaya
              </button>
              <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL TAMBAH CABANG BARU */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBranch} className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-6 space-y-3.5">
            <h3 className="text-sm font-bold text-amber-400">🏢 Tambah Cabang Toko Baru</h3>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Cabang Toko</label>
              <input
                type="text"
                required
                placeholder="misal: Warkop Reyyz - Cabang Kampus"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white font-bold rounded-xl"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Slug URL Cabang Toko</label>
              <input
                type="text"
                required
                placeholder="misal: reyyz-kampus"
                value={newBranchSlug}
                onChange={(e) => setNewBranchSlug(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-amber-300 font-bold rounded-xl font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">
                Buat Cabang Toko
              </button>
              <button type="button" onClick={() => setShowAddBranchModal(false)} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FOOTER BRANDING REYYZTORE */}
      <footer className="text-center py-6 text-[10px] text-slate-400 font-medium border-t border-slate-800 mt-8">
        Powered by <strong className="text-emerald-400">Reyyztore</strong> • Digital POS System
      </footer>
    </div>
  )
}
