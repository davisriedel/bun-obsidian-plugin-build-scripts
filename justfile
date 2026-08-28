default:
  just --list

lint:
  bun x ultracite fix

typecheck:
  bun tsc --noEmit

check: typecheck lint
