export type ProjectPreview = {
    title: string;
    description: string;
    tags: string[];
    href?: string;
    featured?: boolean;
};

export const projects: ProjectPreview[] = [
    {
        title: "cybersecurity home lab",
        description:
            "an isolated lab using linux and windows virtual machines, vmware, wireshark, and pi-hole to practice networking, traffic analysis, dns-level filtering, system hardening, and defensive workflows.",
        tags: ["vmware", "linux", "windows", "wireshark", "pi-hole"],
        featured: true,
    },
    {
        title: "simple c compiler",
        description:
            "a multi-phase compiler for a subset of c, including lexical analysis, recursive-descent parsing, semantic analysis, scoped symbol tables, type checking, ast-based code generation, and 32-bit x86/linux assembly output.",
        tags: ["c++", "x86 assembly", "linux", "gdb"],
        featured: true,
    },
    {
        title: "multi-agent robot formation control",
        description:
            "a senior capstone project involving decentralized robot formation control, matlab/simulink simulation, ros 2 integration, slam/amcl localization, odometry, imu data, and ekf-based pose estimation.",
        tags: ["ros 2", "matlab/simulink", "slam/amcl", "ekf", "raspberry pi"],
        featured: true,
    },
];