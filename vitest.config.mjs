// Unit tests for the pure helpers of src/server and of the FAQ script.
// Separate from vite.config.mjs so the Jahia build plugin is not involved.
export default {
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
};
