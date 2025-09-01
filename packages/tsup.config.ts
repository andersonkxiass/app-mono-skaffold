import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    external: ['@orpc/contract', '@orpc/server', 'zod'],
    outDir: 'dist',
    skipNodeModulesBundle: true,
    keepNames: true,
    // Ensure proper module resolution for pnpm
    esbuildOptions(options) {
        options.mainFields = ['module', 'main'];
        options.conditions = ['import', 'module', 'default'];
        // Help resolve peer dependencies from workspace root
        options.preserveSymlinks = false;
    }
});
