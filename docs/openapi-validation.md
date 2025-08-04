# OpenAPI Schema Validation

This project uses [@redocly/cli](https://redocly.com/docs/cli/) to validate the OpenAPI specification against the OpenAPI 3.1.0 standard.

## Installation

The tool is already installed as a dev dependency:

```bash
npm install --save-dev @redocly/cli
```

## Available Scripts

### Validation
```bash
npm run validate-openapi
```
Validates the OpenAPI specification file (`src/openapi/openapi.yaml`) against the OpenAPI 3.1.0 standard and custom linting rules.

### Bundle
```bash
npm run bundle-openapi
```
Creates a single bundled JSON file from the YAML specification at `dist/openapi.json`.

### Preview Documentation
```bash
npm run preview-docs
```
Starts a local server to preview the API documentation generated from the OpenAPI spec.

## Configuration

The validation rules are configured in `.redocly.yaml`:

- **security-defined**: Disabled (appropriate for development APIs)
- **no-server-example.com**: Disabled (allows localhost and example.com URLs)
- **operation-4xx-response**: Warning level (suggests but doesn't require 4xx responses)
- **no-unused-components**: Warning level (allows unused components for future use)

## Integration with Tests

OpenAPI validation is automatically run before Jest tests via the `npm test` command. This ensures that:

1. The OpenAPI specification is valid before running API tests
2. Any schema violations are caught early in the development process
3. CI/CD pipelines will fail if the OpenAPI spec becomes invalid

## Current Status

The OpenAPI specification is **valid** ✅ with **no warnings** 🎉

All validation issues have been resolved:
- ✅ All endpoints now include appropriate 4xx error responses
- ✅ All response components are properly referenced and used
- ✅ Complete error response coverage for all operations

The specification passes validation without any warnings or errors.

## Usage Tips

- Run `npm run validate-openapi` after making changes to `src/openapi/openapi.yaml`
- Use `npm run bundle-openapi` to generate a single-file spec for external tools
- Use `npm run preview-docs` to see how your API documentation will look
- The validation runs automatically with `npm test`, so you'll be notified of any issues during testing
