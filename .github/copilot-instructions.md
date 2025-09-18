# Copilot Instructions for sheshisa-store

## Project Overview
- **sheshisa-store** is a Medusa v2-based commerce backend, using modular architecture for extensibility and customization.
- Major components: `modules/` (business logic), `api/` (REST endpoints), `workflows/` (orchestration), `jobs/` (scheduled tasks), `links/` (cross-module relations), `scripts/` (CLI tools), `subscribers/` (event handlers), and `admin/` (admin UI extensions).

## Key Patterns & Conventions
- **Modules**: Each feature (e.g., delivery, driver, restaurant) is a module in `src/modules/`. Modules define models, services, and are registered in `medusa-config.ts`.
- **API Routes**: File-based routing in `src/api/`. Use `[param]` folders for path params. Handlers export HTTP method functions (e.g., `GET`, `POST`).
- **Workflows**: Orchestrate multi-step logic in `src/workflows/`. Steps and workflows are composed using Medusa's workflow SDK.
- **Jobs**: Scheduled background tasks in `src/jobs/`, each exporting a handler and config (with cron schedule).
- **Links**: Define cross-module model associations in `src/links/` using `defineLink`.
- **Scripts**: Custom CLI scripts in `src/scripts/`, run with `npx medusa exec ./src/scripts/<script>.ts`.
- **Subscribers**: Event listeners in `src/subscribers/`, each exporting a handler and config for the event name.
- **Admin**: Extend admin UI in `src/admin/` with widgets/pages using React.

## Developer Workflows
- **Build**: Standard TypeScript build; see `tsconfig.json`.
- **Migrations**: Generate with `npx medusa db:generate <module>`; run with `npx medusa db:migrate`.
- **Testing**: Integration tests in `integration-tests/` using `medusa-test-utils`.
- **Custom CLI**: Place scripts in `src/scripts/` and run via Medusa CLI.

## Integration & Communication
- **Dependency Injection**: Use `req.scope.resolve(<service>)` in API routes and workflows to access services.
- **Events**: Use subscribers for event-driven logic; events are named (e.g., `product.created`).
- **Cross-module links**: Use `defineLink` in `links/` to relate models across modules.

## Examples
- See `src/modules/README.md` for module structure and registration.
- See `src/api/README.md` for API route conventions and middleware.
- See `src/workflows/README.md` for workflow composition.
- See `integration-tests/http/README.md` for test patterns.

## Project-specific Notes
- Follows Medusa v2 conventions closely; see [Medusa docs](https://docs.medusajs.com/learn/introduction/architecture) for deeper context.
- Use TypeScript throughout. Prefer Medusa's utility functions (e.g., `defineMiddlewares`, `defineLink`).
- All custom logic should be modular and discoverable via the directory structure above.
