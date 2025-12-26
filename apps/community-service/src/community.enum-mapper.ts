import {
  CommunityVisibility as ContractVisibility,
  CommunityStatus as ContractStatus,
} from '@app/dto';

import {
  CommunityVisibility as PrismaVisibility,
  CommunityStatus as PrismaStatus,
} from '../generated/prisma/client';

export function mapCommunityVisibility(
  visibility: PrismaVisibility,
): ContractVisibility {
  switch (visibility) {
    case PrismaVisibility.PUBLIC:
      return ContractVisibility.PUBLIC;
    case PrismaVisibility.RESTRICTED:
      return ContractVisibility.RESTRICTED;
    case PrismaVisibility.PRIVATE:
      return ContractVisibility.PRIVATE;
    default:
      throw new Error(`Unhandled visibility: ${visibility as string}`);
  }
}

export function mapCommunityStatus(status: PrismaStatus): ContractStatus {
  switch (status) {
    case PrismaStatus.ACTIVE:
      return ContractStatus.ACTIVE;
    case PrismaStatus.SUSPENDED:
      return ContractStatus.SUSPENDED;
    case PrismaStatus.ARCHIVED:
      return ContractStatus.ARCHIVED;
    default:
      throw new Error(`Unhandled status: ${status as string}`);
  }
}
