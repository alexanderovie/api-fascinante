export interface TenantContext {
  organizationId: string;
  organizationType: 'agency' | 'business';
  parentOrganizationId: string | null;
  membershipIds: string[];
}
