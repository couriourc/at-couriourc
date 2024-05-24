---
to: packages/<%= name %>/build.config.ts
---
import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    declaration: true,
});
