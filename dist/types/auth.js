"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOrganizationClaimList = exports.normalizeClaimList = exports.ACTIVE_ORGANIZATION_CLAIM = exports.ORGANIZATIONS_CLAIM = exports.ORGANIZATION_IDS_CLAIM = exports.MEMBERSHIP_IDS_CLAIM = exports.ROLE_CLAIM = void 0;
exports.ROLE_CLAIM = 'https://example.com/roles';
exports.MEMBERSHIP_IDS_CLAIM = 'https://example.com/membership_ids';
exports.ORGANIZATION_IDS_CLAIM = 'https://example.com/organization_ids';
exports.ORGANIZATIONS_CLAIM = 'https://example.com/organizations';
exports.ACTIVE_ORGANIZATION_CLAIM = 'https://example.com/active_organization_id';
const normalizeValue = (value) => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    return null;
};
const asStringArray = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((entry) => normalizeValue(entry))
            .filter((entry) => entry !== null && entry.length > 0);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? [trimmed] : [];
    }
    return [];
};
const normalizeClaimList = (claims, claimName) => asStringArray(claims[claimName]);
exports.normalizeClaimList = normalizeClaimList;
const isOrganizationClaim = (value) => {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const entry = value;
    const typeValue = entry['type'];
    return (typeof entry['id'] === 'string' &&
        (typeValue === 'agency' || typeValue === 'business'));
};
const normalizeOrganizationClaimList = (claims) => {
    const raw = claims[exports.ORGANIZATIONS_CLAIM];
    if (!raw) {
        return [];
    }
    if (Array.isArray(raw)) {
        return raw
            .filter(isOrganizationClaim)
            .map((entry) => ({
            id: entry.id,
            type: entry.type,
            parentOrganizationId: typeof entry.parentOrganizationId === 'string'
                ? entry.parentOrganizationId
                : null,
        }));
    }
    if (isOrganizationClaim(raw)) {
        return [
            {
                id: raw.id,
                type: raw.type,
                parentOrganizationId: typeof raw.parentOrganizationId === 'string'
                    ? raw.parentOrganizationId
                    : null,
            },
        ];
    }
    return [];
};
exports.normalizeOrganizationClaimList = normalizeOrganizationClaimList;
