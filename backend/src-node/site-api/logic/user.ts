import {prisma} from '../../model/prisma';
import * as crypto from 'crypto';

//Initializes the user in an IDEMPOTENT fashion; That means that this function can/may be run multiple times,
//And should not error.
export async function initUserIdempotent(userId: number) {
    //Create default queue
    await prisma.queue.upsert({
        where: {
            userId_queueName: {
                userId,
                queueName: 'Default',
            },
        },
        update: {},
        create: {
            queueName: 'Default',
            user: {
                connect: {
                    id: userId,
                },
            },
            secret: crypto.randomBytes(16).toString('hex'),
        },
    });
}
