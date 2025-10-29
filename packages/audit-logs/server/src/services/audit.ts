import type { Core } from '@strapi/types';

interface AuditLogData {
  action: 'create' | 'update' | 'delete';
  contentType: string;
  entityId: string;
  userId?: string;
  payload?: any;
  previousData?: any;
}

interface FindParams {
  contentType?: string;
  entityId?: string;
  userId?: string;
  action?: 'create' | 'update' | 'delete';
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
  sort?: string;
}

/**
 * Audit service
 */
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Create an audit log entry
   */
  async createAuditLog(data: AuditLogData) {
    return strapi.db.query('plugin::audit-logs.audit-log').create({
      data: {
        action: data.action,
        contentType: data.contentType,
        entityId: data.entityId,
        userId: data.userId,
        payload: data.payload,
        previousData: data.previousData,
        timestamp: new Date(),
      },
    });
  },

  /**
   * Find audit logs with filters, pagination, and sorting
   */
  async findAuditLogs({
    contentType,
    entityId,
    userId,
    action,
    startDate,
    endDate,
    page = 1,
    pageSize = 25,
    sort = 'timestamp:desc',
  }: FindParams = {}) {
    const filters: any = {};

    if (contentType) {
      filters.contentType = contentType;
    }

    if (entityId) {
      filters.entityId = entityId;
    }

    if (userId) {
      filters.userId = userId;
    }

    if (action) {
      filters.action = action;
    }

    if (startDate || endDate) {
      filters.timestamp = {};

      if (startDate) {
        filters.timestamp.$gte = startDate;
      }

      if (endDate) {
        filters.timestamp.$lte = endDate;
      }
    }

    const [sortField, sortOrder] = sort.split(':');

    const [results, count] = await Promise.all([
      strapi.db.query('plugin::audit-logs.audit-log').findMany({
        where: filters,
        orderBy: { [sortField]: sortOrder.toLowerCase() },
        offset: (page - 1) * pageSize,
        limit: pageSize,
      }),
      strapi.db.query('plugin::audit-logs.audit-log').count({
        where: filters,
      }),
    ]);

    return {
      results,
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(count / pageSize),
        total: count,
      },
    };
  },

  /**
   * Find a single audit log by ID
   */
  async findAuditLog(id: string) {
    return strapi.db.query('plugin::audit-logs.audit-log').findOne({
      where: { id },
    });
  },
});
