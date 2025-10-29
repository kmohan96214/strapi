# Audit Logging System Design Note

## Overview

The Audit Logging system is designed to automatically capture and record all content changes performed through Strapi's Content API. It provides a comprehensive audit trail of create, update, and delete operations, capturing key metadata such as the user who made the change, the content type affected, timestamps, and the actual changes made.

## Architecture

### Integration with Strapi

The audit logging system integrates with Strapi's document manager using middleware. This approach allows us to:

1. Intercept all content operations (create, update, delete) before they are executed
2. Capture the original state of the data (for update and delete operations)
3. Execute the operation
4. Capture the result and create an audit log entry

This middleware-based approach ensures that all content changes are logged without modifying the core Strapi codebase or requiring changes to existing content types.

### Components

The plugin consists of the following components:

1. **Content Type**: A new `audit-log` content type that stores audit log entries
2. **Middleware**: Hooks into Strapi's document manager to intercept content operations
3. **Service**: Provides methods for creating and retrieving audit logs
4. **Controller**: Handles REST API requests for retrieving audit logs
5. **Routes**: Defines the REST API endpoints for accessing audit logs
6. **Configuration**: Provides options for enabling/disabling logging and excluding specific content types

### Database Schema

The audit log entries are stored in a new collection/table named `audit_logs` with the following fields:

- `action`: The action type (create, update, delete)
- `contentType`: The content type name
- `entityId`: The entity ID
- `userId`: The user ID (if authenticated)
- `payload`: The payload data (for create and update operations)
- `previousData`: The previous data (for update and delete operations)
- `timestamp`: The timestamp of the operation

The schema includes appropriate indexes for efficient querying:

- `audit_logs_content_type_entity_id`: Index on contentType and entityId for filtering by content type and entity
- `audit_logs_user_id`: Index on userId for filtering by user
- `audit_logs_action`: Index on action for filtering by action type
- `audit_logs_timestamp`: Index on timestamp for sorting and filtering by date range

### Access Control

The plugin implements role-based access control using Strapi's permission system. Only users with the `read_audit_logs` permission can access the audit logs through the REST API.

### Configuration

The plugin provides the following configuration options:

- `auditLog.enabled` (boolean): Enable or disable logging globally
- `auditLog.excludeContentTypes` (array): Specify content types to exclude from logging

## Implementation Details

### Middleware Implementation

The middleware is implemented using Strapi's document manager middleware system. It intercepts content operations and creates audit log entries for each operation.

```typescript
strapi.documents.use(async (context, next) => {
  // Skip if audit logging is disabled or content type is excluded
  // ...

  // Get the original data before the operation
  let originalData = null;
  if (['update', 'delete'].includes(context.action) && context.params?.documentId) {
    // Fetch original data
    // ...
  }

  // Execute the operation
  const result = await next();

  // Create audit log entry
  await auditService.createAuditLog({
    action: context.action,
    contentType: context.contentType,
    entityId: context.params?.documentId || (result?.id || result?.documentId),
    userId: context.state?.user?.id,
    payload: context.action === 'delete' ? originalData : context.params?.data,
    previousData: originalData,
  });

  return result;
});
```

### REST API Implementation

The plugin provides REST API endpoints for retrieving audit logs:

- `GET /audit-logs`: Get a list of audit logs with filtering, pagination, and sorting
- `GET /audit-logs/:id`: Get a single audit log by ID

The API supports filtering by content type, entity ID, user ID, action type, and date range, as well as pagination and sorting.

## Design Decisions and Tradeoffs

### Middleware vs. Lifecycle Hooks

I chose to use middleware instead of lifecycle hooks because middleware provides access to the full context of the operation, including the user who performed the operation. Lifecycle hooks do not have access to the user context.

### JSON Storage for Payload and Previous Data

The payload and previous data are stored as JSON fields to accommodate the varying structure of different content types. This approach allows us to store the complete data without having to define a fixed schema for each content type.

### Indexing Strategy

The indexing strategy is designed to optimize the most common query patterns:

- Filtering by content type and entity ID (e.g., to view the history of a specific entity)
- Filtering by user ID (e.g., to view all changes made by a specific user)
- Filtering by action type (e.g., to view all create operations)
- Sorting and filtering by timestamp (e.g., to view recent changes)

### Performance Considerations

To minimize the performance impact of audit logging, the plugin:

1. Uses efficient database queries to fetch original data
2. Creates audit log entries asynchronously (but within the same transaction)
3. Allows excluding specific content types from logging
4. Implements proper indexing for efficient querying

## Future Improvements

1. **Admin UI**: Add an admin UI for viewing and searching audit logs
2. **Data Retention**: Implement data retention policies to automatically delete old audit logs
3. **Export**: Add functionality to export audit logs to CSV or other formats
4. **Webhooks**: Add support for sending audit log events to external systems via webhooks
5. **Detailed Diff**: Implement a more detailed diff algorithm to show exactly what changed in update operations
