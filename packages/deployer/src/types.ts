export interface IConfigurations {
    public: string;
    cwd: string;
    ignore_hidden?: ({
        public: string;
    }) | string;
    ignore_pattern?: ({
        public: string;
    }) | string;
    commit_message: string;
    repo?: (string) | ({
        url: string;
        branch: string;
    });
    silent?: boolean;
    username?: string;
    email?: string;
    extendDirs?: string | string[];
    concurrency?: number;
    runtime: IRunnerConfig;
}

export interface IRunnerConfig {
    deploy: boolean;
}
