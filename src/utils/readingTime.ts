const WORDS_PER_MINUTE = 225;

export const getReadingTime = (content: string) => {
    const plainText = content
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`]*`/g, "")
        .replace(/!\[[^\]]*]\([^)]+\)/g, "")
        .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
        .replace(/[#>*_~\-]/g, " ")
        .trim();

    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

    return `${minutes} min read`;
};