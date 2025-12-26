import { Prisma } from '../generated/prisma/client';

export type CommunityWithRelationsAndCounts = Prisma.CommunityGetPayload<{
  include: {
    icon: true;
    banner: true;
    rules: true;
    _count: {
      select: {
        members: true;
        moderators: true;
        followers: true;
      };
    };
  };
}>;
