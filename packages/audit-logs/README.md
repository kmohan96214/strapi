# Strapi Audit Logs Plugin

This plugin adds automated audit logging for all content changes performed through Strapi's Content API.

## Features

- Automatically logs all create, update, and delete operations on content types
- Captures key metadata for each operation:
  - Content type name and record ID
  - Action type (create, update, delete)
  - Timestamp
  - User (if authenticated)
  - Changed fields or full payload depending on action type
- Provides REST API endpoints to retrieve, filter, and paginate audit logs
- Role-based access control for viewing audit logs
- Configuration options for enabling/disabling logging and excluding specific content types

## Installation

```bash
# Using npm
npm install @strapi/plugin-audit-logs

# Using yarn
yarn add @strapi/plugin-audit-logs
```

## Configuration

Add the following configuration to your `config/plugins.js` file:

```js
module.exports = ({ env }) => ({
  // ...other plugin configurations
  'audit-logs': {
    enabled: true, // Enable or disable audit logging
    excludeContentTypes: [], // Array of content types to exclude from logging
  },
});
```

## Usage

### Viewing Audit Logs

Audit logs can be accessed through the REST API endpoints:

- `GET /audit-logs`: Get a list of audit logs with filtering, pagination, and sorting
  - Query parameters:
    - `contentType`: Filter by content type
    - `entityId`: Filter by entity ID
    - `userId`: Filter by user ID
    - `action`: Filter by action type (create, update, delete)
    - `startDate`: Filter by start date (ISO format)
    - `endDate`: Filter by end date (ISO format)
    - `page`: Page number (default: 1)
    - `pageSize`: Page size (default: 25)
    - `sort`: Sort field and direction (default: timestamp:desc)
- `GET /audit-logs/:id`: Get a single audit log by ID

### Permissions

To access the audit logs, users need the `read` permission for the `audit-logs` plugin. This permission can be assigned to roles in the Strapi admin panel.

## Architecture

The audit logging system integrates with Strapi's document manager to intercept content operations. When a content operation is performed, the plugin creates an audit log entry with the relevant metadata.

### Database Schema

The plugin creates a new collection type called `audit_logs` with the following fields:

- `action`: The action type (create, update, delete)
- `contentType`: The content type name
- `entityId`: The entity ID
- `userId`: The user ID (if authenticated)
- `payload`: The payload data (for create and update operations)
- `previousData`: The previous data (for update and delete operations)
- `timestamp`: The timestamp of the operation

### Integration Points

The plugin hooks into Strapi's document manager to intercept content operations. It uses the `strapi.documents.use` middleware to capture content operations and create audit log entries.

## License

MIT
