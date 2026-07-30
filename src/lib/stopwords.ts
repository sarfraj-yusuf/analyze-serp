export const STOP_WORDS = new Set([
  // ── Standard English stop words ──
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he',
  'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i',
  'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you',
  'your', 'yours', 'yourself', 'yourselves',

  // ── Contractions with apostrophes (for non-stripped text paths) ──
  'aren\'t', 'can\'t', 'couldn\'t', 'didn\'t', 'doesn\'t', 'don\'t', 'hadn\'t', 'hasn\'t', 'haven\'t',
  'he\'d', 'he\'ll', 'he\'s', 'here\'s', 'how\'s', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'isn\'t', 'it\'s',
  'let\'s', 'mustn\'t', 'shan\'t', 'she\'d', 'she\'ll', 'she\'s', 'shouldn\'t', 'that\'s', 'there\'s',
  'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'wasn\'t', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve',
  'weren\'t', 'what\'s', 'when\'s', 'where\'s', 'who\'s', 'won\'t', 'wouldn\'t', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve',

  // ── Apostrophe-free contraction variants (matched after tokenizer strips apostrophes) ──
  'arent', 'cant', 'couldnt', 'didnt', 'doesnt', 'dont', 'hadnt', 'hasnt', 'havent',
  'hed', 'hell', 'hes', 'heres', 'hows', 'id', 'ill', 'im', 'ive', 'isnt', 'lets',
  'mustnt', 'shant', 'shed', 'shell', 'shes', 'shouldnt', 'thats', 'theres',
  'theyd', 'theyll', 'theyre', 'theyve', 'wasnt', 'wed', 'well', 'were', 'weve',
  'werent', 'whats', 'whens', 'wheres', 'whos', 'wont', 'wouldnt', 'youd', 'youll',
  'youre', 'youve',

  // ── Orphaned contraction fragments (leaked when apostrophes are split into separate tokens) ──
  've', 're', 'll', 'd', 's', 'm', 't',

  // ── Common web UI / boilerplate words ──
  'read', 'click', 'share', 'tweet', 'comment',
  'menu', 'search', 'home', 'privacy', 'policy', 'terms', 'service', 'copyright', 'rights', 'reserved',
]);
