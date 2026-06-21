const getKeyboardDistance = (word) => {
    const w = word.toLowerCase();
    const layout = {
        'q': [0, 0], 'w': [1, 0], 'e': [2, 0], 'r': [3, 0], 't': [4, 0], 'y': [5, 0], 'u': [6, 0], 'i': [7, 0], 'o': [8, 0], 'p': [9, 0],
        'a': [0.2, 1], 's': [1.2, 1], 'd': [2.2, 1], 'f': [3.2, 1], 'g': [4.2, 1], 'h': [5.2, 1], 'j': [6.2, 1], 'k': [7.2, 1], 'l': [8.2, 1],
        'z': [0.5, 2], 'x': [1.5, 2], 'c': [2.5, 2], 'v': [3.5, 2], 'b': [4.5, 2], 'n': [5.5, 2], 'm': [6.5, 2]
    };

    if (w.length <= 1) return 0.0;

    let totalDist = 0.0;
    let count = 0;
    for (let i = 0; i < w.length - 1; i++) {
        const c1 = w[i];
        const c2 = w[i + 1];
        if (layout[c1] && layout[c2]) {
            const dx = layout[c1][0] - layout[c2][0];
            const dy = layout[c1][1] - layout[c2][1];
            totalDist += Math.sqrt(dx * dx + dy * dy);
            count++;
        }
    }

    return count > 0 ? (totalDist / count) : 0.0;
};

const isGibberishWord = (word) => {
    const len = word.length;
    if (len === 0) return false;

    // 1. Length 1
    if (len === 1) {
        return !['a', 'i', 'o'].includes(word);
    }

    // 2. Length 2
    if (len === 2) {
        const validShorts2 = ['ac', 'tv', 'ng', 'ok', 'hi', 'go', 'no', 'my', 'by', 'to', 'in', 'on', 'at', 'an', 'as', 'he', 'we', 'me', 'us', 'up', 'so', 'do', 'if', 'of', 'or', 'is', 'it', 'am'];
        if (validShorts2.includes(word)) {
            return false;
        }
        return !/[aeiouy]/i.test(word);
    }

    // 3. Length 3
    if (len === 3) {
        const exactKeysmashes3 = [
            'asd', 'qwe', 'zxc', 'fgh', 'hjk', 'iop', 'jkl', 'dfg', 'xcv', 'rty', 'cvb', 'bnm', 'xyz',
            'yui', 'tyu', 'wer', 'ert', 'sdf', 'ghj', 'vbn', 'sds', 'sde', 'fgd', 'gfd', 'hgf', 'fds', 'dsa'
        ];
        if (exactKeysmashes3.includes(word)) {
            return true;
        }
        if (!/[aeiouy]/i.test(word)) {
            return true;
        }
    }

    // 3.5 Forbidden keysmash substrings check (for length >= 3)
    const forbiddenSubstrings = [
        'plm', 'okn', 'ijn', 'uhb', 'ygv', 'tfc', 'rdx', 'esz', 'waq', 'qaz', 'wsx', 'rfv', 'tgb', 'yhn', 'ujm',
        'zxc', 'xcv', 'cvb', 'vbn', 'bnm', 'mnb', 'nbv', 'bvc', 'vcx', 'cxz',
        'sdf', 'fgh', 'hjk', 'jkl', 'lkj', 'kjh', 'jhg', 'hgf', 'gfd', 'fds', 'dsa',
        'qwe', 'tyu', 'yui', 'oiu', 'ewq'
    ];
    for (const sub of forbiddenSubstrings) {
        if (word.includes(sub)) {
            return true;
        }
    }

    // 4. Repetition / Periodic Check
    const double = word + word;
    const periodLen = double.indexOf(word, 1);
    if (periodLen !== -1 && periodLen < len) {
        const period = word.substring(0, periodLen);
        if (isGibberishWord(period)) {
            return true;
        }
    }

    // 5. Row-based checks
    // Home row only
    if (/^[asdfghjkl]+$/i.test(word)) {
        const homeRowWhitelist = ['salamat', 'salsal', 'gasgas', 'glass', 'flask', 'shall', 'salad', 'flash', 'slash', 'galahs', 'alfalfa', 'shashlik', 'falls', 'flags', 'halls', 'flasks', 'salads', 'glad', 'fall', 'gall', 'hall', 'alas', 'half', 'flag', 'gash', 'lash', 'sash', 'flak', 'dahl', 'hala', 'sasa', 'laga', 'daga', 'lala', 'gaga', 'haha', 'lads', 'fags', 'gags', 'lags', 'hash', 'dash', 'ash', 'ask', 'has', 'had', 'add', 'all', 'gal', 'lag', 'sag', 'gas', 'fad', 'ala', 'aha', 'las', 'sal', 'lad', 'dag'];
        if (len >= 3 && !homeRowWhitelist.includes(word)) {
            return true;
        }
    }
    // Top row only
    if (/^[qwertyuiop]+$/i.test(word)) {
        const topRowWhitelist = ['typewriter', 'proprietor', 'perpetuity', 'repertoire', 'territory', 'priority', 'property', 'poverty', 'pretty', 'purity', 'poetry', 'equity', 'writer', 'output', 'putter', 'potter', 'route', 'power', 'write', 'quiet', 'quite', 'outer', 'worry', 'tower', 'paper', 'prior', 'trite', 'puppy', 'piety', 'upper', 'wiper', 'pique', 'tuyor', 'tuyot', 'prey', 'port', 'pour', 'riot', 'root', 'pipe', 'uwi', 'opo', 'tuyo', 'puto', 'puri', 'turo', 'itoy', 'pity', 'rope', 'type', 'ripe', 'pure', 'true', 'tour', 'your', 'pore', 'poet', 'tore', 'peer', 'weep', 'quit', 'were', 'trip', 'prop', 'pope', 'wire', 'tire', 'wore', 'yeti', 'wipe', 'rite', 'ryot', 'troy', 'typo', 'writ', 'weir', 'reap', 'perp', 'prow', 'tipe', 'out', 'our', 'you', 'try', 'put', 'toy', 'pot', 'top', 'row', 'wet', 'rye', 'toe', 'tie', 'pit', 'pet', 'pie', 'tip', 'per', 'pro', 'pew', 'weo', 'ryo', 'yup'];
        if (len >= 3 && !topRowWhitelist.includes(word)) {
            return true;
        }
    }
    // Bottom row only
    if (/^[zxcvbnm]+$/i.test(word)) {
        if (len >= 3 && word !== 'baba' && word !== 'mmm') {
            return true;
        }
    }

    // 6. Keyboard distance check
    const dist = getKeyboardDistance(word);
    if (dist <= 1.3 && len >= 3) {
        const leftHandWhitelist = ['sewer', 'referee', 'defer', 'dress', 'free', 'feed', 'seed', 'weed', 'steer', 'street', 'reed', 'deer', 'fees', 'sees', 'assert', 'estate', 'arrest', 'fever', 'newer', 'severe', 'secret', 'create', 'decree', 'desert', 'exert', 'drew', 'crew', 'grew', 'screw', 'stew', 'sweet', 'sweat', 'swear', 'see', 'ref', 'red', 'fed', 'few', 'wed', 'dew', 'ere', 'err', 'res', 'sex', 'fee', 'was'];
        if (!leftHandWhitelist.includes(word)) {
            return true;
        }
    }

    // 7. Consonant clusters
    const consecutiveConsonants = word.match(/[^aeiouy]{5,}/gi);
    if (consecutiveConsonants) {
        const allowedConsWords = ['strength', 'length', 'catchphrase', 'watchstrap', 'nightshift', 'poststructural', 'warmth', 'months'];
        if (!allowedConsWords.some(w => word.includes(w))) {
            return true;
        }
    }

    // 8. Vowel ratio
    if (len >= 7) {
        const vowelsCount = (word.match(/[aeiouy]/gi) || []).length;
        if (vowelsCount <= 1) {
            const allowedOneVowel = ['strengths', 'lengths', 'springs', 'strings', 'shrimps', 'shrinks', 'sprints', 'flights', 'knights'];
            if (!allowedOneVowel.includes(word)) {
                return true;
            }
        }
    }

    return false;
};

export const isGibberish = (text) => {
    if (!text || typeof text !== 'string') return false;

    // Normalize censored/masked words (e.g. f**k, s**t, ****) to a valid placeholder
    let normalizedText = text.replace(/\b[a-z]*\*+[a-z]*\b/gi, 'censor');
    normalizedText = normalizedText.replace(/\*+/g, 'censor');
    normalizedText = normalizedText.replace(/\[[^\]]*censor[^\]]*\]/gi, 'censor');

    const cleanText = normalizedText.trim().toLowerCase();
    if (!cleanText) return false;

    if (cleanText.length < 3) {
        const validShorts = ['ac', 'tv', 'ng', 'ok', 'hi', 'go', 'no', 'my', 'by', 'to', 'in', 'on', 'at', 'an', 'as', 'he', 'we', 'me', 'us', 'up', 'so', 'do', 'if', 'of', 'or', 'is', 'it', 'am'];
        if (!validShorts.includes(cleanText)) {
            return true;
        }
    }

    if (/(.)\1{3,}/.test(cleanText)) {
        return true;
    }

    const words = cleanText.replace(/[^a-z\s]/gi, '').split(/\s+/).filter(Boolean);
    if (words.length === 0) {
        return true;
    }

    let gibberishWordCount = 0;
    for (const word of words) {
        if (isGibberishWord(word)) {
            gibberishWordCount++;
        }
    }

    const totalWords = words.length;
    if (totalWords === 1 && gibberishWordCount >= 1) {
        return true;
    }
    if (totalWords > 1 && (gibberishWordCount / totalWords) >= 0.4) {
        return true;
    }

    return false;
};
