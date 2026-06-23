# Contributing to DevOpsHub

First off, thank you for considering contributing to DevOpsHub! It's people like you that make DevOpsHub such a great tool for students and developers.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) tab to see if it's already being discussed. If not, feel free to open a new issue!

## 2. Fork & create a branch

If this is something you think you can fix, then fork DevOpsHub and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):
```bash
git checkout -b 325-add-docker-volume-support
```

## 3. Implementation Guidelines

- **Frontend:** Ensure your UI changes are responsive and respect the Tailwind dark mode implementation.
- **Backend:** Do not use `exec()` with unsanitized inputs. Always utilize the `dockerode` library for container manipulation.
- **Testing:** Please run `npm run test` before submitting your PR. Any changes to the API must include a corresponding Jest test.

## 4. Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with DevOpsHub's master branch:

```bash
git remote add upstream https://github.com/yourusername/devopshub.git
git fetch upstream
git merge upstream/main
```

Then push your branch to GitHub and create a Pull Request against the `main` branch. Provide a clear description of the problem you solved or the feature you added.
