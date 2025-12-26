import { CommunityResponseDto } from '@app/dto';
import { CommunityWithRelationsAndCounts } from './community.types';
import {
  mapCommunityStatus,
  mapCommunityVisibility,
} from './community.enum-mapper';

export function mapCommunityToDto(
  entity: CommunityWithRelationsAndCounts,
): CommunityResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    title: entity.title,
    description: entity.description,

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

    counts: {
      members: entity._count.members,
      moderators: entity._count.moderators,
      followers: entity._count.followers,
    },

    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
