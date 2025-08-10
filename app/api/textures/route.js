import { NextResponse } from "next/server";
import {
  scanTextureDirectories,
  getTextureCatalogSummary,
} from "@/utils/textureCatalog";

export const dynamic = "force-dynamic"; // scan disk on each request in dev
export const runtime = "nodejs"; // required to use fs

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");
  if (view === "summary") {
    const summary = getTextureCatalogSummary();
    return NextResponse.json(summary);
  }
  const catalog = scanTextureDirectories();
  return NextResponse.json({ textures: catalog });
}
