import { CommunityWithRelationsAndCounts } from '../community.types';
import type { CommunitySummary } from '@app/contracts/community/v1/messages';

export function mapCommunityListToDto(
  entity: CommunityWithRelationsAndCounts,
): CommunitySummary {
  return {
    id: entity.id,
    name: entity.name,
    title: entity.title,

    icon: entity.icon
      ? { url: entity.icon.url, fileId: entity.icon.fileId }
      : undefined,

    banner: entity.banner
      ? { url: entity.banner.url, fileId: entity.banner.fileId }
      : undefined,

    counts: {
      members: entity._count.members,
      followers: entity._count.followers,
    },

    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
