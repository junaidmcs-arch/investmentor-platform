import { NextResponse } from "next/server";
import { isDatabaseConfigured,query } from "@/lib/server/db";
export async function GET() {
  if(!isDatabaseConfigured()) return NextResponse.json({status:"ok",mode:"public-preview",database:"not-configured"});
  try {await query("SELECT 1");return NextResponse.json({status:"ok",mode:"connected",database:"ready"});}
  catch {return NextResponse.json({status:"degraded",database:"unavailable"},{status:503});}
}
