export const ROLE_CLAIM = 'https://example.com/roles';
export const MEMBERSHIP_IDS_CLAIM = 'https://example.com/membership_ids';
export const ORGANIZATION_IDS_CLAIM = 'https://example.com/organization_ids';
export const ORGANIZATIONS_CLAIM = 'https://example.com/organizations';
export const ACTIVE_ORGANIZATION_CLAIM = 'https://example.com/active_organization_id';

export interface AuthTenantHints {
  activeOrganizationId?: string;
}

export interface OrganizationClaim {
  id: string;
  type: 'agency' | 'business';
  parentOrganizationId?: string | null;
}

export interface AuthContext {
  authSource: 'auth0';
  userId: string;
  email: string | null;
  roles: string[];
  membershipIds: string[];
  organizationIds: string[];
  issuedAt: number;
  expiresAt: number;
  claims: Record<string, unknown>;
  tenantHints?: AuthTenantHints;
}

const normalizeValue = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
};

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeValue(entry))
      .filter((entry): entry is string => entry !== null && entry.length > 0);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }
  return [];
};

export const normalizeClaimList = (
  claims: Record<string, unknown>,
  claimName: string
): string[] => asStringArray(claims[claimName]);

const isOrganizationClaim = (value: unknown): value is OrganizationClaim => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const entry = value as Record<string, unknown>;
  const typeValue = entry['type'];
  return (
    typeof entry['id'] === 'string' &&
    (typeValue === 'agency' || typeValue === 'business')
  );
};

export const normalizeOrganizationClaimList = (
  claims: Record<string, unknown>
): OrganizationClaim[] => {
  const raw = claims[ORGANIZATIONS_CLAIM];
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw
      .filter(isOrganizationClaim)
      .map((entry) => ({
        id: entry.id,
        type: entry.type,
        parentOrganizationId:
          typeof entry.parentOrganizationId === 'string'
            ? entry.parentOrganizationId
            : null,
      }));
  }

  if (isOrganizationClaim(raw)) {
    return [
      {
        id: raw.id,
        type: raw.type,
        parentOrganizationId:
          typeof raw.parentOrganizationId === 'string'
            ? raw.parentOrganizationId
            : null,
      },
    ];
  }

  return [];
};
