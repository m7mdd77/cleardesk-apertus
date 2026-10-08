.PHONY: run test
run:
	node track_2b/scripts/run-containers.mjs
test:
	node --test track_2b/src/*.test.mjs
