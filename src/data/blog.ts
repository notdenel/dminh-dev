export type BlogPostPreview = {
    title: string;
    description: string;
    status?: string;
    href?: string;
    featured?: boolean;
};

// "featured" toggle determines which entries appear on the homepage
export const blogPosts: BlogPostPreview[] = [
    {
        title: "building my cybersecurity home lab",
        description:
            "notes on setting up an isolated lab for networking, traffic analysis, dns filtering, and defensive security practice.",
        status: "coming soon",
        featured: true,
    },
    {
        title: "what building a compiler taught me about systems",
        description:
            "reflections on parsing, semantic analysis, code generation, assembly, and debugging programs from the bottom up.",
        status: "coming soon",
        featured: false,
    },
    {
        title: "welcome to my blog",
        description: "a space where i yap about whatever!",
        status: "coming soon",
        featured: true,
    },
];