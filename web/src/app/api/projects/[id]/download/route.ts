import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const host = req.nextUrl.origin || 'http://localhost:3000';
    let targetEndpoint = '/api/generate-thesis-docx';
    let fileExt = project.fileType || 'docx';

    if (project.toolId === 'software-builder' || project.fileType === 'zip') {
      targetEndpoint = '/api/generate-software-zip';
      fileExt = 'zip';
    } else if (project.toolId === 'viva-presentation' || project.fileType === 'pptx') {
      targetEndpoint = '/api/generate-viva-pptx';
      fileExt = 'pptx';
    } else if (project.toolId === 'siwes-logbook') {
      targetEndpoint = '/api/generate-siwes-docx';
      fileExt = 'docx';
    } else if (project.toolId === 'itf-report') {
      targetEndpoint = '/api/generate-itf-report-docx';
      fileExt = 'docx';
    } else if (project.toolId === 'assignment-solver') {
      targetEndpoint = '/api/generate-assignment-docx';
      fileExt = 'docx';
    } else if (project.toolId === 'viva-simulator') {
      targetEndpoint = '/api/generate-viva-cheatsheet-docx';
      fileExt = 'docx';
    }

    const incomingCookie = req.headers.get('cookie') || '';

    // Call the corresponding generator internally with re-download authorization
    const genRes = await fetch(`${host}${targetEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-codethesis-redownload': 'true',
        Cookie: incomingCookie,
      },
      body: JSON.stringify({
        topic: project.title,
        title: project.title,
        course: project.course,
        institution: project.institution,
        studentName: project.metadata?.studentName || 'ADEBAYO TUNDE',
        matricNumber: project.metadata?.matricNumber || 'FUTA/CSC/20/4182',
        session: project.metadata?.session || '2025/2026',
        isRedownload: true,
      }),
    });

    if (!genRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to compile project document' },
        { status: genRes.status }
      );
    }

    const arrayBuffer = await genRes.arrayBuffer();
    const contentType = genRes.headers.get('content-type') || 'application/octet-stream';
    const safeTitle = (project.title || 'CodeThesis_Project')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeTitle}.${fileExt}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error in project download:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Project download failed' },
      { status: 500 }
    );
  }
}
