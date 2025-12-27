export class CommunityViewerContextDto {
  isLoggedIn: boolean;
  isMember: boolean;
  role: 'OWNER' | 'MODERATOR' | 'MEMBER' | null;
}
