'use client';
import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Eye, Clock, CheckCircle, Wrench, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, Column } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  serviceRequestService,
  type ServiceRequest,
  type ServiceStats,
} from '@/services/service-request.service';
import { formatDate } from '@/lib/utils';

const LIMIT = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  accepted: 'default',
  in_progress: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailRequest, setDetailRequest] = useState<ServiceRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [finalPrice, setFinalPrice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        serviceRequestService.getAll({ page, limit: LIMIT, search, status: statusFilter || undefined }),
        serviceRequestService.getStats(),
      ]);
      setRequests(res.requests);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalRequests);
      setStats(statsRes);
    } catch {
      toast.error('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await serviceRequestService.delete(deleteId);
      toast.success('Service request deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const openDetail = (req: ServiceRequest) => {
    setDetailRequest(req);
    setNewStatus(req.status);
    setAdminNotes(req.adminNotes || '');
    setFinalPrice(req.finalPrice ? String(req.finalPrice) : '');
  };

  const handleUpdateStatus = async () => {
    if (!detailRequest) return;
    setUpdatingStatus(true);
    try {
      await serviceRequestService.updateStatus(
        detailRequest._id,
        newStatus,
        adminNotes,
        finalPrice ? Number(finalPrice) : undefined,
      );
      toast.success('Status updated');
      setDetailRequest(null);
      load();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const columns: Column<ServiceRequest>[] = [
    {
      key: 'requestNumber',
      header: 'Request',
      render: (r) => (
        <div>
          <p className="font-medium text-foreground text-sm">{r.requestNumber}</p>
          <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="text-sm text-foreground">{r.customerName}</p>
          <p className="text-xs text-muted-foreground">{r.customerPhone}</p>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Device',
      render: (r) => (
        <span className="text-sm text-muted-foreground">{r.deviceBrand} {r.deviceModel}</span>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (r) => <span className="text-sm text-foreground">{r.serviceType}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={STATUS_COLORS[r.status] || 'secondary'}>
          {r.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => openDetail(r)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setDeleteId(r._id)} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Service Requests" description="Manage mobile repair and service requests">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </PageHeader>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: Wrench, color: 'text-primary' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
            { label: 'In Progress', value: stats.inProgress, icon: CheckCircle, color: 'text-blue-500' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-500' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or request number..."
        emptyMessage="No service requests found."
        rowKey={(r) => r._id}
      />
      <Pagination currentPage={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteId}
        title="Delete Service Request"
        description="Are you sure you want to delete this service request? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />

      {/* Detail / Status Update Modal */}
      {detailRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{detailRequest.requestNumber}</h2>
                <button onClick={() => setDetailRequest(null)} className="text-muted-foreground hover:text-foreground">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{detailRequest.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-foreground">{detailRequest.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-foreground">{detailRequest.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Device</p>
                  <p className="text-foreground">{detailRequest.deviceBrand} {detailRequest.deviceModel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="text-foreground">{detailRequest.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-foreground">{formatDate(detailRequest.createdAt)}</p>
                </div>
              </div>
              {detailRequest.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-foreground mt-0.5">{detailRequest.description}</p>
                </div>
              )}
              <hr className="border-border" />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Final Price (₹)</label>
                <input
                  type="number"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px] resize-none"
                  placeholder="Internal notes..."
                />
              </div>
            </div>
            <div className="border-t border-border p-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDetailRequest(null)}>Cancel</Button>
              <Button onClick={handleUpdateStatus} disabled={updatingStatus}>
                {updatingStatus ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
