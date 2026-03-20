# Contributing to DataCanvas

Thank you for your interest in contributing to DataCanvas! We welcome contributions from the community.

## Development Setup

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/datacanvas.git
   cd datacanvas
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
5. Fill in your development credentials in `.env.local`
6. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `refactor/*` - Code refactoring

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add new chart type
fix: resolve data parsing issue
docs: update README
style: format code
refactor: improve data detection
test: add unit tests
chore: update dependencies
```

### Pull Request Process

1. Create a new branch from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request against `develop` with a clear description

5. Ensure all checks pass (linting, type checking, build)

## Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use functional components with hooks
- Prefer composition over inheritance
- Write self-documenting code with clear variable names

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for meaningful test coverage

## Questions?

- Open an issue for bugs or feature requests
- Use discussions for questions
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 License.
