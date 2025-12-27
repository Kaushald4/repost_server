export enum CommunityVisibility {
  PUBLIC = 'PUBLIC',
  RESTRICTED = 'RESTRICTED',
  PRIVATE = 'PRIVATE',
}

export enum CommunityStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export interface CommunityRuleDto {
  id: string;
  text: string;
  order: number;
}
