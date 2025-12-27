import { CommunityInfoWithRelationsAndCounts } from '../community.types';
import {
  mapCommunityStatus,
  mapCommunityVisibility,
} from './community.enum-mapper';
import { CommunityInfoResponseDto } from '@app/dto/community';

export function mapCommunityToDto(
  entity: CommunityInfoWithRelationsAndCounts,
): CommunityInfoResponseDto['community'] {
  return {
    id: entity.id,
    name: entity.name,
    title: entity.title,
    description: entity.description,
    ownerId: entity.ownerId,
    visibility: mapCommunityVisibility(entity.visibility),
    status: mapCommunityStatus(entity.status),

    icon: entity.icon
      ? { url: entity.icon.url, fileId: entity.icon.fileId }
      : null,

    banner: entity.banner
      ? { url: entity.banner.url, fileId: entity.banner.fileId }
      : null,

    rules: entity.rules.map((r) => ({
      id: r.id,
      text: r.text,
      order: r.order,
    })),
    moderators: entity.moderators.map((m) => ({
      id: m.id,
      userId: m.userId,
      communityId: m.communityId,
      invitedAt: m.invitedAt.toISOString(),
      respondedAt: m.respondedAt?.toISOString(),
      role: m.role,
      status: m.status,
    })),
    counts: {
      members: entity._count.members,
      followers: entity._count.followers,
    },

    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
