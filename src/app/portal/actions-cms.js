'use server';

import prisma from '../../lib/prisma';
import { revalidatePath } from 'next/cache';

// ── MENU CATEGORIES CRUD ──

export async function createMenuCategory(data) {
  try {
    const category = await prisma.menuCategory.create({
      data: {
        slug: data.slug,
        name_fr: data.name_fr,
        name_en: data.name_en,
        image: data.image || '/assets/background_2.jpeg',
        tag: data.tag || '',
        order: parseInt(data.order, 10) || 0,
        photoId: data.photoId || null,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      },
    });
    revalidatePath('/menu');
    revalidatePath('/portal/cms');
    return { success: true, category };
  } catch (error) {
    console.error('[Actions CMS] createMenuCategory error:', error.message);
    return { error: error.message || 'Failed to create menu category' };
  }
}

export async function updateMenuCategory(id, data) {
  try {
    const category = await prisma.menuCategory.update({
      where: { id },
      data: {
        slug: data.slug,
        name_fr: data.name_fr,
        name_en: data.name_en,
        image: data.image,
        tag: data.tag,
        order: parseInt(data.order, 10) || 0,
        photoId: data.photoId || null,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      },
    });
    revalidatePath('/menu');
    revalidatePath('/portal/cms');
    return { success: true, category };
  } catch (error) {
    console.error('[Actions CMS] updateMenuCategory error:', error.message);
    return { error: error.message || 'Failed to update menu category' };
  }
}

export async function toggleCategoryVisibility(id, isAvailable) {
  try {
    const category = await prisma.menuCategory.update({
      where: { id },
      data: { isAvailable },
    });
    revalidatePath('/menu');
    revalidatePath('/portal/cms');
    return { success: true, category };
  } catch (error) {
    console.error('[Actions CMS] toggleCategoryVisibility error:', error.message);
    return { error: error.message || 'Failed to toggle category availability' };
  }
}

export async function deleteMenuCategory(id) {
  try {
    await prisma.menuCategory.delete({
      where: { id },
    });
    revalidatePath('/menu');
    revalidatePath('/portal/cms');
    return { success: true };
  } catch (error) {
    console.error('[Actions CMS] deleteMenuCategory error:', error.message);
    return { error: error.message || 'Failed to delete menu category' };
  }
}

// ── MENU ITEMS CRUD ──

export async function createMenuItem(data) {
  try {
    const item = await prisma.menuItem.create({
      data: {
        name_fr: data.name_fr,
        name_en: data.name_en,
        ingredients_fr: data.ingredients_fr || null,
        ingredients_en: data.ingredients_en || null,
        notes_fr: data.notes_fr || null,
        notes_en: data.notes_en || null,
        price: String(data.price),
        categoryId: data.categoryId,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        photoId: data.photoId || null,
        subcategory_fr: data.subcategory_fr || null,
        subcategory_en: data.subcategory_en || null,
      },
    });
    revalidatePath('/menu');
    revalidatePath('/portal/cms');
    return { success: true, item };
  } catch (error) {
    console.error('[Actions CMS] createMenuItem error:', error.message);
    return { error: error.message || 'Failed to create menu item' };
  }
}

export async function updateMenuItem(id, data) {
  try {
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name_fr: data.name_fr,
        name_en: data.name_en,
        ingredients_fr: data.ingredients_fr || null,
        ingredients_en: data.ingredients_en || null,
        notes_fr: data.notes_fr || null,
        notes_en: data.notes_en || null,
        price: String(data.price),
        categoryId: data.categoryId,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        photoId: data.photoId || null,
        subcategory_fr: data.subcategory_fr || null,
        subcategory_en: data.subcategory_en || null,
      },
    });
    revalidatePath('/menu');
    revalidatePath('/portal/cms');
    return { success: true, item };
  } catch (error) {
    console.error('[Actions CMS] updateMenuItem error:', error.message);
    return { error: error.message || 'Failed to update menu item' };
  }
}

export async function deleteMenuItem(id) {
  try {
    await prisma.menuItem.delete({
      where: { id },
    });
    revalidatePath('/menu');
    revalidatePath('/portal/cms');
    return { success: true };
  } catch (error) {
    console.error('[Actions CMS] deleteMenuItem error:', error.message);
    return { error: error.message || 'Failed to delete menu item' };
  }
}

// ── EVENTS CRUD ──

export async function createPublicEvent(data) {
  try {
    if (data.isRecurring && data.untilDate) {
      const start = new Date(data.date);
      const end = new Date(data.untilDate + 'T23:59:59'); // end of day local
      const eventsToCreate = [];

      const current = new Date(start);
      const daysOfWeek = data.daysOfWeek || []; // Array of integers 0 (Sunday) to 6 (Saturday)
      const freq = data.frequency || 'weekly';

      if (freq === 'weekly' || freq === 'biweekly') {
        const stepDays = freq === 'weekly' ? 7 : 14;
        
        if (daysOfWeek.length === 0) {
          // No specific days selected, just repeat weekly/bi-weekly on the same day of the week as start
          while (current <= end) {
            eventsToCreate.push({
              date: new Date(current),
              title_fr: data.title_fr,
              title_en: data.title_en,
              type: data.type,
              desc_fr: data.desc_fr || null,
              desc_en: data.desc_en || null,
              color: data.color || null,
              photoId: data.photoId || null,
              ticketUrl: data.ticketUrl || null,
            });
            current.setDate(current.getDate() + stepDays);
          }
        } else {
          // Specific days of the week are selected (e.g. Wednesday and Friday)
          let weekCounter = 0;
          let tempDate = new Date(start);
          
          while (tempDate <= end) {
            const dayNum = tempDate.getDay(); // 0 is Sunday, 6 is Saturday
            
            if (daysOfWeek.includes(dayNum)) {
              if (tempDate >= start) {
                eventsToCreate.push({
                  date: new Date(tempDate),
                  title_fr: data.title_fr,
                  title_en: data.title_en,
                  type: data.type,
                  desc_fr: data.desc_fr || null,
                  desc_en: data.desc_en || null,
                  color: data.color || null,
                  photoId: data.photoId || null,
                  ticketUrl: data.ticketUrl || null,
                });
              }
            }
            
            // Advance by 1 day
            tempDate.setDate(tempDate.getDate() + 1);
            
            // Bi-weekly skip logic: when crossing into Sunday, skip the entire next week
            if (freq === 'biweekly' && tempDate.getDay() === 0) {
              weekCounter++;
              if (weekCounter % 2 === 1) {
                tempDate.setDate(tempDate.getDate() + 7);
              }
            }
          }
        }
      } else if (freq === 'monthly') {
        // Repeat monthly on the same day-of-month
        while (current <= end) {
          eventsToCreate.push({
            date: new Date(current),
            title_fr: data.title_fr,
            title_en: data.title_en,
            type: data.type,
            desc_fr: data.desc_fr || null,
            desc_en: data.desc_en || null,
            color: data.color || null,
            photoId: data.photoId || null,
            ticketUrl: data.ticketUrl || null,
          });
          current.setMonth(current.getMonth() + 1);
        }
      }

      if (eventsToCreate.length === 0) {
        return { error: 'No recurring dates matched the specified criteria.' };
      }

      await prisma.publicEvent.createMany({
        data: eventsToCreate,
      });

      revalidatePath('/events');
      revalidatePath('/portal/cms');
      return { success: true, count: eventsToCreate.length };

    } else {
      const event = await prisma.publicEvent.create({
        data: {
          date: new Date(data.date),
          title_fr: data.title_fr,
          title_en: data.title_en,
          type: data.type, // JAZZ, COMEDY, PRIVATE
          desc_fr: data.desc_fr || null,
          desc_en: data.desc_en || null,
          color: data.color || null,
          photoId: data.photoId || null,
          ticketUrl: data.ticketUrl || null,
        },
      });
      revalidatePath('/events');
      revalidatePath('/portal/cms');
      return { success: true, event };
    }
  } catch (error) {
    console.error('[Actions CMS] createPublicEvent error:', error.message);
    return { error: error.message || 'Failed to create public event' };
  }
}

export async function updatePublicEvent(id, data) {
  try {
    const event = await prisma.publicEvent.update({
      where: { id },
      data: {
        date: new Date(data.date),
        title_fr: data.title_fr,
        title_en: data.title_en,
        type: data.type,
        desc_fr: data.desc_fr || null,
        desc_en: data.desc_en || null,
        color: data.color || null,
        photoId: data.photoId || null,
        ticketUrl: data.ticketUrl || null,
      },
    });
    revalidatePath('/events');
    revalidatePath('/portal/cms');
    return { success: true, event };
  } catch (error) {
    console.error('[Actions CMS] updatePublicEvent error:', error.message);
    return { error: error.message || 'Failed to update public event' };
  }
}

export async function deletePublicEvent(id) {
  try {
    await prisma.publicEvent.delete({
      where: { id },
    });
    revalidatePath('/events');
    revalidatePath('/portal/cms');
    return { success: true };
  } catch (error) {
    console.error('[Actions CMS] deletePublicEvent error:', error.message);
    return { error: error.message || 'Failed to delete public event' };
  }
}

export async function deletePublicEvents(ids) {
  try {
    await prisma.publicEvent.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    revalidatePath('/events');
    revalidatePath('/portal/cms');
    return { success: true };
  } catch (error) {
    console.error('[Actions CMS] deletePublicEvents error:', error.message);
    return { error: error.message || 'Failed to delete public events' };
  }
}

export async function cleanupOldPosters() {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find all past events (before the first of the current month) that have a poster linked
    const pastEventsWithPosters = await prisma.publicEvent.findMany({
      where: {
        date: {
          lt: startOfCurrentMonth
        },
        photoId: {
          not: null
        }
      },
      select: {
        id: true,
        photoId: true
      }
    });

    if (pastEventsWithPosters.length === 0) return { deletedCount: 0 };

    const photoIdsToDelete = pastEventsWithPosters
      .map(e => e.photoId)
      .filter((id) => id !== null);

    if (photoIdsToDelete.length === 0) return { deletedCount: 0 };

    // 1. Unlink these photo IDs from the past events first to avoid constraint conflicts
    await prisma.publicEvent.updateMany({
      where: {
        id: { in: pastEventsWithPosters.map(e => e.id) }
      },
      data: {
        photoId: null
      }
    });

    // 2. Delete the old photo records from the database (only if they were created by the generator)
    const { count } = await prisma.photo.deleteMany({
      where: {
        id: { in: photoIdsToDelete },
        source: 'generator'
      }
    });

    console.log(`[CMS Cleanup] Automatically deleted ${count} old posters linked to past months' events.`);
    return { deletedCount: count };
  } catch (error) {
    console.error('[CMS Cleanup] Error cleaning up old posters:', error.message);
    return { error: error.message };
  }
}

export async function saveGeneratedPoster(name, base64Data, eventId) {
  try {
    // Clean up previous months' generated posters to keep DB size small
    await cleanupOldPosters();

    const photo = await prisma.photo.create({
      data: {
        name: name,
        url: base64Data,
        source: 'generator',
        tags: 'poster'
      }
    });

    if (eventId) {
      await prisma.publicEvent.update({
        where: { id: eventId },
        data: { photoId: photo.id }
      });
      revalidatePath('/events');
    }

    revalidatePath('/portal/photos');
    revalidatePath('/portal/cms');
    return { success: true, photoId: photo.id };
  } catch (error) {
    console.error('[Actions CMS] saveGeneratedPoster error:', error.message);
    return { error: error.message || 'Failed to save generated poster' };
  }
}

export async function savePosterPreset(name, configJsonString) {
  try {
    const preset = await prisma.posterPreset.upsert({
      where: { name: name },
      update: { config: configJsonString },
      create: { name: name, config: configJsonString }
    });
    revalidatePath('/portal/cms');
    return { success: true, preset };
  } catch (error) {
    console.error('[Actions CMS] savePosterPreset error:', error.message);
    return { error: error.message || 'Failed to save preset' };
  }
}

export async function getPosterPresets() {
  try {
    const presets = await prisma.posterPreset.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return { success: true, presets };
  } catch (error) {
    console.error('[Actions CMS] getPosterPresets error:', error.message);
    return { error: error.message || 'Failed to fetch presets' };
  }
}

export async function deletePosterPreset(id) {
  try {
    await prisma.posterPreset.delete({
      where: { id: id }
    });
    revalidatePath('/portal/cms');
    return { success: true };
  } catch (error) {
    console.error('[Actions CMS] deletePosterPreset error:', error.message);
    return { error: error.message || 'Failed to delete preset' };
  }
}

export async function getSiteLogoUrl() {
  try {
    const logoImage = await prisma.siteImage.findUnique({
      where: { key: 'logo' },
      include: { photo: true }
    });
    if (logoImage?.photo?.url) {
      return { success: true, url: logoImage.photo.url };
    }
    return { success: true, url: '/assets/logo.svg' };
  } catch (error) {
    console.error('[Actions CMS] getSiteLogoUrl error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getAllSiteContent() {
  try {
    const contents = await prisma.siteContent.findMany();
    return { success: true, contents };
  } catch (error) {
    console.error('[Actions CMS] getAllSiteContent error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateSiteContents(dataArray) {
  try {
    for (const item of dataArray) {
      await prisma.siteContent.upsert({
        where: { key: item.key },
        update: { text_fr: item.text_fr, text_en: item.text_en },
        create: { key: item.key, text_fr: item.text_fr, text_en: item.text_en }
      });
    }
    revalidatePath('/');
    revalidatePath('/events');
    revalidatePath('/menu');
    return { success: true };
  } catch (error) {
    console.error('[Actions CMS] updateSiteContents error:', error.message);
    return { success: false, error: error.message };
  }
}
