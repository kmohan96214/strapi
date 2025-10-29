import { getService } from './utils';

/**
 * Bootstrap function that runs when the plugin is initialized
 */
export default async () => {
  // Register the audit log middleware to intercept content API operations
  const auditService = getService('audit');
  
  // Register middleware to intercept document operations
  strapi.documents.use(async (context, next) => {
    // Skip if audit logging is disabled
    const { enabled, excludeContentTypes } = strapi.config.get('plugin.audit-logs', {
      enabled: true,
      excludeContentTypes: [],
    });

    if (!enabled) {
      return next();
    }

    // Skip if content type is excluded
    if (excludeContentTypes.includes(context.contentType)) {
      return next();
    }

    // Only intercept create, update, and delete operations
    if (!['create', 'update', 'delete'].includes(context.action)) {
      return next();
    }

    // Get the original data before the operation
    let originalData = null;
    if (['update', 'delete'].includes(context.action) && context.params?.documentId) {
      try {
        originalData = await strapi.db.query(context.contentType).findOne({
          where: { documentId: context.params.documentId },
        });
      } catch (error) {
        // If the document doesn't exist, originalData remains null
      }
    }

    // Execute the operation
    const result = await next();

    // Create audit log entry
    try {
      await auditService.createAuditLog({
        action: context.action,
        contentType: context.contentType,
        entityId: context.params?.documentId || (result?.id || result?.documentId),
        userId: context.state?.user?.id,
        payload: context.action === 'delete' ? originalData : context.params?.data,
        previousData: originalData,
      });
    } catch (error) {
      // Log error but don't block the operation
      strapi.log.error('Failed to create audit log entry', error);
    }

    return result;
  });
};
