import { CommunityInfoResponseDto } from './community-info.dto';
import { CommunityViewerContextDto } from './viewer-context.dto';

export class CommunityPageDto {
  community: CommunityInfoResponseDto;
  viewerContext: CommunityViewerContextDto;
}
