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

export type CommunityInfoWithRelationsAndCounts = Prisma.CommunityGetPayload<{
  include: {
    icon: true;
    banner: true;
    rules: true;
    moderators: true;
    _count: {
      select: {
        members: true;
        followers: true;
      };
    };
  };
}>;
