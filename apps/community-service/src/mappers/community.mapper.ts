import { CommunityInfoWithRelationsAndCounts } from '../community.types';
import {
  mapCommunityStatus,
  mapCommunityVisibility,
  mapCommunityModeratorRole,
  mapCommunityModeratorStatus,
} from './community.enum-mapper';
import type { Community } from '@app/contracts/community/v1/messages';

export function mapCommunityToDto(
  entity: CommunityInfoWithRelationsAndCounts,
): Community {
  return {
    id: entity.id,
    name: entity.name,
    title: entity.title,
    description: entity.description ?? undefined,
    ownerId: entity.ownerId,
    visibility: mapCommunityVisibility(entity.visibility),
    status: mapCommunityStatus(entity.status),

    icon: entity.icon
      ? { url: entity.icon.url, fileId: entity.icon.fileId }
      : undefined,

    banner: entity.banner
      ? { url: entity.banner.url, fileId: entity.banner.fileId }
      : undefined,

    rules: entity.rules.map((r) => ({
      id: r.id,
      text: r.text,
      order: r.order,
    })),
    counts: {
      members: entity._count.members,
      followers: entity._count.followers,
    },

    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),

    moderators: entity.moderators.map((m) => ({
      id: m.id,
      userId: m.userId,
      communityId: m.communityId,
      invitedAt: m.invitedAt.toISOString(),
      respondedAt: m.respondedAt?.toISOString(),
      role: mapCommunityModeratorRole(m.role),
      status: mapCommunityModeratorStatus(m.status),
    })),
  };
}
