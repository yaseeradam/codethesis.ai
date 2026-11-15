import { NextRequest, NextResponse } from 'next/server';
import { GET as getProfile, PUT as updateProfile } from '../auth/profile/route';

export async function GET(req: NextRequest) {
  return getProfile();
}

export async function PUT(req: NextRequest) {
  return updateProfile(req);
}

export async function POST(req: NextRequest) {
  return updateProfile(req);
}
