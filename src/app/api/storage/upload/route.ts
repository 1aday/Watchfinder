import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const referenceWatchId = formData.get("referenceWatchId") as string | null;
    const angleTag = formData.get("angleTag") as string || "general";
    const isPrimary = formData.get("isPrimary") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const storagePath = referenceWatchId
      ? `reference-watches/${referenceWatchId}/${fileName}`
      : `temp/${fileName}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("watch-images")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("watch-images")
      .getPublicUrl(storagePath);

    const storageUrl = urlData.publicUrl;

    // If referenceWatchId is provided, save metadata to database
    if (referenceWatchId) {
      const { error: dbError } = await supabase
        .from("reference_watch_images")
        .insert({
          reference_watch_id: referenceWatchId,
          angle_tag: angleTag,
          storage_path: storagePath,
          storage_url: storageUrl,
          file_size_bytes: file.size,
          mime_type: file.type,
          is_primary: isPrimary,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        // Try to clean up uploaded file
        await supabase.storage.from("watch-images").remove([storagePath]);
        return NextResponse.json(
          { error: "Failed to save image metadata" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        storagePath,
        storageUrl,
        fileName,
        fileSize: file.size,
        mimeType: file.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get images for a reference watch
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const referenceWatchId = searchParams.get("referenceWatchId");

    if (!referenceWatchId) {
      return NextResponse.json(
        { error: "referenceWatchId is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("reference_watch_images")
      .select("*")
      .eq("reference_watch_id", referenceWatchId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete an image
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "imageId is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get image metadata
    const { data: imageData, error: fetchError } = await supabase
      .from("reference_watch_images")
      .select("storage_path")
      .eq("id", imageId)
      .single();

    if (fetchError || !imageData) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("watch-images")
      .remove([imageData.storage_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("reference_watch_images")
      .delete()
      .eq("id", imageId);

    if (dbError) {
      console.error("Database delete error:", dbError);
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
