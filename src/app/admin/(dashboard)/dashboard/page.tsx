import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, CalendarDays, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Selamat Datang, Admin!</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Berikut adalah ringkasan aktivitas yayasan hari ini.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anak Asuh</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-zinc-500">+4 sejak bulan lalu</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donasi Bulan Ini</CardTitle>
            <Wallet className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 12.500.000</div>
            <p className="text-xs text-zinc-500">+15% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kunjungan Pending</CardTitle>
            <CalendarDays className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">3</div>
            <p className="text-xs text-zinc-500">Menunggu persetujuan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Program Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-zinc-500">2 hampir mencapai target</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Grafik Pemasukan (7 Hari Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-end justify-between gap-2 px-6 pb-6 pt-4">
            {[40, 70, 30, 90, 60, 50, 100].map((height, i) => (
              <div key={i} className="relative flex flex-col items-center justify-end w-full h-full group">
                <div 
                  className="w-full bg-red-100 dark:bg-red-900/30 rounded-t-md relative overflow-hidden transition-all duration-300 group-hover:bg-red-200 dark:group-hover:bg-red-900/50"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute bottom-0 w-full bg-red-500 rounded-t-md transition-all duration-500" style={{ height: '100%' }} />
                </div>
                <span className="text-xs text-zinc-500 mt-2 font-medium">H-{7-i}</span>
                {/* Tooltip on hover */}
                <div className="absolute -top-8 bg-zinc-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Rp {(height * 50000).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="col-span-3 h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Donasi Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-6">
              {[
                { nama: "Hamba Allah", nominal: 500000, waktu: "Baru saja", avatar: "HA" },
                { nama: "Budi Santoso", nominal: 250000, waktu: "2 jam lalu", avatar: "BS" },
                { nama: "Siti Aminah", nominal: 1000000, waktu: "5 jam lalu", avatar: "SA" },
                { nama: "Antonius", nominal: 100000, waktu: "Kemarin", avatar: "AN" },
                { nama: "Keluarga Besar S", nominal: 5000000, waktu: "Kemarin", avatar: "KB" },
              ].map((donasi, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-sm">
                      {donasi.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{donasi.nama}</p>
                      <p className="text-xs text-zinc-500">{donasi.waktu}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    + Rp {donasi.nominal.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
