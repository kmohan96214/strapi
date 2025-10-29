import type { Core } from '@strapi/types';
import { getService } from '../utils';

/**
 * Audit logs controller
 */
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Find audit logs with filters, pagination, and sorting
   */
  async find(ctx: any) {
    const { user } = ctx.state;

    // Check if the user has permission to read audit logs
    const permissionChecker = strapi.admin.services.permission.createPermissionChecker({
      user,
      action: 'plugin::audit-logs.read',
    });

    const hasPermission = await permissionChecker.hasPermission();
    if (!hasPermission) {
      return ctx.forbidden();
    }

    // Parse query parameters
    const {
      contentType,
      entityId,
      userId,
      action,
      startDate,
      endDate,
      page = 1,
      pageSize = 25,
      sort = 'timestamp:desc',
    } = ctx.query;

    // Convert string dates to Date objects
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    // Get audit logs
    const auditService = getService('audit');
    const result = await auditService.findAuditLogs({
      contentType,
      entityId,
      userId,
      action,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      sort,
    });

    return result;
  },

  /**
   * Find a single audit log by ID
   */
  async findOne(ctx: any) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    // Check if the user has permission to read audit logs
    const permissionChecker = strapi.admin.services.permission.createPermissionChecker({
      user,
      action: 'plugin::audit-logs.read',
    });

    const hasPermission = await permissionChecker.hasPermission();
    if (!hasPermission) {
      return ctx.forbidden();
    }

    // Get audit log
    const auditService = getService('audit');
    const auditLog = await auditService.findAuditLog(id);

    if (!auditLog) {
      return ctx.notFound();
    }

    return auditLog;
  },
});
