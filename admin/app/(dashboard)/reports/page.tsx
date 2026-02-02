'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { Report, User, Message } from '@/types';
import { CheckCircle, XCircle, Ban, Trash2 } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getReports(filter === 'pending' ? 'pending' : undefined);
      setReports(data.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (report: Report) => {
    if (!report.message_id || typeof report.message_id === 'string') {
      alert('Message not found');
      return;
    }

    if (!confirm('Delete this message?')) return;

    try {
      await adminApi.deleteMessage(report.message_id._id);
      alert('Message deleted');
      loadReports();
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const handleBanUser = async (report: Report) => {
    const userId = typeof report.reported_user_id === 'string' 
      ? report.reported_user_id 
      : report.reported_user_id?._id;

    if (!userId) {
      alert('User not found');
      return;
    }

    const reason = prompt('Enter ban reason:', report.reason);
    if (!reason) return;

    try {
      await adminApi.banUser(userId, reason, true);
      alert('User banned');
      loadReports();
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user');
    }
  };

  const getUserName = (user: string | User | undefined) => {
    if (!user) return 'Unknown';
    if (typeof user === 'string') return 'Unknown';
    return user.display_name || user.username;
  };

  const getMessageText = (message: string | Message | undefined) => {
    if (!message) return 'N/A';
    if (typeof message === 'string') return 'N/A';
    return message.text;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Handle user reports and moderation actions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reports</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : reports.length === 0 ? (
            <div className="text-center text-muted-foreground">No reports found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell className="font-medium">
                      {getUserName(report.reporter_id)}
                    </TableCell>
                    <TableCell>
                      {getUserName(report.reported_user_id)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs font-semibold">
                        {report.type}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{report.reason}</div>
                      {report.additional_context && (
                        <div className="truncate text-xs text-muted-foreground">
                          {report.additional_context}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs">
                      {getMessageText(report.message_id)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'actioned'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {report.status === 'pending' && (
                        <div className="flex gap-1">
                          {report.message_id && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMessage(report)}
                              title="Delete Message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {report.reported_user_id && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanUser(report)}
                              title="Ban User"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
