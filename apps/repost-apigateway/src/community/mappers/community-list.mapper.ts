import { GetAllCommunitiesResponse } from '@app/contracts/community/v1/queries';

export const mapCommunityListToDto = (
  communities: GetAllCommunitiesResponse,
) => {
  const mappedCommunities = communities.communities?.map((community) => ({
    ...community,
    icon: community.icon
      ? {
          url: community.icon.url,
          fileId: community.icon.fileId,
        }
      : null,
    banner: community.banner
      ? {
          url: community.banner.url,
          fileId: community.banner.fileId,
        }
      : null,
  }));

  return {
    ...communities,
    communities: mappedCommunities,
  };
};
