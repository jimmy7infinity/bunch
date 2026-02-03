'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Trash2, Plus } from 'lucide-react';

interface InviteCode {
  _id: string;
  code: string;
  used: boolean;
  usedBy?: {
    username: string;
    display_name: string;
  };
  maxUses: number;
  useCount: number;
  createdBy: {
    username: string;
    display_name: string;
  };
  expiresAt?: string;
  createdAt: string;
}

interface InviteStats {
  total: number;
  used: number;
  unused: number;
  totalUses: number;
}

export default function InviteCodesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [count, setCount] = useState(1);
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');

  useEffect(() => {
    fetchCodes();
    fetchStats();
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await api.get('/admin/invites');
      setCodes(response.data.codes);
    } catch (error) {
      console.error('Failed to fetch invite codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/invites/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const generateCodes = async () => {
    if (count < 1 || count > 100) {
      alert('Count must be between 1 and 100');
      return;
    }

    if (maxUses < 1) {
      alert('Max uses must be at least 1');
      return;
    }

    setGenerating(true);

    try {
      const payload: any = {
        count,
        maxUses,
      };

      if (expiresInDays && expiresInDays > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        payload.expiresAt = expiresAt.toISOString();
      }

      await api.post('/admin/invites/generate', payload);
      
      // Refresh codes and stats
      await fetchCodes();
      await fetchStats();

      // Reset form
      setCount(1);
      setMaxUses(1);
      setExpiresInDays('');

      alert(`Successfully generated ${count} invite code(s)!`);
    } catch (error: any) {
      console.error('Failed to generate codes:', error);
      alert(error.response?.data?.message || 'Failed to generate codes');
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const deleteCode = async (code: string) => {
    if (!confirm(`Are you sure you want to delete code ${code}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/invites/${code}`);
      await fetchCodes();
      await fetchStats();
      alert('Code deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete code:', error);
      alert(error.response?.data?.message || 'Failed to delete code');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invite Codes</h1>
          <p className="text-muted-foreground mt-1">
            Manage beta invite codes for user access
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Codes</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Used Codes</div>
            <div className="text-2xl font-bold">{stats.used}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Unused Codes</div>
            <div className="text-2xl font-bold">{stats.unused}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Uses</div>
            <div className="text-2xl font-bold">{stats.totalUses}</div>
          </Card>
        </div>
      )}

      {/* Generate Codes Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Generate New Codes</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Count (1-100)</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              placeholder="Number of codes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Uses</label>
            <Input
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
              placeholder="Max uses per code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Expires In (days)</label>
            <Input
              type="number"
              min="1"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Optional"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={generateCodes} 
              disabled={generating}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Codes Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Invite Codes</h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invite codes yet. Generate some above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code) => (
                    <TableRow key={code._id}>
                      <TableCell className="font-mono font-semibold">
                        {code.code}
                      </TableCell>
                      <TableCell>
                        {isExpired(code.expiresAt) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Expired
                          </span>
                        ) : code.useCount >= code.maxUses ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Max Used
                          </span>
                        ) : code.used ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            In Use
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {code.useCount} / {code.maxUses}
                      </TableCell>
                      <TableCell>
                        {code.createdBy?.display_name || code.createdBy?.username || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {code.usedBy?.display_name || code.usedBy?.username || '-'}
                      </TableCell>
                      <TableCell>
                        {code.expiresAt ? formatDate(code.expiresAt) : 'Never'}
                      </TableCell>
                      <TableCell>{formatDate(code.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyCode(code.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCode(code.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
