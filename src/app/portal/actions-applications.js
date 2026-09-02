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

    // Save application to database
    const application = await prisma.application.create({
      data: {
        name,
        email,
        position,
        cv_url: cvUrl || 'No file provided'
      }
    });

    // ── EMAIL NOTIFICATION VIA RESEND ──
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const recipient = process.env.NOTIFICATION_EMAIL || 'info@magpiemagique.com';
        
        const attachments = [];
        if (file && file.size > 0) {
          try {
            const attachmentBuffer = Buffer.from(await file.arrayBuffer());
            attachments.push({
              filename: file.name || 'CV.pdf',
              content: attachmentBuffer
            });
          } catch (attErr) {
            console.warn('[Application] Could not attach file to email:', attErr.message);
          }
        }

        const emailResult = await resend.emails.send({
          from: 'Magpie Magique <onboarding@resend.dev>',
          to: recipient,
          subject: `🍸 Nouvelle Candidature / New CV: ${name} (${position})`,
          attachments: attachments.length > 0 ? attachments : undefined,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #0A0705; color: #F2EAD8; border-radius: 8px; border: 1px solid #D4AF37;">
              <h2 style="color: #D4AF37; margin-top: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px;">Magpie Magique — Recrutement</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #E8DABB;">Une nouvelle candidature vient d'être reçue sur le site web :</p>
              
              <div style="background: #1A1310; padding: 20px; border-radius: 6px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                <p style="margin: 8px 0; font-size: 15px;"><strong>👤 Nom :</strong> <span style="color: #FFFFFF;">${name}</span></p>
                <p style="margin: 8px 0; font-size: 15px;"><strong>✉️ Email :</strong> <a href="mailto:${email}" style="color: #D4AF37; text-decoration: none;">${email}</a></p>
                <p style="margin: 8px 0; font-size: 15px;"><strong>🎯 Poste :</strong> <span style="color: #FFFFFF;">${position}</span></p>
                <p style="margin: 8px 0; font-size: 15px;"><strong>📅 Date :</strong> <span style="color: #E8DABB;">${new Date().toLocaleString('fr-CA', { timeZone: 'America/Toronto' })}</span></p>
              </div>

              ${cvUrl && !cvUrl.startsWith('data:') ? `
                <div style="margin: 25px 0; text-align: center;">
                  <a href="${cvUrl}" target="_blank" style="background: #D4AF37; color: #0A0705; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 15px; border-radius: 4px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                    📄 Télécharger le CV (${file ? file.name : 'CV'})
                  </a>
                </div>
              ` : ''}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(212, 175, 55, 0.2); font-size: 13px; color: rgba(242, 234, 216, 0.6); text-align: center;">
                Ce CV est également sauvegardé dans votre <a href="https://magpiemagique.ca/portal/applications" style="color: #D4AF37;">Portail Staff Magpie</a>.
              </div>
            </div>
          `
        });

        console.log('[Application] Email notification dispatched via Resend:', emailResult?.data?.id || emailResult);
      } catch (emailErr) {
        console.warn('[Application] Resend notification failed (non-blocking):', emailErr.message);
      }
    }

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
