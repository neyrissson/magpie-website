'use server';

import prisma from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';

const BUCKET_NAME = 'media';

/**
 * Public Server Action to submit a job application / CV
 */
export async function submitApplication(formData) {
  try {
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const position = formData.get('position')?.trim() || 'Non spécifié';
    const file = formData.get('cv');

    if (!name || !email) {
      return { success: false, error: 'Nom et email sont requis / Name and email are required' };
    }

    let cvUrl = '';

    // If a CV file is provided
    if (file && file.size > 0) {
      const timestamp = Date.now();
      const sanitizedName = (file.name || 'cv.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `applications/${timestamp}_${sanitizedName}`;

      if (supabase) {
        try {
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, fileBuffer, {
              contentType: file.type || 'application/pdf',
              upsert: true
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from(BUCKET_NAME)
              .getPublicUrl(filePath);
            cvUrl = publicUrl;
          } else {
            console.warn('[Application] Supabase upload failed, falling back:', uploadError.message);
          }
        } catch (uploadErr) {
          console.warn('[Application] Storage upload exception:', uploadErr.message);
        }
      }

      // Fallback if Supabase storage is not configured or failed: store data URL for smaller files
      if (!cvUrl && file.size < 5 * 1024 * 1024) {
        const buffer = Buffer.from(await file.arrayBuffer());
        cvUrl = `data:${file.type || 'application/pdf'};base64,${buffer.toString('base64')}`;
      }
    }

    const application = await prisma.application.create({
      data: {
        name,
        email,
        position,
        cv_url: cvUrl || 'No file provided'
      }
    });

    revalidatePath('/portal/applications');
    return { success: true, id: application.id };
  } catch (error) {
    console.error('[Application] submitApplication error:', error);
    return { success: false, error: error.message || 'Erreur lors de la soumission' };
  }
}

/**
 * Fetch all applications (for Admin / Manager portal)
 */
export async function getApplications() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return applications.map(app => ({
      ...app,
      createdAt: app.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('[Application] getApplications error:', error);
    return [];
  }
}

/**
 * Delete an application
 */
export async function deleteApplication(id) {
  try {
    await prisma.application.delete({
      where: { id }
    });
    revalidatePath('/portal/applications');
    return { success: true };
  } catch (error) {
    console.error('[Application] deleteApplication error:', error);
    return { success: false, error: error.message };
  }
}
