default:
  just --list

lint:
  bun x ultracite fix

typecheck:
  bun tsgo --noEmit

check: typecheck lint
