'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Sparkles,
  FileText,
  CreditCard,
  ShieldCheck,
  Info,
  ExternalLink,
  X
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'credit' | 'project' | 'payment' | 'security' | 'info' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationBellProps {
  align?: 'left' | 'right';
  className?: string;
}

export default function NotificationBell({ align = 'right', className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 45 seconds for new notifications
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark single as read
  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete single notification
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      });

      const wasUnread = notifications.find((n) => n.id === id && !n.read);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      setLoading(true);
      await fetch('/api/notifications?clearAll=true', {
        method: 'DELETE',
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'project':
        return <FileText className="w-3.5 h-3.5 text-sky-500" />;
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-500" />;
      case 'security':
        return <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />;
      case 'system':
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const past = new Date(dateStr).getTime();
      const now = Date.now();
      const diffSec = Math.floor((now - past) / 1000);

      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-transform active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-900">
                  {unreadCount} New
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  All Read
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline cursor-pointer disabled:opacity-50"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">You&apos;re completely up to date</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No notifications or alerts pending in your workspace.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const content = (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.read) handleMarkAsRead(item.id, item.link);
                      if (item.link) setIsOpen(false);
                    }}
                    className={`group relative p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      item.read
                        ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        : 'bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                    }`}
                  >
                    {/* Icon container */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs ${
                        item.read
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                          : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
                      }`}
                    >
                      {getTypeIcon(item.type)}
                    </div>

                    {/* Text container */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p
                          className={`text-xs truncate ${
                            item.read
                              ? 'font-medium text-slate-700 dark:text-slate-300'
                              : 'font-semibold text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </p>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span>{formatTimeAgo(item.createdAt)}</span>
                        {item.link && (
                          <span className="flex items-center gap-0.5 text-sky-600 dark:text-sky-400 font-medium group-hover:underline">
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete action button */}
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-opacity cursor-pointer"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );

                if (item.link) {
                  return (
                    <Link
                      key={item.id}
                      href={item.link}
                      prefetch={false}
                      className="block focus:outline-none"
                    >
                      {content}
                    </Link>
                  );
                }

                return content;
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 text-[11px]">
              <button
                onClick={handleClearAll}
                disabled={loading}
                className="text-slate-500 hover:text-rose-600 font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                Clear all
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
