# autogit

GitHub webhook server for [sPhil](https://github.com/systemphil/sphil).

Reacts on pull requests and makes commits back to the PR based on the
transformer(s). Works for both PRs that come from branches internal to the
codebase as well as forks.

Current functionality:

-   Formats with Prettier according to the config in the repository.

Plans:

-   Improve API and code modularity.
-   Rewrite to Rust.
-   Integrate with Prepyrus to make more sophisticated transformations, like
    metadata insertion if it is missing.

Note:

-   Will only make changes to the PR head ref if the author of the PR allows
    maintainers to edit.
