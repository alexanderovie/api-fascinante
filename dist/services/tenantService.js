"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureTenantForUser = void 0;
const crypto_1 = require("crypto");
const MEMBERSHIP_QUERY = `
  SELECT
    m.id AS membership_id,
    o.id AS organization_id,
    o.type AS organization_type,
    o.parent_organization_id
  FROM memberships m
  JOIN organizations o ON o.id = m.organization_id
  WHERE m.user_id = $1
`;
const buildTenantFromRows = (rows) => {
    const first = rows[0];
    return {
        organizationId: first.organization_id,
        organizationType: first.organization_type,
        parentOrganizationId: first.parent_organization_id,
        membershipIds: rows.map((row) => row.membership_id),
    };
};
const normalizeOrganizationName = (email, userId) => {
    const normalizedEmail = typeof email === 'string' ? email.trim() : '';
    if (normalizedEmail.length > 0) {
        return normalizedEmail;
    }
    return `user-${userId}`;
};
const fetchMembershipRows = async (fastify, userId) => {
    const result = await fastify.pg.query(MEMBERSHIP_QUERY, [userId]);
    return result.rows;
};
const createDefaultTenant = async (fastify, userId, email) => {
    const client = await fastify.pg.connect();
    try {
        await client.query('BEGIN');
        const existingRows = await client.query(MEMBERSHIP_QUERY, [userId]);
        if (existingRows.rows.length > 0) {
            await client.query('COMMIT');
            return buildTenantFromRows(existingRows.rows);
        }
        const organizationId = (0, crypto_1.randomUUID)();
        const membershipId = (0, crypto_1.randomUUID)();
        const organizationName = normalizeOrganizationName(email, userId);
        await client.query('INSERT INTO organizations (id, name, type, parent_organization_id) VALUES ($1, $2, $3, $4)', [organizationId, organizationName, 'business', null]);
        await client.query('INSERT INTO memberships (id, user_id, organization_id, role, is_active) VALUES ($1, $2, $3, $4, $5)', [membershipId, userId, organizationId, 'admin', true]);
        await client.query('COMMIT');
        return {
            organizationId,
            organizationType: 'business',
            parentOrganizationId: null,
            membershipIds: [membershipId],
        };
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
const ensureTenantForUser = async (fastify, userId, email) => {
    const rows = await fetchMembershipRows(fastify, userId);
    if (rows.length > 0) {
        return buildTenantFromRows(rows);
    }
    return createDefaultTenant(fastify, userId, email);
};
exports.ensureTenantForUser = ensureTenantForUser;
