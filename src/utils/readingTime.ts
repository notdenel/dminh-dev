const WORDS_PER_MINUTE = 225;

const MIN_SECONDS = 60;
const IMAGE_SECONDS_START = 12;
const IMAGE_SECONDS_MIN = 3;
const CODE_SECONDS_PER_LINE = 2;
const CODE_BLOCK_MIN_SECONDS = 8;
const TABLE_SECONDS_PER_ROW = 3;
const TABLE_MIN_SECONDS = 10;
const EMBED_SECONDS = 20;

const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
};

const getImageSeconds = (imageCount: number) => {
    let total = 0;

    for (let index = 0; index < imageCount; index++) {
        total += Math.max(IMAGE_SECONDS_START - index, IMAGE_SECONDS_MIN);
    }

    return total;
};

const getCodeSeconds = (codeBlocks: string[]) => {
    let total = 0;

    for (const block of codeBlocks) {
        const lineCount = block
            .replace(/```[a-zA-Z0-9_-]*\n?/, "")
            .replace(/```$/, "")
            .split("\n")
            .filter((line) => line.trim().length > 0).length;

        total += Math.max(
            lineCount * CODE_SECONDS_PER_LINE,
            CODE_BLOCK_MIN_SECONDS,
        );
    }

    return total;
};

const getTableSeconds = (tableBlocks: string[]) => {
    let total = 0;

    for (const table of tableBlocks) {
        const rowCount = table
            .split("\n")
            .filter((line) => line.trim().startsWith("|")).length;

        total += Math.max(rowCount * TABLE_SECONDS_PER_ROW, TABLE_MIN_SECONDS);
    }

    return total;
};

export const getReadingTime = (content: string) => {
    const codeBlocks = content.match(/```[\s\S]*?```/g) ?? [];
    const codeSeconds = getCodeSeconds(codeBlocks);

    const contentWithoutCode = content.replace(/```[\s\S]*?```/g, " ");

    const markdownImages = contentWithoutCode.match(/!\[[^\]]*]\([^)]+\)/g) ?? [];
    const htmlImages = contentWithoutCode.match(/<img\b[^>]*>/gi) ?? [];
    const imageSeconds = getImageSeconds(markdownImages.length + htmlImages.length);

    const tableBlocks =
        contentWithoutCode.match(/(?:^|\n)(?:\|.*\|\n?){2,}/g) ?? [];
    const tableSeconds = getTableSeconds(tableBlocks);

    const embeds =
        contentWithoutCode.match(/<(iframe|video|audio|embed)\b[^>]*>/gi) ?? [];
    const embedSeconds = embeds.length * EMBED_SECONDS;

    const plainText = contentWithoutCode
        .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
        .replace(/<img\b[^>]*>/gi, " ")
        .replace(/<(iframe|video|audio|embed)\b[^>]*>/gi, " ")
        .replace(/\|/g, " ")
        .replace(/`[^`]*`/g, " ")
        .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
        .replace(/[#>*_~\-]/g, " ")
        .trim();

    const wordSeconds = (countWords(plainText) / WORDS_PER_MINUTE) * 60;

    const totalSeconds =
        wordSeconds + imageSeconds + codeSeconds + tableSeconds + embedSeconds;

    const minutes = Math.max(
        1,
        Math.ceil(Math.max(totalSeconds, MIN_SECONDS) / 60),
    );

    return `${minutes} min read`;
};