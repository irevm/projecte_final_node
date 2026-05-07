export const RESOURCE_TYPES = ['laptop', 'room', 'software', 'vehicle'] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export type ResourceStatus = 'available' | 'assigned';

export interface Resource {
  id: number;
  name: string;
  type: string;
  status: string;
  location: string;
  createdAt: string;
}