import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectsByUserId, saveProject, deleteProject } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const projects = await getProjectsByUserId(user.id);
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { toolId, title, course, institution, summary, fileType, metadata } = body;

    if (!title || !toolId) {
      return NextResponse.json({ error: 'Title and tool ID are required' }, { status: 400 });
    }

    const newProject = await saveProject({
      userId: user.id,
      toolId,
      title,
      course: course || 'General Studies',
      institution: institution || 'Tertiary Institution',
      summary: summary || 'Generated with CodeThesis AI',
      fileType: fileType || 'docx',
      metadata,
    });

    return NextResponse.json({ success: true, project: newProject });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get('id');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const deleted = await deleteProject(projectId, user.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 500 });
  }
}
