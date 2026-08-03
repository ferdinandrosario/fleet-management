# Backend troubleshooting

Symptom → cause → fix, per known failure mode. Add a row the first time a
failure mode is hit (universal rule 5).

## Backend

### `undefined method 'filter_map'` / `Could not find 'bundler' (x) required by Gemfile.lock`

**Symptom.** `bin/rails server`, `bin/rails runner`, or `bundle exec
rails …` aborts during boot with one of:

```
undefined method `filter_map' for [:mri, :windows]:Array (NoMethodError)
Could not find 'bundler' (4.0.14) required by your .../Gemfile.lock
```

**Cause.** The command ran under **system Ruby 2.6** (macOS ships it)
instead of the project's mise-managed Ruby 4.0.6. `filter_map` is a
Ruby 2.7+ method, so 4.0-era bundler code crashes under 2.6. This happens
when the shell does **not** have mise activated — most often a
non-interactive shell (a script, a CI step, or a tool that skips
`~/.zshrc`), because mise's shims are added by your shell rc.

**Fix.**
- Interactive shell: ensure mise is activated (`mise activate` in your
  shell rc). Then `cd backend && ruby -v` must print `ruby 4.0.6`.
- Non-interactive shell / scripts: prefix commands with `mise exec --`
  (e.g. `mise exec -- bundle exec rspec`). If a *grandchild* process
  (Puma boot, `rails runner`) still falls through to 2.6, put mise's Ruby
  bin first on `PATH` for that command:

  ```bash
  PATH="$(mise where ruby)/bin:$PATH" bundle exec rails server
  ```

**Verify.** `ruby -v` → `ruby 4.0.6` in the same shell that runs the
failing command.
