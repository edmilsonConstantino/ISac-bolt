import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  Activity,
  Shield,
  Wifi
} from "lucide-react";
import { SystemUser } from "../Users/UsersList";

interface AccessLog {
  id: number;
  date: string;
  time: string;
  ip: string;
  location: string;
  device: string;
  browser: string;
  status: "success" | "failed";
  action: string;
}

interface UserAccessHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
}

const MOCK_ACCESS_LOGS: AccessLog[] = [
  {
    id: 1,
    date: "2025-01-25",
    time: "14:30:15",
    ip: "197.234.221.123",
    location: "Maputo, Moçambique",
    device: "Desktop",
    browser: "Chrome 120",
    status: "success",
    action: "Login"
  },
  {
    id: 2,
    date: "2025-01-25",
    time: "09:15:42",
    ip: "197.234.221.123",
    location: "Maputo, Moçambique",
    device: "Mobile",
    browser: "Safari iOS",
    status: "success",
    action: "Login"
  },
  {
    id: 3,
    date: "2025-01-24",
    time: "16:45:30",
    ip: "197.234.221.123",
    location: "Maputo, Moçambique",
    device: "Desktop",
    browser: "Chrome 120",
    status: "success",
    action: "Logout"
  },
  {
    id: 4,
    date: "2025-01-24",
    time: "08:20:18",
    ip: "197.234.221.123",
    location: "Maputo, Moçambique",
    device: "Desktop",
    browser: "Chrome 120",
    status: "success",
    action: "Login"
  },
  {
    id: 5,
    date: "2025-01-23",
    time: "23:15:05",
    ip: "41.220.12.89",
    location: "Beira, Moçambique",
    device: "Tablet",
    browser: "Firefox 121",
    status: "failed",
    action: "Tentativa de Login"
  },
  {
    id: 6,
    date: "2025-01-23",
    time: "15:30:22",
    ip: "197.234.221.123",
    location: "Maputo, Moçambique",
    device: "Desktop",
    browser: "Chrome 120",
    status: "success",
    action: "Login"
  },
  {
    id: 7,
    date: "2025-01-22",
    time: "11:10:45",
    ip: "197.234.221.123",
    location: "Maputo, Moçambique",
    device: "Mobile",
    browser: "Chrome Android",
    status: "success",
    action: "Login"
  },
  {
    id: 8,
    date: "2025-01-21",
    time: "14:55:30",
    ip: "197.234.221.123",
    location: "Maputo, Moçambique",
    device: "Desktop",
    browser: "Chrome 120",
    status: "success",
    action: "Login"
  }
];

export function UserAccessHistoryModal({
  isOpen,
  onClose,
  user
}: UserAccessHistoryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");

  if (!user) return null;

  const filteredLogs = MOCK_ACCESS_LOGS.filter(log => {
    const matchesSearch = log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip.includes(searchTerm) ||
                         log.device.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("mobile")) return Smartphone;
    if (device.toLowerCase().includes("tablet")) return Tablet;
    return Monitor;
  };

  const stats = {
    totalAccess: MOCK_ACCESS_LOGS.length,
    successful: MOCK_ACCESS_LOGS.filter(l => l.status === "success").length,
    failed: MOCK_ACCESS_LOGS.filter(l => l.status === "failed").length,
    uniqueLocations: new Set(MOCK_ACCESS_LOGS.map(l => l.location)).size
  };

  const hasFilters = searchTerm !== "" || statusFilter !== "all";

  // Group logs by date
  const groupedLogs: Record<string, AccessLog[]> = {};
  filteredLogs.forEach(log => {
    if (!groupedLogs[log.date]) groupedLogs[log.date] = [];
    groupedLogs[log.date].push(log);
  });

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";

    return date.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-6 pt-6 pb-8 relative">
          <div className="absolute inset-0 bg-black/5" />
          <div className="relative">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Historico de Acessos
              </DialogTitle>
              <p className="text-blue-200 text-sm mt-1">{user.name}</p>
            </DialogHeader>

            {/* Stats in header */}
            <div className="grid grid-cols-4 gap-3 mt-5">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="h-3 w-3 text-blue-200" />
                  <span className="text-[10px] text-blue-200 font-medium uppercase">Total</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.totalAccess}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="h-3 w-3 text-green-300" />
                  <span className="text-[10px] text-green-200 font-medium uppercase">Sucesso</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.successful}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <XCircle className="h-3 w-3 text-red-300" />
                  <span className="text-[10px] text-red-200 font-medium uppercase">Falhas</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.failed}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="h-3 w-3 text-purple-300" />
                  <span className="text-[10px] text-purple-200 font-medium uppercase">Locais</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.uniqueLocations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 -mt-3 relative z-10">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-3 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por local, IP ou dispositivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 border-slate-200 text-sm"
              />
            </div>
            <div className="flex gap-1.5">
              {[
                { value: "all" as const, label: "Todos" },
                { value: "success" as const, label: "Sucesso" },
                { value: "failed" as const, label: "Falhas" }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 h-9 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === opt.value
                      ? "bg-[#004B87] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logs list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum registro encontrado</p>
              <p className="text-sm text-slate-400 mt-1">Tente ajustar os filtros</p>
            </div>
          ) : (
            Object.entries(groupedLogs).map(([date, logs]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-3 py-1.5">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-600 capitalize">
                      {formatDateHeader(date)}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {logs.length} registro{logs.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Logs for this date */}
                <div className="space-y-2">
                  {logs.map((log) => {
                    const DeviceIcon = getDeviceIcon(log.device);
                    const isSuccess = log.status === "success";

                    return (
                      <div
                        key={log.id}
                        className={`rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                          isSuccess
                            ? "bg-white border-slate-200 hover:border-green-300"
                            : "bg-red-50/50 border-red-200 hover:border-red-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Status icon */}
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSuccess ? "bg-green-100" : "bg-red-100"
                          }`}>
                            {isSuccess ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>

                          {/* Main info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-bold text-sm text-slate-800">{log.action}</span>
                              <Badge className={`text-[10px] px-1.5 py-0 ${
                                isSuccess
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                              }`}>
                                {isSuccess ? "OK" : "Falhou"}
                              </Badge>
                              <span className="text-xs text-slate-400 ml-auto font-mono">{log.time}</span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {log.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DeviceIcon className="h-3 w-3" />
                                {log.device}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {log.browser}
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Wifi className="h-3 w-3" />
                                {log.ip}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {filteredLogs.length} de {MOCK_ACCESS_LOGS.length} registros
            {hasFilters && (
              <button
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                className="ml-2 text-[#F5821F] hover:text-[#E07318] font-medium"
              >
                Limpar filtros
              </button>
            )}
          </p>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 px-5 border-2 border-slate-200 hover:border-slate-300 font-medium text-sm"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
