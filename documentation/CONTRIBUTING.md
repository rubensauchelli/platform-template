# Contributing to SCR Extraction Tool

Thank you for your interest in contributing to the SCR Extraction Tool! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Environment Setup](#development-environment-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Security Vulnerabilities](#security-vulnerabilities)
- [License](#license)

## Code of Conduct

This project adheres to a Code of Conduct that sets expectations for participation in our community. By participating, you are expected to uphold this code. Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

There are many ways you can contribute to the SCR Extraction Tool:

1. **Report Bugs**: If you find a bug, please create an issue using the bug report template.
2. **Suggest Enhancements**: Have an idea for a new feature? Submit a feature request.
3. **Improve Documentation**: Help us improve our documentation by fixing errors or adding missing information.
4. **Write Code**: Contribute code changes by submitting a pull request.
5. **Review Pull Requests**: Help review pull requests and provide feedback.

## Development Environment Setup

To set up your development environment:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/scr-extraction-tool.git
   cd scr-extraction-tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy the `.env.example` file to `.env.local` and fill in the required values:
   ```bash
   cp .env.example .env.local
   ```

4. **Initialize the database**:
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Coding Standards

Please adhere to the following coding standards:

- Use TypeScript for all new code
- Follow the eslint configuration provided in the project
- Write clean, readable, and well-documented code
- Include comments for complex logic
- Use meaningful variable and function names
- Follow the existing code structure and patterns

## Pull Request Process

1. **Create a branch**: Create a branch from `main` for your changes.
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**: Implement your changes according to the coding standards.

3. **Write tests**: Add tests for your changes when applicable.

4. **Update documentation**: Update any relevant documentation.

5. **Submit a pull request**: Push your branch and create a pull request against the `main` branch.

6. **Code review**: Address any feedback from the code review process.

7. **Merge**: Once approved, your pull request will be merged.

## Commit Message Guidelines

Please follow these guidelines for commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line
- Consider starting the commit message with an applicable emoji:
  - ✨ (`:sparkles:`) for new features
  - 🐛 (`:bug:`) for bug fixes
  - 📚 (`:books:`) for documentation changes
  - ♻️ (`:recycle:`) for refactoring
  - 🎨 (`:art:`) for formatting/styling changes
  - ⚡️ (`:zap:`) for performance improvements
  - 🧪 (`:test_tube:`) for adding tests

## Issue Reporting Guidelines

When reporting issues, please use the appropriate issue template and provide as much detail as possible, including:

- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or error messages
- Environment details (OS, browser, version, etc.)

## Documentation Guidelines

When contributing to documentation:

- Use clear and concise language
- Include examples when applicable
- Follow Markdown syntax conventions
- Keep the documentation up-to-date with code changes
- Include diagrams or screenshots when they help clarify concepts

## Testing Guidelines

Please ensure your code includes appropriate tests:

- Write unit tests for new functionality
- Ensure existing tests pass
- Aim for high test coverage
- Use the testing framework provided in the project

## Security Vulnerabilities

If you discover a security vulnerability, please do NOT open an issue. Email security@yourdomain.com instead with details about the vulnerability.

## License

By contributing to the SCR Extraction Tool, you agree that your contributions will be licensed under the project's [MIT License](LICENSE). 