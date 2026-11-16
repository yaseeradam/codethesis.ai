import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getNotificationsByUserId,
  getUnreadNotificationCount,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const url = new URL(req.url);
    const queryUserId = url.searchParams.get('userId');

    const effectiveUserId = user?.id || queryUserId;
    if (!effectiveUserId) {
      return NextResponse.json({
        success: true,
        notifications: [],
        unreadCount: 0,
      });
    }

    const limit = parseInt(url.searchParams.get('limit') || '30', 10);
    const notifications = await getNotificationsByUserId(effectiveUserId, limit);
    const unreadCount = await getUnreadNotificationCount(effectiveUserId);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const effectiveUserId = user?.id || body.userId;
    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, message, type, link } = body;
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const notification = await createNotification({
      userId: effectiveUserId,
      title,
      message,
      type: type || 'info',
      link,
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));

    const effectiveUserId = user?.id || body.userId;
    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id, markAll } = body;

    if (markAll) {
      const updatedCount = await markAllNotificationsAsRead(effectiveUserId);
      return NextResponse.json({
        success: true,
        markedCount: updatedCount,
      });
    }

    if (id) {
      const success = await markNotificationAsRead(id, effectiveUserId);
      return NextResponse.json({
        success,
      });
    }

    return NextResponse.json(
      { error: 'Either notification id or markAll flag is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating notification status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notification status' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const url = new URL(req.url);
    const queryId = url.searchParams.get('id');
    const queryClearAll = url.searchParams.get('clearAll') === 'true';

    const effectiveUserId = user?.id || url.searchParams.get('userId');
    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (queryClearAll) {
      const cleared = await clearAllNotifications(effectiveUserId);
      return NextResponse.json({ success: cleared });
    }

    if (queryId) {
      const deleted = await deleteNotification(queryId, effectiveUserId);
      return NextResponse.json({ success: deleted });
    }

    return NextResponse.json(
      { error: 'Either notification id or clearAll parameter is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
