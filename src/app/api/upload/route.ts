import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function createSafeFilename(fileName: string) {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${Date.now()}_${sanitized}`;
}

function getSupabaseStorageConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;

  if (!url || !serviceRoleKey || !bucket) {
    return null;
  }

  return { url, serviceRoleKey, bucket };
}

async function uploadToSupabaseStorage(file: File, buffer: Buffer) {
  const config = getSupabaseStorageConfig();

  if (!config) {
    return null;
  }

  const supabase = createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  const objectPath = `uploads/${createSafeFilename(file.name)}`;

  const { error } = await supabase.storage
    .from(config.bucket)
    .upload(objectPath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(config.bucket)
    .getPublicUrl(objectPath);

  return data.publicUrl;
}

async function uploadToLocalPublic(file: File, buffer: Buffer) {
  const filename = createSafeFilename(file.name);
  const uploadDir = path.join(process.cwd(), "public/uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${filename}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabaseUrl = await uploadToSupabaseStorage(file, buffer);

    if (!supabaseUrl && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Supabase Storage environment variables are not configured." },
        { status: 500 },
      );
    }

    const url = supabaseUrl ?? (await uploadToLocalPublic(file, buffer));

    return NextResponse.json({
      url,
      storage: supabaseUrl ? "supabase" : "local",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
