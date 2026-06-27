import redisClient from "@/lib/redis";

/**
 * Pings a user via Redis to trigger a real-time permission update event.
 * @param userId The ID of the user whose permissions have changed.
 */
export async function pingPermissionUpdate(userId: string) {
  try {
    await redisClient.set(`permission_ping:${userId}`, Date.now().toString(), { ex: 3600 }); // Expire in 1 hour
    console.log(`[Realtime] Pinged permission update for user: ${userId}`);
  } catch (error) {
    console.error(`[Realtime] Failed to ping permission update for user ${userId}:`, error);
  }
}

/**
 * Pings multiple users via Redis to trigger real-time permission update events.
 * @param userIds Array of user IDs.
 */
export async function pingBulkPermissionUpdate(userIds: string[]) {
  try {
    const pipeline = redisClient.pipeline();
    const timestamp = Date.now().toString();
    
    userIds.forEach(userId => {
      pipeline.set(`permission_ping:${userId}`, timestamp, { ex: 3600 });
    });
    
    await pipeline.exec();
    console.log(`[Realtime] Bulk pinged permission update for ${userIds.length} users`);
  } catch (error) {
    console.error(`[Realtime] Failed to bulk ping permission updates:`, error);
  }
}

/**
 * Pings a campaign via Redis to trigger a real-time table refresh event.
 * @param campaignId The ID of the campaign that received a new applicant.
 */
export async function pingCampaignUpdate(campaignId: string) {
  try {
    await redisClient.set(`campaign_ping:${campaignId}`, Date.now().toString(), { ex: 86400 }); // Expire in 24 hours
    console.log(`[Realtime] Pinged campaign update for: ${campaignId}`);
  } catch (error) {
    console.error(`[Realtime] Failed to ping campaign update for ${campaignId}:`, error);
  }
}
