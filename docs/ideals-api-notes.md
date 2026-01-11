# iDeals Dataroom API Integration Notes

## Base URL
https://gateway.idealsvdr.com/api/v1

## Authentication
- API Key based authentication
- Header: `Authorization: {api_key}`
- Each API key is tied to a specific user and corporate account
- Inherits user's permissions and settings

## Key Endpoints

### Projects
- GET /api/v1/projects - List all projects
- GET /api/v1/projects/{projectId} - Get project details
- POST /api/v1/projects - Create new project
- PUT /api/v1/projects/{projectId}/closure - Close project

### Documents
- GET /api/v1/projects/{projectId}/documents - List documents
- GET /api/v1/projects/{projectId}/documents/{documentId}/download - Download document
- POST /api/v1/projects/{projectId}/documents/upload - Upload document

### Upload Document Details
- Endpoint: POST /api/v1/projects/{projectId}/documents/upload
- Headers:
  - Folder-Id: UUID (required) - Target folder
  - Document-Name: string - File name
  - Document-Id: UUID - For chunked uploads
  - Chunk-Number: number - For chunked uploads
  - Document-Size: number - Total file size
  - Content-Type: application/octet-stream
  - Authorization: API key

### Chunking Rules
- Files > 20MiB must be split into chunks
- Each chunk should be 20MiB (except last)
- Same Document-Id for all chunks
- Resumable: retry failed chunks without re-uploading entire file
- Idempotent: same chunk can be sent multiple times safely

### Folders
- GET /api/v1/projects/{projectId}/folders - List folders
- POST /api/v1/projects/{projectId}/folders - Create folder

## Project Status Restrictions
| Status | Read | Write |
|--------|------|-------|
| Active | ✅ | ✅ |
| Locked | ✅ | ❌ |
| Archived | ⚠️ | ⚠️ |
| Closed | ❌ | ❌ |

## Response Format
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "report-20-12-2020.pdf",
  "parentId": "4388cc23-960f-4ffd-a0fc-82886d1",
  "parentName": "Test folder",
  "index": "1.1",
  "isFavorite": true,
  "isAttachment": true,
  "dataType": "Folder",
  "createdAt": "2026-01-11T16:56:54.226Z",
  "publicationStatus": "Unpublished",
  "size": 1,
  "fileExtensionType": "PDFFile"
}
```
