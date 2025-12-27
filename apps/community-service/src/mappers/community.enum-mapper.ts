import {
  CommunityMemberStatus as ContractMemberStatus,
  CommunityModeratorRole as ContractModeratorRole,
  CommunityModeratorStatus as ContractModeratorStatus,
  CommunityStatus as ContractStatus,
  CommunityVisibility as ContractVisibility,
} from '@app/contracts/community/v1/enums';

import {
  CommunityMemberStatus as PrismaMemberStatus,
  CommunityModeratorRole as PrismaModeratorRole,
  CommunityModeratorStatus as PrismaModeratorStatus,
  CommunityStatus as PrismaStatus,
  CommunityVisibility as PrismaVisibility,
} from '../../generated/prisma/enums';

export function mapCommunityVisibility(
  visibility: PrismaVisibility,
): ContractVisibility {
  switch (visibility) {
    case PrismaVisibility.PUBLIC:
      return ContractVisibility.COMMUNITY_VISIBILITY_PUBLIC;
    case PrismaVisibility.RESTRICTED:
      return ContractVisibility.COMMUNITY_VISIBILITY_RESTRICTED;
    case PrismaVisibility.PRIVATE:
      return ContractVisibility.COMMUNITY_VISIBILITY_PRIVATE;
    default:
      throw new Error(`Unhandled visibility: ${visibility as string}`);
  }
}

export function mapCommunityStatus(status: PrismaStatus): ContractStatus {
  switch (status) {
    case PrismaStatus.ACTIVE:
      return ContractStatus.COMMUNITY_STATUS_ACTIVE;
    case PrismaStatus.SUSPENDED:
      return ContractStatus.COMMUNITY_STATUS_SUSPENDED;
    case PrismaStatus.ARCHIVED:
      return ContractStatus.COMMUNITY_STATUS_ARCHIVED;
    default:
      throw new Error(`Unhandled status: ${status as string}`);
  }
}

export function mapCommunityVisibilityFromContract(
  visibility: ContractVisibility,
): PrismaVisibility {
  switch (visibility) {
    case ContractVisibility.COMMUNITY_VISIBILITY_PUBLIC:
      return PrismaVisibility.PUBLIC;
    case ContractVisibility.COMMUNITY_VISIBILITY_RESTRICTED:
      return PrismaVisibility.RESTRICTED;
    case ContractVisibility.COMMUNITY_VISIBILITY_PRIVATE:
      return PrismaVisibility.PRIVATE;
    default:
      throw new Error(`Unhandled visibility: ${visibility as number}`);
  }
}

export function mapCommunityMemberStatus(
  status: PrismaMemberStatus,
): ContractMemberStatus {
  switch (status) {
    case PrismaMemberStatus.PENDING:
      return ContractMemberStatus.COMMUNITY_MEMBER_STATUS_PENDING;
    case PrismaMemberStatus.ACTIVE:
      return ContractMemberStatus.COMMUNITY_MEMBER_STATUS_ACTIVE;
    case PrismaMemberStatus.BANNED:
      return ContractMemberStatus.COMMUNITY_MEMBER_STATUS_BANNED;
    default:
      return ContractMemberStatus.COMMUNITY_MEMBER_STATUS_UNSPECIFIED;
  }
}

export function mapCommunityModeratorRole(
  role: PrismaModeratorRole,
): ContractModeratorRole {
  switch (role) {
    case PrismaModeratorRole.MODERATOR:
      return ContractModeratorRole.COMMUNITY_MODERATOR_ROLE_MODERATOR;
    case PrismaModeratorRole.OWNER:
      return ContractModeratorRole.COMMUNITY_MODERATOR_ROLE_OWNER;
    default:
      return ContractModeratorRole.COMMUNITY_MODERATOR_ROLE_UNSPECIFIED;
  }
}

export function mapCommunityModeratorStatus(
  status: PrismaModeratorStatus,
): ContractModeratorStatus {
  switch (status) {
    case PrismaModeratorStatus.INVITED:
      return ContractModeratorStatus.COMMUNITY_MODERATOR_STATUS_INVITED;
    case PrismaModeratorStatus.ACTIVE:
      return ContractModeratorStatus.COMMUNITY_MODERATOR_STATUS_ACTIVE;
    case PrismaModeratorStatus.REJECTED:
      return ContractModeratorStatus.COMMUNITY_MODERATOR_STATUS_REJECTED;
    case PrismaModeratorStatus.REMOVED:
      return ContractModeratorStatus.COMMUNITY_MODERATOR_STATUS_REMOVED;
    default:
      return ContractModeratorStatus.COMMUNITY_MODERATOR_STATUS_UNSPECIFIED;
  }
}
