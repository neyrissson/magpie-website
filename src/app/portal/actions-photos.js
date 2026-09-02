'use server';

import prisma from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';

const BUCKET_NAME = 'media';

export async function getSiteImage(key) {
  try {
    if (!prisma?.siteImage) {
      console.error("[Actions] prisma.siteImage is undefined!");
      return null;
    }
    return await prisma.siteImage.findUnique({
      where: { key },
      include: { photo: true }
    });
  } catch (error) {
    console.error("[Actions] getSiteImage error:", error.message);
    return null;
  }
}

export async function setSiteImage(key, photoId) {
  if (!key || !photoId) return { error: 'Key and PhotoID are required' };

  try {
    await prisma.siteImage.upsert({
      where: { key },
      update: { photoId },
      create: { key, photoId }
    });
    revalidatePath('/'); // Revalidate home page
    revalidatePath('/portal/photos');
    return { success: true };
  } catch (error) {
    console.error('[Actions] Failed to set site image:', error.message);
    return { error: 'Database update failed' };
  }
}

export async function updatePublicEventPhoto(eventId, photoId) {
  if (!eventId || !photoId) return { error: 'Event ID and Photo ID are required' };
  try {
    await prisma.publicEvent.update({
      where: { id: eventId },
      data: { photoId }
    });
    revalidatePath('/events');
    revalidatePath('/portal/photos');
    return { success: true };
  } catch (error) {
    console.error('[Actions] Failed to update event photo:', error.message);
    return { error: 'Database update failed' };
  }
}

export async function updateMenuItemPhoto(itemId, photoId) {
  if (!itemId || !photoId) return { error: 'Item ID and Photo ID are required' };
  try {
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { photoId }
    });
    revalidatePath('/menu');
    revalidatePath('/portal/photos');
    return { success: true };
  } catch (error) {
    console.error('[Actions] Failed to update menu item photo:', error.message);
    return { error: 'Database update failed' };
  }
}

export async function getPhotos() {
  try {
    if (!prisma?.photo) {
      console.error("[Actions] prisma.photo is undefined!");
      return [];
    }
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        siteImages: true,
        publicEvents: true,
        menuItems: true
      }
    });
    console.log(`[Actions] Fetched ${photos.length} photos.`);
    return photos;
  } catch (error) {
    console.error('[Actions] Failed to fetch photos:', error.message);
    return [];
  }
}

export async function uploadPhotoToSupabase(formData) {
  const file = formData.get('file');
  const name = formData.get('name') || file.name;

  if (!file) return { error: 'File is required' };
  if (!supabase) {
    return { error: 'Supabase storage is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your env.' };
  }

  try {
    // Check for duplicate name to prevent double imports
    const existing = await prisma.photo.findFirst({
      where: { name: name }
    });
    if (existing) {
      return { success: false, error: 'DUPLICATE_NAME', url: existing.url };
    }
    // 1. Sanitze file name and add timestamp
    const timestamp = Date.now();
    const cleanName = name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filePath = `${timestamp}_${cleanName}`;

    // 2. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      console.error('[Supabase Upload Error]', uploadError);
      return { error: `Upload failed: ${uploadError.message}` };
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // 4. Create record in Prisma
    const photo = await prisma.photo.create({
      data: {
        url: publicUrl,
        name: name,
        source: 'supabase'
      }
    });

    revalidatePath('/portal/photos');
    return { success: true, photo };
  } catch (error) {
    console.error('[Actions] uploadPhotoToSupabase error:', error.message);
    return { error: 'Operation failed' };
  }
}

export async function renamePhoto(formData) {
  const id = formData.get('id');
  const newName = formData.get('name');

  if (!id || !newName) return { error: 'ID and Name are required' };

  try {
    await prisma.photo.update({
      where: { id },
      data: { name: newName }
    });
    revalidatePath('/portal/photos');
    return { success: true };
  } catch (error) {
    console.error('[Actions] Failed to rename photo:', error.message);
    return { error: 'Database update failed' };
  }
}

export async function deletePhoto(id) {
  if (!id) return { error: 'ID is required' };

  try {
    // Note: We might want to delete from Supabase storage too, 
    // but for safety we'll just delete the DB record for now.
    // In a production app, you'd clean up the file too.
    await prisma.photo.delete({
      where: { id }
    });
    revalidatePath('/portal/photos');
    return { success: true };
  } catch (error) {
    console.error('[Actions] Failed to delete photo:', error.message);
    return { error: 'Database deletion failed' };
  }
}

export async function deletePhotos(ids) {
  if (!ids || ids.length === 0) return { error: 'IDs are required' };

  try {
    await prisma.photo.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    revalidatePath('/portal/photos');
    return { success: true };
  } catch (error) {
    console.error('[Actions] Failed to delete photos:', error.message);
    return { error: 'Database deletion failed' };
  }
}

export async function updatePhotoTags(id, tags) {
  if (!id) return { error: 'ID is required' };

  try {
    await prisma.photo.update({
      where: { id },
      data: { tags: tags || '' }
    });
    revalidatePath('/portal/photos');
    return { success: true };
  } catch (error) {
    console.error('[Actions] Failed to update photo tags:', error.message);
    return { error: 'Database update failed' };
  }
}

export async function getMenuCategories() {
  try {
    return await prisma.menuCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        photo: true,
        items: {
          include: { photo: true }
        }
      }
    });
  } catch (error) {
    console.error('[Actions] getMenuCategories error:', error.message);
    return [];
  }
}

export async function getPublicEvents() {
  try {
    const events = await prisma.publicEvent.findMany({
      orderBy: { date: 'asc' },
      include: { photo: true }
    });
    return events.map(e => ({
      id: e.id,
      date: e.date.toISOString(),
      title_fr: e.title_fr,
      title_en: e.title_en,
      type: e.type,
      desc_fr: e.desc_fr,
      desc_en: e.desc_en,
      photoId: e.photoId,
      photo: e.photo ? { id: e.photo.id, url: e.photo.url } : null,
      color: e.color,
      ticketUrl: e.ticketUrl
    }));
  } catch (error) {
    console.error('[Actions] getPublicEvents error:', error.message);
    return [];
  }
}

// ── PHOTO EDITOR ──

export async function saveEditedPhoto(id, base64DataUrl) {
  if (!id || !base64DataUrl) return { error: 'ID and image data are required' };
  try {
    const current = await prisma.photo.findUnique({ where: { id } });
    if (!current) return { error: 'Photo not found' };

    // Preserve originalUrl only on the first edit
    const originalUrl = current.originalUrl || current.url;

    let newUrl = base64DataUrl;

    // If Supabase is configured, upload the edited image buffer instead of storing base64
    if (supabase) {
      try {
        const base64 = base64DataUrl.split(',')[1];
        const buffer = Buffer.from(base64, 'base64');
        const timestamp = Date.now();
        const filePath = `edited_${timestamp}_${current.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, buffer, { contentType: 'image/jpeg', upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
          newUrl = publicUrl;
        }
      } catch (uploadErr) {
        console.warn('[saveEditedPhoto] Supabase upload failed, storing base64 inline:', uploadErr.message);
      }
    }

    await prisma.photo.update({
      where: { id },
      data: { url: newUrl, originalUrl }
    });

    revalidatePath('/portal/photos');
    return { success: true };
  } catch (error) {
    console.error('[Actions] saveEditedPhoto error:', error.message);
    return { error: 'Save failed' };
  }
}

export async function revertPhotoToOriginal(id) {
  if (!id) return { error: 'ID is required' };
  try {
    const current = await prisma.photo.findUnique({ where: { id } });
    if (!current) return { error: 'Photo not found' };
    if (!current.originalUrl) return { success: true, message: 'No edits to revert' };

    await prisma.photo.update({
      where: { id },
      data: { url: current.originalUrl, originalUrl: null }
    });

    revalidatePath('/portal/photos');
    return { success: true };
  } catch (error) {
    console.error('[Actions] revertPhotoToOriginal error:', error.message);
    return { error: 'Revert failed' };
  }
}

export async function seedLocalAssets(assetFiles) {
  let added = 0;
  let skipped = 0;
  for (const asset of assetFiles) {
    const existing = await prisma.photo.findFirst({ where: { name: asset.name } });
    if (existing) { skipped++; continue; }
    await prisma.photo.create({ data: { url: asset.url, name: asset.name, source: 'local' } });
    added++;
  }
  revalidatePath('/portal/photos');
  return { success: true, added, skipped };
}
