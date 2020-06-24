import {QueueItem} from "twitch_broadcasting_suite_shared/dist";
import {prisma} from "../../model/prisma";

export async function getAllQueueItemsForUser(userId: number, queueId: number): Promise<QueueItem[]> {
    let items = await prisma.queueItem.findMany({
        where: {
            queue: {
                id: queueId,
                user: {
                    id: userId
                }
            }
        }
    });

    return items.map(item => {
        return {
            id: item.id,
            type: item.type,
            description: item.description,
            icon: item.iconUrl,
            estimated_duration: item.estimatedDurationMs
        };
    });
}